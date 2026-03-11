import { Router } from 'express'
import { autehnticateToken } from '../middleware/auth.ts'

const router = Router()

// JWT auth
router.use(autehnticateToken)

// route - /me
router.get('/', (req, res) => {
    res.status(200).json({message: "Returns current user profile"})
})

router.patch('/', (req, res) => {
    res.json({ message: "update profile"})
})

router.get('/attendance', (req, res) => {
    res.status(200).json({ message: "Returns attendace history"})
})

router.post('/leave-request', (req, res) => {
    res.status(201).json({ message: "leave request submitted"})
})

export default router 