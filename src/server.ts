import express from 'express'
import authRouter from './routes/authRoutes.ts'
import profileRouter from './routes/profileRoutes.ts'
import usersRouter from './routes/userRoutes.ts'
import departmentsRouter from './routes/departmentRoutes.ts'
import rolesRouter from './routes/roleRoutes.ts'
import { attendanceRootRouter } from './routes/attendanceRoutes.ts'
import { isTest } from '../env.ts'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'


const app = express()
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('dev', {
    skip: () => isTest(),
}))


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

app.use('/api/departments',departmentsRouter)
app.use('/api/attendance', attendanceRootRouter)
app.use('/api/roles', rolesRouter)


export {app}

export default app