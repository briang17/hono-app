import {drizzle} from "drizzle-orm/node-postgres";
import {databaseEnv as env} from "@packages/env";
import {Pool} from "pg";


const DATABASE_URL = `postgres://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`
const pool = new Pool({
  connectionString: DATABASE_URL
});

const db = drizzle({client: pool});

async function checkLife() {
  const connection = await pool.connect();

  const result = await connection.query("select 1 as isAlive");

  connection.release()
  console.log(result.rows);
  process.exit();
}

if(Bun.argv.includes("--check-life")) {

  checkLife();
}


export {
  db
}