import { db } from '../db/index.ts'
import { users } from '../db/schema.ts'
import { eq } from 'drizzle-orm'
import { insertUserSchema } from '../db/schema.ts';

export const getUserProfile = async (id: string) =>{
    const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))

    return user
}

export const updateUser = async (id: string, data: typeof insertUserSchema) => {
    const [user] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning()

    return user
}