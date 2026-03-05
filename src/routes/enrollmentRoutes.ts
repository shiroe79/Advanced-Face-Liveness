import { Router } from 'express'
import type { Response,Request } from 'express'
const enrollmentsRouter = Router({mergeParams: true})

interface Params {
    deptId: string,
    sessionId: string,
    scheduleId: string,
    userId: string
}

// List enrolled users for a session
enrollmentsRouter.get('/', (req:Request<Params>, res:Response) => {
    const {deptId, sessionId} = req.params
    res.status(200).json({
        message: `Return list of enrolled users for session ${sessionId} in department ${deptId}`,
        departmentId: deptId,
        sessionId: sessionId,
        // access: {
        //     admin: 'Full access',
        //     manager: 'Full access for their department',
        //     coordinator: 'View only for assigned sessions'
        // },
        // filters: ['role', 'active', 'search'],
        // includes: ['userId', 'name', 'email', 'enrolledAt']
    })
} ) 

// enroll one or many users
enrollmentsRouter.post('/', (req: Request<Params>, res: Response) => {
    const { deptId, sessionId } = req.params
    res.status(201).json({ 
        message: `Users enrolled in session ${sessionId}`,
        departmentId: deptId,
        sessionId: sessionId,
        // access: 'Admin or department manager only',
        // requestFormats: {
        //     single: { userId: 123 },
        //     bulk: { userIds: [123, 456, 789] }
        // },
        // note: 'Users must belong to the same department as the session'
    })
})

// Remove user from session
enrollmentsRouter.delete('/:userId', (req: Request<Params>, res: Response ) => {
    const { deptId, sessionId, userId } = req.params
    res.status(200).json({ 
        message: `User ${userId} removed from session ${sessionId}`,
        departmentId: deptId,
        sessionId: sessionId,
        userId: userId,
        // access: 'Admin or department manager only',
        // note: 'User is unenrolled but attendance history remains'
    })
})

export {enrollmentsRouter}
export default enrollmentsRouter