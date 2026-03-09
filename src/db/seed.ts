import * as schema from './schema.ts';
import bcrypt from 'bcrypt';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/index.ts'
import { hashPassword } from '../utils/password.ts';



async function clearDatabase() {
  console.log('⚠️  TRUNCATING ALL TABLES (development only!)');

  // Child → parent order to respect FK constraints
  await db.delete(schema.auditLogs);
  await db.delete(schema.leaveRequests);
  await db.delete(schema.attendances);
  await db.delete(schema.schedules);
  await db.delete(schema.enrollments);
  await db.delete(schema.sessionCoordinators);
  await db.delete(schema.sessions);
  await db.delete(schema.departments);
  await db.delete(schema.users);
  await db.delete(schema.roles);

  console.log('All tables cleared.');
}

async function seed() {
  console.log(`🌱 Seeding UUID-based database — ${new Date().toISOString()}`);

  await db.transaction(async (tx) => {
    // ────────────────────────────────────────────────
    // 1. ROLES
    console.log('→ Seeding roles');
    await tx.insert(schema.roles).values([
      {  name: 'admin',       description: 'Full system access',       updatedAt: new Date() },
      {  name: 'manager',     description: 'Department manager',       updatedAt: new Date() },
      {  name: 'coordinator', description: 'Session coordinator',      updatedAt: new Date() },
      {  name: 'user',        description: 'Regular student/employee', updatedAt: new Date() },
    ]);

    const roles = await tx.select().from(schema.roles);
    const roleMap = Object.fromEntries(roles.map(r => [r.name, r.id]));

    const ADMIN       = roleMap['admin']!;
    const MANAGER     = roleMap['manager']!;
    const COORDINATOR = roleMap['coordinator']!;
    const USER        = roleMap['user']!;

    // ────────────────────────────────────────────────
    // 2. USERS
    console.log('→ Seeding users');

    const usersData = [
      // Admin
      { email: 'admin@system.et', passwordHash: await hashPassword('Adm!n2026#'), firstName: 'Elias',   lastName: 'Girma',   roleId: ADMIN,   isActive: true, updatedAt: new Date() },
      // Managers
      { email: 'manager.cs@uni.et',   passwordHash: await hashPassword('CsM2026!'), firstName: 'Abebe',  lastName: 'Kebede',  roleId: MANAGER, isActive: true, updatedAt: new Date() },
      { email: 'manager.ece@uni.et',  passwordHash: await hashPassword('EceM2026!'), firstName: 'Meron',  lastName: 'Assefa',  roleId: MANAGER, isActive: true, updatedAt: new Date() },
      // Coordinators
      { email: 'coord.cs101@uni.et',  passwordHash: await hashPassword('Cs101!'), firstName: 'Sara',   lastName: 'Alemu',   roleId: COORDINATOR, isActive: true, updatedAt: new Date() },
      { email: 'coord.ece202@uni.et', passwordHash: await hashPassword('Ece202!'), firstName: 'Yonas',  lastName: 'Tadesse', roleId: COORDINATOR, isActive: true, updatedAt: new Date() },
      // Students
      { email: 'ugr-001@uni.et',      passwordHash: await hashPassword('pass123'), firstName: 'Dawit',  lastName: 'Tesfaye', roleId: USER, isActive: true, updatedAt: new Date() },
      { email: 'ugr-015@uni.et',      passwordHash: await hashPassword('pass123'), firstName: 'Liya',   lastName: 'Getachew',roleId: USER, isActive: true, updatedAt: new Date() },
      { email: 'ugr-042@uni.et',      passwordHash: await hashPassword('pass123'), firstName: 'Henok',  lastName: 'Woldie',  roleId: USER, isActive: true, updatedAt: new Date() },
    ];

    const insertedUsers = await tx
      .insert(schema.users)
      .values(usersData)
      .returning({ id: schema.users.id, email: schema.users.email });

    const userMap = Object.fromEntries(insertedUsers.map(u => [u.email, u.id]));

    const ADMIN_ID       = userMap['admin@system.et']!;
    const CS_MANAGER_ID  = userMap['manager.cs@uni.et']!;
    const ECE_MANAGER_ID = userMap['manager.ece@uni.et']!;
    const CS_COORD_ID    = userMap['coord.cs101@uni.et']!;
    const ECE_COORD_ID   = userMap['coord.ece202@uni.et']!;
    const STUDENT_1      = userMap['ugr-001@uni.et']!;
    const STUDENT_2      = userMap['ugr-015@uni.et']!;
    const STUDENT_3      = userMap['ugr-042@uni.et']!;

    // ────────────────────────────────────────────────
    // 3. DEPARTMENTS
    console.log('→ Seeding departments');

    const depts = await tx.insert(schema.departments).values([
      { name: 'Computer Science',      code: 'CS',  managerId: CS_MANAGER_ID,  description: 'Software Engineering & AI',      updatedAt: new Date() },
      { name: 'Electrical & Computer', code: 'ECE', managerId: ECE_MANAGER_ID, description: 'Electronics & Communication', updatedAt: new Date() },
    ]).returning();

    const CS_DEPT_ID  = depts.find(d => d.code === 'CS')!.id;
    const ECE_DEPT_ID = depts.find(d => d.code === 'ECE')!.id;

    // Assign department to users (helps with permission filtering)
    await tx.update(schema.users)
      .set({ departmentId: CS_DEPT_ID })
      .where(sql`${schema.users.id} IN (${CS_MANAGER_ID}, ${CS_COORD_ID}, ${STUDENT_1}, ${STUDENT_2})`);

    await tx.update(schema.users)
      .set({ departmentId: ECE_DEPT_ID })
      .where(sql`${schema.users.id} IN (${ECE_MANAGER_ID}, ${ECE_COORD_ID}, ${STUDENT_3})`);

    // ────────────────────────────────────────────────
    // 4. SESSIONS
    console.log('→ Seeding sessions');

    const sessions = await tx.insert(schema.sessions).values([
      { departmentId: CS_DEPT_ID,  name: 'Introduction to Programming', code: 'CS101', createdBy: CS_MANAGER_ID, updatedAt: new Date() },
      { departmentId: CS_DEPT_ID,  name: 'Data Structures',             code: 'CS201', createdBy: CS_MANAGER_ID, updatedAt: new Date() },
      { departmentId: ECE_DEPT_ID, name: 'Digital Logic Design',        code: 'ECE202', createdBy: ECE_MANAGER_ID, updatedAt: new Date() },
    ]).returning();

    const CS101_ID = sessions.find(s => s.code === 'CS101')!.id;
    const CS201_ID = sessions.find(s => s.code === 'CS201')!.id;
    const ECE202_ID = sessions.find(s => s.code === 'ECE202')!.id;

    // Assign coordinators (many-to-many)
    await tx.insert(schema.sessionCoordinators).values([
      { sessionId: CS101_ID, userId: CS_COORD_ID, assignedAt: new Date() },
      { sessionId: CS201_ID, userId: CS_COORD_ID, assignedAt: new Date() },
      { sessionId: ECE202_ID, userId: ECE_COORD_ID, assignedAt: new Date() },
    ]);

    // ────────────────────────────────────────────────
    // 5. ENROLLMENTS
    console.log('→ Seeding enrollments');

    await tx.insert(schema.enrollments).values([
      { userId: STUDENT_1, sessionId: CS101_ID, enrolledBy: CS_MANAGER_ID, enrolledAt: new Date() },
      { userId: STUDENT_2, sessionId: CS101_ID, enrolledBy: CS_MANAGER_ID, enrolledAt: new Date() },
      { userId: STUDENT_1, sessionId: CS201_ID, enrolledBy: CS_MANAGER_ID, enrolledAt: new Date() },
      { userId: STUDENT_3, sessionId: ECE202_ID, enrolledBy: ECE_MANAGER_ID, enrolledAt: new Date() },
    ]);

    // ────────────────────────────────────────────────
    // 6. SAMPLE SCHEDULES
    console.log('→ Seeding sample schedules');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    await tx.insert(schema.schedules).values([
      {
      
        sessionId: CS101_ID,
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 90 * 60 * 1000),
        location: 'Hall A-101',
        createdBy: CS_MANAGER_ID,
        updatedAt: new Date(),
      },
      {
      
        sessionId: ECE202_ID,
        startTime: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000),
        location: 'Lab B-204',
        createdBy: ECE_MANAGER_ID,
        updatedAt: new Date(),
      },
    ]);

    console.log('✅ Seed completed successfully');
  });
}

async function run() {
  try {
    await clearDatabase();
    await seed();
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

run();