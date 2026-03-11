import { Router } from 'express'
import * as roleController from '../controllers/roles.controller.ts'
import { autehnticateToken } from '../middleware/auth.ts'


const router = Router()

router.use(autehnticateToken)

router.get('/', roleController.getAllRoles)

router.get('/:id', roleController.getRoleById)

router.post('/', roleController.createRole)

router.patch('/:id', roleController.updateRole)

router.delete('/:id', roleController.deleteRole)

export {router}

export default router