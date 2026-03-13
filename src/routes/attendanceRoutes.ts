import { Router } from 'express'
import type { Response, Request } from 'express'
import { authenticateToken } from '../middleware/auth.ts'

const scheduleAttendanceRouter = Router({ mergeParams: true })

interface Params {
    deptId: string,
    sessionId: string,
    scheduleId: string
}

// POST /api/schedules/:scheduleId/attendance/check-in - User marks themselves present
scheduleAttendanceRouter.post('/check-in', (req:Request<Params>, res: Response) => {
    const { scheduleId } = req.params
    res.status(201).json({ 
        message: `Check-in recorded for schedule ${scheduleId}`,
        scheduleId: scheduleId,
        // access: 'Registered user (self only) or device integration',
        // requiredFields: ['verifiedBy'], // 'face', 'fingerprint', 'manual'
        // optionalFields: ['checkInTime'], // defaults to now
        // note: 'Duplicate check-ins prevented per user per schedule'
    })
})

// Coordinator handles failed biometric
scheduleAttendanceRouter.post('/verify-exception', (req:Request<Params>, res:Response) => {
    const { scheduleId } = req.params
    res.status(200).json({ 
        message: `Alt verificaiton for schedule ${scheduleId} when biometrics fail`,
        scheduleId: scheduleId,
        // access: 'Session coordinator only (assigned to this session)',
        // requiredFields: ['userId', 'verificationMethod'],
        // optionalFields: ['notes'],
        // note: 'Used when biometric fails; creates attendance record manually'
    })
})

// List attendance for one schedule
scheduleAttendanceRouter.get('/', (req: Request<Params>, res:Response) => {
    const { scheduleId } = req.params
    res.status(200).json({ 
        message: `Returns attendance records for schedule ${scheduleId}`,
        scheduleId: scheduleId,
        // access: {
        //     admin: 'Full access',
        //     manager: 'All schedules in their department',
        //     coordinator: 'Only assigned sessions',
        //     user: 'Only their own record (filtered)'
        // // },
        // filters: ['status', 'verifiedBy'],
        // pagination: ['page', 'limit']
    })
})

// attendance for the whole department 
const departmentAttendanceRouter = Router({ mergeParams: true })

// GET /api/departments/:deptId/attendance - Aggregated attendance for whole department
departmentAttendanceRouter.get('/', (req: Request<Params>, res:Response) => {
    const { deptId } = req.params
    res.status(200).json({ 
        message: `Returns aggregated attendance for department ${deptId}`,
        departmentId: deptId,
        // access: 'Admin or department manager only',
        // filters: ['dateRange', 'sessionId', 'userId', 'status'],
        // includes: ['summary', 'details'],
        // summaryFields: ['totalPresent', 'totalAbsent', 'totalLate', 'attendanceRate']
    })
})


//  For admin to modify single attendance
const attendanceRootRouter = Router()

attendanceRootRouter.use(authenticateToken)

// PATCH /api/attendance/:attendanceId - Admin forced modification (highly restricted)
attendanceRootRouter.patch('/:attendanceId', (req, res) => {
    const { attendanceId } = req.params
    res.status(200).json({ 
        message: `Attendance record ${attendanceId} modified`,
        attendanceId: attendanceId,
        // access: 'ADMIN ONLY - heavily audited',
        // requiredFields: ['reason'], // audit reason required
        // updatableFields: ['checkInTime', 'checkOutTime', 'status', 'verifiedBy'],
        // note: 'All modifications are logged in audit trail with timestamp and admin ID'
    })
})


export { scheduleAttendanceRouter, departmentAttendanceRouter, attendanceRootRouter }
export default scheduleAttendanceRouter