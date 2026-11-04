// Starts `wrangler dev` using ports from the environment or the repo-root .env.
// Local D1 state is stored per API port so parallel instances never lock each other's SQLite files.
import { spawn, spawnSync } from "node:child_process";

try {
  process.loadEnvFile(new URL("../../../.env", import.meta.url)); // never overrides existing env vars
} catch {
  // no .env file: fall back to defaults
}

const { API_PORT = "8787", INSPECTOR_PORT = "9229", HOST = "127.0.0.1" } = process.env;
const persistTo = process.env.STATE_DIR ?? `.wrangler/state-${API_PORT}`;

const migrate = spawnSync("wrangler", ["d1", "migrations", "apply", "DB", "--local", "--persist-to", persistTo], {
  stdio: "inherit",
});
if (migrate.status !== 0) process.exit(migrate.status ?? 1);

const child = spawn(
  "wrangler",
  ["dev", "--ip", HOST, "--port", API_PORT, "--inspector-port", INSPECTOR_PORT, "--persist-to", persistTo, ...process.argv.slice(2)],
  { stdio: "inherit" },
);
child.on("exit", (code) => process.exit(code ?? 0));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
