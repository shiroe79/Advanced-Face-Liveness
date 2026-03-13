import { Router } from 'express'
import * as roleController from '../controllers/roles.controller.ts'
import { authenticateToken } from '../middleware/auth.ts'
import { authorize } from '../middleware/authorize.ts'


const router = Router()

router.use(authenticateToken)

router.get('/', authorize('admin') ,roleController.getAllRoles)

router.get('/:id', roleController.getRoleById)

router.post('/', roleController.createRole)

router.patch('/:id', roleController.updateRole)

router.delete('/:id', roleController.deleteRole)

export {router}

export default router