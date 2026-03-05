import { Router } from 'express'
import type { Request, Response } from 'express'
import scheduleAttendanceRouter from './attendanceRoutes.ts'

// // sth like 
// GET    /schedules/:scheduleId/attendance
// POST   /schedules/:scheduleId/attendance   (for check‑in)
// PUT    /schedules/:scheduleId/attendance/:attendanceId   (for check‑out or updates)

const schedulesRouter = Router({mergeParams: true})

interface Params {
    deptId: string,
    sessionId: string,
    scheduleId: string
}

// GET /api/departments/:deptId/sessions/:sessionId/schedules - List all schedules for a session
schedulesRouter.get('/', (req: Request<Params>, res: Response) => {
    const { deptId, sessionId } = req.params
    res.status(200).json({ 
        message: `Returns all scheduled occurrences for session ${sessionId} in department ${deptId}`,
        departmentId: deptId,
        sessionId: sessionId,
        // access: {
        //     admin: 'Full access',
        //     manager: 'Full access for their department',
        //     coordinator: 'View only for assigned sessions',
        //     user: 'View only for enrolled sessions'
        // },
        // filters: ['startDate', 'endDate', 'location', 'upcoming', 'past'],
    })
})

// Get one schedule occurrence
schedulesRouter.get('/:scheduleId', (req: Request<Params>, res: Response) => {
    const { deptId, sessionId, scheduleId } = req.params
    res.status(200).json({ 
        message: `Returns details for schedule ${scheduleId} of session ${sessionId}`,
        departmentId: deptId,
        sessionId: sessionId,
        scheduleId: scheduleId,
        // includes: ['startTime', 'endTime', 'location', 'isRecurring', 'recurrenceRule', 'createdAt']
    })
})

// Create one-time or recurring schedule
schedulesRouter.post('/', (req: Request<Params>, res: Response) => {
    const { deptId, sessionId } = req.params
    res.status(201).json({ 
        message: `Schedule created for session ${sessionId} in department ${deptId}`,
        departmentId: deptId,
        sessionId: sessionId,
        // requiredFields: ['startTime', 'endTime'],
        // optionalFields: ['location', 'isRecurring', 'recurrenceRule'],
        // access: 'Admin or department manager only'
    })
})

// Update schedule
schedulesRouter.patch('/:scheduleId', (req: Request<Params>, res: Response) => {
    const { deptId, sessionId, scheduleId } = req.params
    res.status(200).json({ 
        message: `Schedule ${scheduleId} for session ${sessionId} updated`,
        departmentId: deptId,
        sessionId: sessionId,
        scheduleId: scheduleId,
        updatableFields: ['startTime', 'endTime', 'location', 'isRecurring', 'recurrenceRule'],
        // access: 'Admin or department manager only'
    })
})

// DELETE /api/departments/:deptId/sessions/:sessionId/schedules/:scheduleId - Delete/cancel schedule
schedulesRouter.delete('/:scheduleId', (req:Request<Params>, res: Response) => {
    const { deptId, sessionId, scheduleId } = req.params
    res.status(200).json({ 
        message: `Schedule ${scheduleId} for session ${sessionId} cancelled`,
        departmentId: deptId,
        sessionId: sessionId,
        scheduleId: scheduleId,
        // note: 'Cancelling a schedule does not delete attendance records',
        // access: 'Admin or department manager only'
    })
})

// Generate recurring occurrences
schedulesRouter.post('/generate-recurring', (req: Request<Params>, res:Response) => {
    const { deptId, sessionId } = req.params
    res.status(201).json({ 
        message: `Recurring schedules generated for session ${sessionId}`,
        departmentId: deptId,
        sessionId: sessionId,
        // requiredFields: ['recurrenceRule', 'startDate', 'endDate'],
        // optionalFields: ['daysOfWeek', 'time', 'location'],
        // note: 'Creates multiple schedule instances based on recurrence pattern',
        // access: 'Admin or department manager only'
    })
})

schedulesRouter.use('/:scheduleId/attendance', scheduleAttendanceRouter)

export {schedulesRouter}
export default schedulesRouter