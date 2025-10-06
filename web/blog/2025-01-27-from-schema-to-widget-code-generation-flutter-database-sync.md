---
slug: from-schema-to-widget-code-generation-flutter-database-sync
title: "From Schema to Widget: How Code Generation Keeps Your Database and Flutter App in Sync"
authors: [juanleon]
tags: [flutter, code-generation, database, protobuf, graphql, ferry]
image: https://i.imgur.com/mErPwqL.png
---

# From Schema to Widget: How Code Generation Keeps Your Database and Flutter App in Sync

Every Flutter developer has faced this problem:

You add a new field to your database, then you need to update your API, then your Flutter models, and finally your UI. Somewhere in that process, you forget a type, mistype a key, or miss a migration. Suddenly, your app compiles but crashes at runtime.

This happens because we lack a \***\*single source of truth\*\***. Our app and our database often live in separate worlds, and we’re the bridge that constantly tries to keep them aligned.

But what if we could remove that friction? What if the database schema itself could generate our app code? That’s the power of \***\*code generation\*\***.

---

## The Pain: Duplication Everywhere

When working on apps, I kept running into the same issues:

- I had to \***\*duplicate code\*\*** between backend and frontend.

- A schema change meant \***\*manual updates\*\*** in multiple places.

- There was no \***\*single source of truth\*\***.

It felt like I was solving the same problem twice (or more).

---

## The Idea: A Single Source of Truth

Instead of duplicating models, we define our schema once and let tools generate code for us. That way:

- The database schema drives the app models.

- Any change propagates automatically.

- The risk of “out of sync” disappears.

Depending on your database, the approach changes a little.

---

## Firestore + Protobuf

Firestore is flexible but also risky: it doesn’t enforce schemas. That’s great for prototyping, but in production you need structure.

This is where \***\*Protobuf (Protocol Buffers)\*\*** comes in:

- You define your models in `.proto` files.

- Protobuf generates code automatically for \***\*Dart\*\*** and also for \***\*TypeScript\*\*** (and other languages).

- This means you can use the \***\*same models\*\*** in your Flutter app and in your backend (e.g., \***\*Cloud Functions\*\*** or any Node.js service).

- Serialization is efficient — smaller and faster than JSON.

\***\*Example schema:\*\***

```protobuf
syntax = "proto3";

message User {
	string id = 1;
	string name = 2;
	int32 age = 3;
}
```

From this `.proto` you can generate:

- In Dart (for your Flutter app):

```dart
final user = User()
	..id = "123"
	..name = "Juanjo"
	..age = 28;
```

- In TypeScript (for Cloud Functions or backend):

```ts
const user = <User>{
	id: "123",
	name: "Juanjo",
	age: 28,
});
```

This way, your frontend and backend share the \***\*same contract\*\***: no duplicated models, and any schema change propagates automatically.

---

## Postgres + pg_graphql + Ferry

If you’re in the SQL world, things get even better. Postgres has a hidden gem: \***\*pg_graphql\*\***, an extension that turns your tables into a GraphQL API instantly.

Here’s how the flow looks:

1. You define your schema in Postgres (tables, relations, constraints).

2. `pg_graphql` exposes that schema as a GraphQL endpoint.

3. In Flutter, you use \***\*Ferry\*\***, a GraphQL client with code generation.

\***\*Example query:\*\***

```graphql
query GetUsers {
  usersCollection {
    edges {
      node {
        id
        email
        phone
        auth_uid
        created_at
      }
    }
  }
}
```

Ferry generates Dart code for that query. Then, in Flutter, you just do:

```dart

final req = GGetUsersReq();

client.request(req).listen((result) {

final users = result.data?.users;

});

```

No manual mapping. No fragile strings. If your schema changes, your Flutter code won’t even compile until you update it. That’s type safety at its best.

---

## The Bonus: Caching & Performance

Another advantage of this setup: once your schema drives your client, you also get \***\*query optimization and caching\*\*** for free.

- Ferry normalizes your GraphQL responses.

- Supabase (or raw Postgres) handles efficient queries.

- Your app stays fast and consistent without extra effort.

---

## Wrapping Up

Whether you’re on Firestore or Postgres, the principle is the same:

- \***\*Define your schema once.\*\***

- \***\*Generate your app code automatically.\*\***

- \***\*Stop duplicating logic.\*\***

For Firestore → use \***\*Protobuf\*\***.

For SQL (Postgres) → use \***\*pg_graphql + Ferry\*\***.

The result? A faster development cycle, fewer bugs, and a database and app that never fall out of sync.

At the end of the day, code generation isn’t about fancy tooling — it’s about freeing you from boilerplate so you can focus on building real features.

If you want to see more details about this topic, you can see my talk in FlutterConfLatam 2025 in this link: https://youtu.be/6VJJNjSuXgo?t=26877
