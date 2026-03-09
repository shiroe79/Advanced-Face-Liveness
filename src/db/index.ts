// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema.ts'
import { env, isProd } from '../../env.ts'
import { remember } from '@epic-web/remember'


const createPool = () => {
  return new Pool({
    connectionString: env.DATABASE_URL,
    idleTimeoutMillis: 30000,
  })
}

let client
if (isProd()) {
  client = createPool()
} else {
  client = remember('dbPool', () => createPool())
}

export const db = drizzle({client, schema,
  // // logger when in development (check the terminal)
  // logger: env.NODE_ENV === 'development',
})

export default db

// type check thoughout the code 
export type DB = typeof db
export * from './schema.ts'