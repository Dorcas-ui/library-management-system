# Library Management System

A library book catalog built with NestJS, Prisma and a hosted PostgreSQL database (Neon). This part of the project covers the data layer: the schema, the database connection and the seed data.

## Tech Stack

- NestJS (API)
- Prisma 6 (ORM)
- PostgreSQL hosted on Neon

## Project Structure

```
library-management-system/
├── README.md
└── api/
    ├── .env.example
    ├── prisma/
    │   ├── schema.prisma
    │   ├── seed.ts
    │   └── migrations/
    └── src/
        └── prisma/
            └── prisma.service.ts
```

## Setup

1. Clone the repository and go into the `api` folder:

   ```bash
   cd api
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your own Neon connection strings:

   ```bash
   copy .env.example .env
   ```

   - `DATABASE_URL` is the pooled connection string, used by the running app.
   - `DATABASE_URL_UNPOOLED` is the direct connection string, used by Prisma migrations.

3. Apply the migrations to your database:

   ```bash
   npx prisma migrate deploy
   ```

4. Seed the database with sample data (4 genres and 16 books):

   ```bash
   npx prisma db seed
   ```

The seed script deletes existing books and genres before inserting, so it is safe to run more than once.

## Data Model

- **Role** (enum): `PATRON` or `LIBRARIAN`
- **User**: `id`, unique `email`, `name`, and a `role` that defaults to `PATRON`
- **Genre**: `id`, unique `name`, and a list of its books
- **Book**: `id`, `title`, `author`, optional `isbn`, and a `genreId` that points to a genre

## Schema Decisions

**Why `Book` references `Genre` instead of embedding it**

Each `Book` stores a `genreId` foreign key that points to a row in the `Genre` table, rather than carrying a copy of the genre's details inside the book record. I chose this for four reasons:

1. **One source of truth.** A genre such as "Science" exists once. If it is renamed, I change one row and every book in that genre reflects it. With embedded copies, I would have to find and update every book, and a missed one would leave the data inconsistent.
2. **No duplicated data.** Embedding would repeat the genre name on every book. Storing a small integer id is cheaper and cannot drift out of sync.
3. **Integrity enforced by the database.** The foreign key means a book cannot point to a genre that does not exist, and a genre that still has books cannot be deleted by accident.
4. **Genres are queried on their own.** The library needs to list all genres and then browse the books in one. Because genres are their own table, that query is simple and does not require scanning every book.

The relationship is one-to-many: one genre has many books, and each book has exactly one genre. The `Genre` model holds the `books Book[]` list, which is only a Prisma convenience and creates no column. The real link is the `genreId` column on `Book`.

**Other decisions**

- `User.email` and `Genre.name` are `@unique` to prevent duplicate accounts and duplicate genres.
- `Book.isbn` is optional because not every book in a catalog has one on record.
- `Role` is an enum so the database only accepts `PATRON` or `LIBRARIAN`, and new users default to `PATRON`, the least privileged role.
- The datasource uses both a pooled `url` and a `directUrl`. Neon's pooled connection suits the running app, but migrations need a direct connection.

## Prisma vs. a Document Database

Modeling in Prisma felt different because the relationship has to be declared up front. In a document database I could have nested the genre inside each book and moved on, but in Prisma I had to define `Genre` as its own model, add the `genreId` field and write the `@relation`. It felt stricter at first, but it means the database itself prevents bad data.
