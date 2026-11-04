#!/usr/bin/env node
// Manage isolated dev instances, one git worktree per feature.
//
//   node scripts/instance.mjs up <branch> [--base <ref>] [--no-start]   create worktree, pick free ports, install, start
//   node scripts/instance.mjs start <branch>                            start a stopped instance
//   node scripts/instance.mjs stop <branch>                             stop its servers
//   node scripts/instance.mjs down <branch> [--delete-branch]           stop and remove the worktree
//   node scripts/instance.mjs list                                      show instances, ports and status
import { execFileSync, spawn } from "node:child_process";
import { closeSync, copyFileSync, existsSync, mkdirSync, openSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORKTREES = process.env.INSTANCE_DIR ?? path.join(REPO, ".worktrees");
const MIN_NODE = [22, 23, 4];

const die = (message) => {
  console.error(`error: ${message}`);
  process.exit(1);
};
const git = (...args) => execFileSync("git", ["-C", REPO, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const slug = (branch) => branch.replace(/[^A-Za-z0-9._-]/g, "-");
const dirFor = (branch) => path.join(WORKTREES, slug(branch));

function checkNode() {
  const current = process.versions.node.split(".").map(Number);
  const diff = current.map((n, i) => n - MIN_NODE[i]).find((d) => d !== 0) ?? 0;
  if (diff < 0) die(`Node >= ${MIN_NODE.join(".")} required (found ${process.versions.node}). Switch Node first, e.g. 'fnm use 24' or 'nvm use 24'.`);
}

function readEnv(wt) {
  const file = path.join(wt, ".env");
  if (!existsSync(file)) return {};
  return Object.fromEntries(
    readFileSync(file, "utf8").split("\n").filter((l) => l.includes("=")).map((l) => l.split("=", 2)),
  );
}

const canBind = (port, host) =>
  new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.listen(port, host, () => server.close(() => resolve(true)));
  });
const portFree = async (port) => (await canBind(port, "127.0.0.1")) && (await canBind(port, "0.0.0.0"));

function claimedPorts() {
  const claimed = new Set();
  for (const line of git("worktree", "list", "--porcelain").split("\n")) {
    if (!line.startsWith("worktree ")) continue;
    const env = readEnv(line.slice("worktree ".length));
    for (const key of ["WEB_PORT", "API_PORT", "INSPECTOR_PORT"]) if (env[key]) claimed.add(Number(env[key]));
  }
  return claimed;
}

async function pickPorts() {
  const claimed = claimedPorts();
  for (let i = 0; i < 100; i++) {
    const ports = { WEB_PORT: 4400 + i, API_PORT: 8800 + i, INSPECTOR_PORT: 9300 + i };
    const values = Object.values(ports);
    if (values.some((p) => claimed.has(p))) continue;
    if ((await Promise.all(values.map(portFree))).every(Boolean)) return ports;
  }
  return die("no free port triple found");
}

function listeners(port) {
  try {
    return execFileSync("lsof", ["-tiTCP:" + port, "-sTCP:LISTEN"], { encoding: "utf8" }).split("\n").filter(Boolean).map(Number);
  } catch {
    return [];
  }
}

const groupsFile = (wt) => path.join(wt, ".instance", "pgids");
const readGroups = (wt) => (existsSync(groupsFile(wt)) ? readFileSync(groupsFile(wt), "utf8").split("\n").filter(Boolean).map(Number) : []);

async function stopServers(wt) {
  const env = readEnv(wt);
  const ports = ["WEB_PORT", "API_PORT", "INSPECTOR_PORT"].map((k) => Number(env[k])).filter(Boolean);
  // Kill whole process groups first: supervisors like wrangler respawn workerd if only the listener dies.
  // Port listeners are still killed, for servers that detach from their group (the astro dev daemon).
  const groupAlive = (pgid) => {
    try {
      process.kill(-pgid, 0);
      return true;
    } catch {
      return false;
    }
  };
  const running = () => ({ groups: readGroups(wt).filter(groupAlive), pids: ports.flatMap(listeners) });
  for (const signal of ["SIGTERM", "SIGKILL"]) {
    const { groups, pids } = running();
    if (groups.length === 0 && pids.length === 0) break;
    for (const target of [...groups.map((g) => -g), ...pids]) {
      try {
        process.kill(target, signal);
      } catch {}
    }
    for (let i = 0; i < 20; i++) {
      const left = running();
      if (left.groups.length === 0 && left.pids.length === 0) break;
      await sleep(250);
    }
  }
  rmSync(groupsFile(wt), { force: true });
}

function launch(wt, script, logName) {
  const fd = openSync(path.join(wt, ".instance", logName), "w");
  const child = spawn("npm", ["run", script], { cwd: wt, detached: true, stdio: ["ignore", fd, fd] });
  closeSync(fd);
  // detached makes the child a process-group leader, so its pid is the group id
  writeFileSync(groupsFile(wt), [...readGroups(wt), child.pid].join("\n") + "\n");
  let failed = false;
  // A clean exit is not a failure: astro dev daemonizes and its launcher exits 0 once the server is up.
  child.on("exit", (code) => (failed = code !== 0));
  child.unref();
  return () => failed;
}

async function waitFor(url, hasExited, name, wt) {
  for (let i = 0; i < 180; i++) {
    try {
      if ((await fetch(url, { signal: AbortSignal.timeout(2000) })).ok) return;
    } catch {}
    if (hasExited()) die(`${name} exited early, see ${path.join(wt, ".instance", name + ".log")}`);
    await sleep(500);
  }
  die(`${name} did not come up, see ${path.join(wt, ".instance", name + ".log")}`);
}

async function startServers(wt) {
  checkNode();
  const env = readEnv(wt);
  await stopServers(wt); // clear leftovers so the ports are free
  mkdirSync(path.join(wt, ".instance"), { recursive: true });
  const apiExited = launch(wt, "dev:api", "api.log");
  const webExited = launch(wt, "dev:web", "web.log");
  await Promise.all([
    waitFor(`http://localhost:${env.API_PORT}/api/health`, apiExited, "api", wt),
    waitFor(`http://localhost:${env.WEB_PORT}/`, webExited, "web", wt),
  ]);
  console.log(`  web: http://localhost:${env.WEB_PORT}`);
  console.log(`  api: http://localhost:${env.API_PORT}   (inspector: ${env.INSPECTOR_PORT})`);
  console.log(`  logs: ${path.join(wt, ".instance")}/`);
}

function requireInstance(branch, usage) {
  if (!branch) die(`usage: ${usage}`);
  const wt = dirFor(branch);
  if (!existsSync(wt)) die(`no instance at ${wt}`);
  return wt;
}

async function up(branch, flags) {
  if (!branch) die("usage: up <branch> [--base <ref>] [--no-start]");
  const baseIndex = flags.indexOf("--base");
  const base = baseIndex >= 0 ? flags[baseIndex + 1] : "main";
  const noStart = flags.includes("--no-start");
  checkNode();
  const wt = dirFor(branch);
  if (existsSync(wt)) die(`${wt} already exists (use 'start ${branch}' or 'down ${branch}')`);
  mkdirSync(WORKTREES, { recursive: true });
  const branchExists = (() => {
    try {
      git("show-ref", "--verify", "--quiet", `refs/heads/${branch}`);
      return true;
    } catch {
      return false;
    }
  })();
  if (branchExists) git("worktree", "add", "-q", wt, branch);
  else git("worktree", "add", "-q", "-b", branch, wt, base);

  const ports = await pickPorts();
  writeFileSync(path.join(wt, ".env"), Object.entries(ports).map(([k, v]) => `${k}=${v}`).join("\n") + "\n");
  // Secrets are git-ignored: reuse the main checkout's, else start from the example.
  const vars = path.join(REPO, "server/api/.dev.vars");
  copyFileSync(existsSync(vars) ? vars : path.join(wt, "server/api/.dev.vars.example"), path.join(wt, "server/api/.dev.vars"));

  console.log(`Installing dependencies in ${wt} ...`);
  // Clone node_modules from the main checkout (instant on APFS), then let npm reconcile.
  if (existsSync(path.join(REPO, "node_modules"))) {
    try {
      execFileSync("cp", ["-Rc", path.join(REPO, "node_modules"), path.join(wt, "node_modules")], { stdio: "ignore" });
    } catch {}
  }
  try {
    execFileSync("npm", ["install", "--prefer-offline", "--no-audit", "--no-fund"], { cwd: wt, stdio: "ignore" });
  } catch {
    die(`npm install failed in ${wt}`);
  }
  console.log(`Instance '${branch}' ready`);
  if (noStart) console.log(`  ports: web ${ports.WEB_PORT}, api ${ports.API_PORT}, inspector ${ports.INSPECTOR_PORT} (run: node scripts/instance.mjs start ${branch})`);
  else await startServers(wt);
}

async function down(branch, flags) {
  const wt = requireInstance(branch, "down <branch> [--delete-branch]");
  await stopServers(wt);
  try {
    git("worktree", "remove", "--force", wt);
  } catch {}
  rmSync(wt, { recursive: true, force: true });
  git("worktree", "prune");
  if (flags.includes("--delete-branch")) git("branch", "-D", branch);
  console.log(`Removed '${branch}'${flags.includes("--delete-branch") ? " and its branch" : ""}`);
}

async function list() {
  if (!existsSync(WORKTREES)) return console.log("no instances");
  console.log(["INSTANCE".padEnd(32), "WEB".padEnd(6), "API".padEnd(6), "INSP".padEnd(6), "STATUS"].join(" "));
  for (const name of readdirSync(WORKTREES)) {
    const env = readEnv(path.join(WORKTREES, name));
    if (!env.API_PORT) continue;
    const status = (await portFree(Number(env.API_PORT))) ? "stopped" : "running";
    console.log([name.padEnd(32), env.WEB_PORT.padEnd(6), env.API_PORT.padEnd(6), env.INSPECTOR_PORT.padEnd(6), status].join(" "));
  }
}

const [command, branch, ...flags] = process.argv.slice(2);
switch (command) {
  case "up": await up(branch, flags); break;
  case "start": console.log(`Starting '${branch}'`); await startServers(requireInstance(branch, "start <branch>")); break;
  case "stop": await stopServers(requireInstance(branch, "stop <branch>")); console.log(`Stopped '${branch}'`); break;
  case "down": await down(branch, flags); break;
  case "list": await list(); break;
  default:
    console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 8).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
    process.exit(1);
}
