import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.ts'
import * as profileController from '../controllers/profile.controller.ts'

const router = Router()

// JWT auth
router.use(authenticateToken)

// route - /me
router.get('/', profileController.getUserData)

// this works but we need to set security measures on what can be updated by user cause i just updated my role 
router.patch('/', profileController.updateProfile)

router.get('/attendance', (req, res) => {
    res.status(200).json({ message: "Returns attendace history"})
})

router.post('/leave-request', (req, res) => {
    res.status(201).json({ message: "leave request submitted"})
})

export default router 