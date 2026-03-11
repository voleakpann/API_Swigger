# Deploying on Render

## Why "Connection refused" / "Exited with status 1"

The app tries to connect to PostgreSQL. On Render there is **no database on localhost**, so you must point it to **Render's PostgreSQL** using environment variables.

## Required: set these in Render

In your **Web Service** → **Environment** tab, add:

| Key | Value |
|-----|--------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<HOST>:5432/<DATABASE>?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | your Render PostgreSQL **user** |
| `SPRING_DATASOURCE_PASSWORD` | your Render PostgreSQL **password** |

### Where to get the values

1. In Render: **Dashboard** → your **PostgreSQL** database (create one if needed).
2. Copy **Internal Database URL** (for services in the same group) or **External Database URL**.
   - It looks like: `postgres://USER:PASSWORD@HOST/database?sslmode=require`
3. Convert to JDBC form for `SPRING_DATASOURCE_URL`:
   - Replace `postgres://` with `jdbc:postgresql://`
   - Keep the rest: `jdbc:postgresql://HOST/database?sslmode=require`
   - If the URL has a port (e.g. `:5432`), keep it: `jdbc:postgresql://HOST:5432/database?sslmode=require`
4. Use the same **USER** as `SPRING_DATASOURCE_USERNAME` and **PASSWORD** as `SPRING_DATASOURCE_PASSWORD`.

### Example

If Render shows:
`postgres://crud_user:abc123@dpg-xxxx-a.oregon-postgres.render.com/crud_db?sslmode=require`

Then set:

- **SPRING_DATASOURCE_URL** = `jdbc:postgresql://dpg-xxxx-a.oregon-postgres.render.com:5432/crud_db?sslmode=require`
- **SPRING_DATASOURCE_USERNAME** = `crud_user`
- **SPRING_DATASOURCE_PASSWORD** = `abc123`

Save and redeploy. The app will connect to Render's PostgreSQL and start correctly.
