import type { Response } from "express"
import * as profileService from '../services/profile.service.ts'
import type { AuthenticatedRequest } from "../middleware/auth.ts"


export const getUserData = async (req:AuthenticatedRequest, res:Response) => {
    const userData = await profileService.getUserProfile(req.user.id)
    res.json(userData)
}

export const updateProfile = async(req:AuthenticatedRequest, res:Response) =>{
    const userData = await profileService.updateUser(req.user.id, req.body)
    res.json(userData)
}