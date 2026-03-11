import type { Request, Response } from 'express'
import db from '../db/index.ts'
import { users } from '../db/schema.ts'
import type { NewUser } from '../db/schema.ts'
import { generateToken } from '../utils/jwt.ts'
import { comparepasswords, hashPassword } from '../utils/password.ts'
import { eq } from 'drizzle-orm'


export const register = async (req: Request<any,any,NewUser>, res: Response) => {
  try {
    const passwordHash = await hashPassword(req.body.password)

    const [user] = await db
    .insert(users)
    .values({
      ...req.body,
      password: passwordHash,
    })
    .returning({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName, 
      roleId: users.roleId,
      departmentId: users.departmentId,
      createdAt: users.createdAt,
      isActive: users.isActive,
    })

    const token = await generateToken({
      id: user.id,
      email: user.email
    })
    return res.status(201).json({
      message: 'User created',
      user,
      token,
    })
  } catch (e) {
    console.error('Registration error', e)
    res.status(500).json({error: 'Failed to create user'})

  }
}

export const login = async (req: Request, res: Response ) =>{
  try {
    const {email, password} = req.body
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (!user) {
      return res.status(401).json({ error:" Invalid creidentials "})
    }

    const isValidatedPassword = await comparepasswords(password, user.password)

    if (!isValidatedPassword) {
      return res.status(401).json({error: "Invalid credntials"})
    }

    const token = await generateToken({
      id: user.id,
      email: user.email
    })
    
    return res.json({
      message: 'Login Success',
      user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName, 
      roleId: user.roleId,
      departmentId: user.departmentId,
      createdAt: user.createdAt,
      isActive: user.isActive,
      },
      token
    })
  } catch (e) {
    console.error('logging error', e)
    res.status(500).json({error: "Failed to login"})
  }
}


// export const refresh = async (req: Request, res: Response) => {
//   // TODO: refresh token logic
//   res.json({ token: 'new-placeholder-token' })
// }