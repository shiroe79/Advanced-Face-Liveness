import type { Request, Response } from 'express'
import * as roleService from '../services/roles.service.ts'

export const getAllRoles = async (req: Request, res: Response) => {
  const roles = await roleService.getRoles()
  res.json(roles)
}

export const getRoleById = async (req: Request, res: Response) => {
  const role = await roleService.getRoleById(req.params.id)
  res.json(role)
}

export const createRole = async (req: Request, res: Response) => {
  const role = await roleService.createRole(req.body)
  res.status(201).json(role)
}

export const updateRole = async (req: Request, res: Response) => {
  const role = await roleService.updateRole(req.params.id, req.body)

  if (!role) {
    return res.status(404).json({ error: 'Role not found' })
  }
  res.json(role)
}

export const deleteRole = async (req: Request, res: Response) => {
  await roleService.deleteRole(req.params.id)
  res.status(204).send()
}