import {env as loadEnv} from 'custom-env'
import { z } from 'zod'


process.env.App_STAGE = process.env.App_STAGE || 'dev'

const isProduction = process.env.App_STAGE === 'production'
const isDevelopment = process.env.App_STAGE === 'dev'
const isTesting = process.env.App_STAGE === 'test'

if (isDevelopment) {
    loadEnv()
} else if (isTesting) {
    loadEnv('test')
}

// Now these are things we do after we get the env
const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),
    APP_STAGE: z.enum(['dev','test','production']).default('dev'),

    // Server configuration
    PORT: z.coerce.number().positive().default(3005),
    HOST: z.string().default('localhost'),

    // // Database
    // DATABASE_URL: z.string().startsWith('postgresql://'),

    // // JWT & Authentication
    // JWT_SECRET: z.string().min(32, 'Must be 32 chars long'),
    // JWT_EXPIRES_IN: z.string().default('7d'),
    
    // // secruity 
    // BCRYPT_ROUNDS: z.coerce.number().min(10).max(20).default(12),
})

// Type inference from schema
export type Env = z.infer<typeof envSchema>
let env: Env

try {
    env = envSchema.parse(process.env)
} catch (e) {
    if (e instanceof z.ZodError) {
        console.log('Invalid Enviroment Varaiable')
        console.error(JSON.stringify(e.flatten().fieldErrors, null, 2))

        e.issues.forEach((err) => {
            const path = err.path.join('.')
            console.log(`${path}: ${err.message}`)
        })
        process.exit(1)
    }
    throw e
}

export const isProd = () => env.APP_STAGE === 'production'
export const isDev = () => env.APP_STAGE === 'dev'
export const isTest = () => env.APP_STAGE === 'test'

export {env}
export default env