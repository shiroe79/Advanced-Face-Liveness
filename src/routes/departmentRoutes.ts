import { Router } from "express"
import sessionsRoutes from './sessionRoutes.ts'
import { departmentAttendanceRouter } from "./attendanceRoutes.ts"
import { authenticateToken } from "../middleware/auth.ts"


const departmentsRouter = Router()
departmentsRouter.use(authenticateToken)

// List all departments (admin only)
departmentsRouter.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Returns list of all departments',
        // filters: [ 'search'],
    })
})

// Get one department detail
departmentsRouter.get('/:deptId', (req, res) => {
    const { deptId } = req.params
    res.status(200).json({ 
        message: `Returns details for department ${deptId}`,
        departmentId: deptId,
        // access: 'Admin and department manager of this department'
    })
})

//  Update department (admin only)
departmentsRouter.patch('/:deptId', (req, res) => {
    const { deptId } = req.params
    res.status(200).json({ 
        message: `Department ${deptId} updated successfully`,
        // updatableFields: ['name', 'description', 'managerId'],
    })
})

// Archive/deactivate department (admin only)
departmentsRouter.delete('/:deptId', (req, res) => {
    const { deptId } = req.params
    res.status(200).json({ 
        message: `Department ${deptId} archived successfully`,
    })
})

// List users in this department
departmentsRouter.get('/:deptId/users', (req, res) => {
    const { deptId } = req.params
    res.status(200).json({ 
        message: `Returns list of users in department ${deptId}`,
        departmentId: deptId,
        // access: 'Admin and department manager of this department',
        // filters: ['role', 'active'],
    })
})


// mounting sessions
departmentsRouter.use('/:deptId/sessions', sessionsRoutes)
departmentsRouter.use('/:deptId/attendance', departmentAttendanceRouter)

export { departmentsRouter }
export default departmentsRouter
