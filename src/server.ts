import express from 'express'
import authRouter from './routes/authRoutes.ts'
import profileRouter from './routes/profileRoutes.ts'
import usersRouter from './routes/userRoutes.ts'

const app = express()

app.get('/health' , (req, res) =>{
    res.status(200).json({
        status: 'OK',
        message:'working',
        timestamp: new Date().toISOString(),
    })
})

app.use('/api/auth', authRouter)
app.use('/me', profileRouter)
app.use('/api/users', usersRouter)

app.use('/api/departments')



export {app}

export default app