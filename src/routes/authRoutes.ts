import { Router } from 'express'
import { login, register } from '../controllers/authController.ts'
import { validateBody } from '../middleware/validation.ts'
import { insertUserSchema } from '../db/schema.ts'
import {z} from 'zod'
import { authorize } from '../middleware/authorize.ts'
import { authenticateToken } from '../middleware/auth.ts'

const loginSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(1,'Password is required')
})


const router = Router()

// Auth routes
router.post('/register', validateBody(insertUserSchema), authenticateToken, authorize('admin'), register)

router.post('/login', validateBody(loginSchema), login)

router.post('/logout', (req, res) => {
    res.status(201).json({message: 'User logged out'})
})

router.post('/refresh', (req, res) => {
    res.status(201).json({message: 'Token refreshed'})
})


export default router