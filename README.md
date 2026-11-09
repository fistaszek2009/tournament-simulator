# Tournament simulator


## How to set up project?

This project is built with **SvelteKit**, uses **PostgreSQL** as the database, and **Drizzle ORM** for database access and migrations.

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL (Docker)

The project expects a local PostgreSQL instance.

You can start one quickly using Docker:

```bash
docker run --name sv-postgres \
  -e POSTGRES_USER=root \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=local \
  -p 5432:5432 \
  -d postgres
```

This will:

* create a database named `local`
* expose it on `localhost:5432`
* use `root / mysecretpassword` as credentials

To verify the container is running:

```bash
docker ps
```

### 3. Environment variables

Create a `.env` file in the root of the project:

```env
DATABASE_URL="postgres://root:mysecretpassword@localhost:5432/local"
```

Make sure the credentials match the ones used in the Docker command.

If you already have PostgreSQL running locally, you can adjust `DATABASE_URL` accordingly.


### 4. Run database migrations (Drizzle)

```bash
npm run db:generate
npm run db:migrate
```

This will create and apply the database schema.

### 5. Start the development server

```bash
npm run dev
```

By default, the app will be available at:

```
http://localhost:5173
```
