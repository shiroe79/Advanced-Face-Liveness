import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.ts'

const usersRouter = Router()

usersRouter.use(authenticateToken)

// get all users and might add filter here
usersRouter.get('/', (req, res) => {
    res.json({
        message: 'Get all users', 
        // filters: ['department', 'role', 'active', 'search']
    })
})

// get a single user
usersRouter.get('/:userId', (req, res) => {
    res.json({message: `Get user ${req.params.userId} details` })
})

// create a new user
usersRouter.post('/', (req, res) => {
    res.status(201).json({
        message: 'Create new user',
        // requiredFields: ['email', 'password', 'firstName', 'lastName', 'roleId', 'departmentId']
    })
})

// Update user (admin only)
usersRouter.patch('/:userId', (req, res) => {
    const { userId } = req.params
    res.status(200).json({ 
        message: `User ${userId} updated successfully`,
        // updatableFields: ['role', 'department', 'active', 'firstName', 'lastName', 'email']
    })
})


// // To update a user
// usersRouter.put('/:id', (req, res) => {
//     res.json({message: `Update user ${req.params.id}`})
// })

// Deactivate/delete user (admin only - soft delete)
usersRouter.delete('/:userId', (req, res) => {
    const { userId } = req.params
    res.status(200).json({ 
        message: `User ${userId} deactivated successfully`
    })
})

// Assign/change role (admin only)
usersRouter.post('/:userId/assign-role', (req, res) => {
    res.status(200).json({ 
        message: `Role assigned to user ${req.params.userId} successfully`,
        // requiredFields: ['roleId']
    })
})

export {usersRouter}
export default usersRouter