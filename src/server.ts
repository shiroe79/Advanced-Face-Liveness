import express from 'express'
import { router as authRouter } from './routes/authRoutes.ts'

const app = express()

app.get('/health' , (req, res) =>{
    res.status(200).json({
        status: 'OK',
        message:'working',
        timestamp: new Date().toISOString(),
    })
})

app.use('/api/auth', authRouter)


export {app}

export default app