import { Router } from 'express'
import type { Request, Response } from 'express'
import schedulesRouter from './schedulesRoutes.ts'

const sessionsRouter = Router({ mergeParams: true })

interface Params {
    deptId: string,
    sessionId: string
}

// GET /api/departments/:deptId/sessions - List all sessions in a department
sessionsRouter.get('/', (req: Request<Params>, res: Response) => {
    const {deptId}  = req.params // will fix the type later !!!!
    res.status(200).json({ 
        message: `Returns sessions in department ${deptId}`,
        departmentId: deptId,
        // access: {
        //     admin: 'Full list',
        //     manager: 'Full list for their department',
        //     coordinator: 'Only sessions they are assigned to'
        // },
        // filters: ['active', 'search'],
    })
})

// Get single session detail
sessionsRouter.get('/:sessionId', (req: Request<Params>, res: Response) => {
    const {deptId, sessionId}  = req.params
    res.status(200).json({ 
        message: `Returns details for session ${req.params.sessionId} in department ${deptId}`,
        departmentId: deptId,
        sessionId: sessionId,
        // includes: ['name', 'code', 'description', 'department', 'createdBy', 'createdAt', 'isActive']
    })
})

// Create new session or class - /api/departments/:deptId/sessions 
sessionsRouter.post('/', (req: Request<Params>, res: Response) => {
    const { deptId } = req.params
    res.status(201).json({ 
        message: `Session created in department ${deptId}`,
        departmentId: deptId,
        // requiredFields: ['name'],
        // optionalFields: ['code', 'description'],
        // access: 'Admin or department manager only'
    })
})

// Update session
sessionsRouter.patch('/:sessionId', (req: Request<Params>, res: Response) => {
    const { deptId, sessionId } = req.params
    res.status(200).json({ 
        message: `Session ${sessionId} in department ${deptId} updated`,
        departmentId: deptId,
        sessionId: sessionId,
        // updatableFields: ['name', 'code', 'description'],
        // access: 'Admin or department manager only'
    })
})

// DELETE /api/departments/:deptId/sessions/:sessionId - Archive/deactivate session
sessionsRouter.delete('/:sessionId', (req: Request<Params>, res: Response) => {
    const { deptId, sessionId } = req.params
    res.status(200).json({ 
        message: `Session ${sessionId} in department ${deptId} archived`,
        departmentId: deptId,
        sessionId: sessionId,
        // note: 'Session is marked as inactive but schedule history remains',
        // access: 'Admin or department manager only'
    })
})



// If we need to add sessions tab in ui
const sessionsRootRouter = Router()

// /api/sessions/assigned - List sessions where current user is coordinator
sessionsRootRouter.get('/assigned', (req, res) => {
    res.status(200).json({ 
        message: 'Returns sessions where current user is assigned as coordinator',
        // access: 'Authenticated user (returns only sessions they coordinate)',
        // filters: ['active', 'departmentId']
    })
})


sessionsRouter.use('/:sessionId/schedules', schedulesRouter)

export { sessionsRouter, sessionsRootRouter }
export default sessionsRouter
