import { db } from '../db/index.ts'
import { roles } from '../db/schema.ts'
import { eq } from 'drizzle-orm'

export const getRoles = async () => {
  return db.select().from(roles)
}

export const getRoleById = async (id: string) => {
  const [role] = await db
    .select()
    .from(roles)
    .where(eq(roles.id, id))

  return role
}

export const createRole = async (data: {
  name: string
  description?: string
}) => {
  const [role] = await db
    .insert(roles)
    .values(data)
    .returning()

  return role
}

export const updateRole = async (
  id: string,
  data: Partial<{
    name: string
    description: string
  }>
) => {
  const [role] = await db
    .update(roles)
    .set(data)
    .where(eq(roles.id, id))
    .returning()

  return role
}

export const deleteRole = async (id: string) => {
  await db.delete(roles).where(eq(roles.id, id))
}