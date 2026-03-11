import {
  pgTable,
  varchar,
  text,
  timestamp,
  uuid,
  boolean,
  jsonb,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema} from 'drizzle-zod'


// 1. Roles (enum-like but flexible table)
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(), // 'admin', 'manager', 'coordinator', 'user'
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));



// 2. Users (people table)
export const users = pgTable('users',{ 
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    departmentId: uuid('department_id').references(() => departments.id, {
      onDelete: 'set null',
    }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
  })
);

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),

  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
    relationName: "departmentMembers",
  }),

    managedDepartment: one(departments, {
      fields: [users.id],
      references: [departments.managerId],
      relationName: "departmentManager",
    }),
  attendances: many(attendances, {
    relationName: "userAttendances",
  }),
  enrollments: many(enrollments),
  leaveRequestsSubmitted: many(leaveRequests, {relationName: 'submittedBy',}),
  leaveRequestsHandled: many(leaveRequests, {relationName: 'handledBy',}),
}));


// 3. Departments
export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 150 }).notNull(),
  code: varchar('code', { length: 20 }).unique(),
  description: text('description'),
  managerId: uuid('manager_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  manager: one(users, { 
    fields: [departments.managerId], 
    references: [users.id], 
    relationName: 'departmentManager', 
  }),
  
  sessions: many(sessions),

  members: many(users, {
    relationName: "departmentMembers",
  }),
  
}));


// 4. Sessions / Classes (the recurring "course" or "lecture group")
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  departmentId: uuid('department_id')
    .notNull()
    .references(() => departments.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  code: varchar('code', { length: 50 }).unique(),
  description: text('description'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  department: one(departments, {
    fields: [sessions.departmentId],
    references: [departments.id],
  }),
  creator: one(users, { fields: [sessions.createdBy], references: [users.id] }),
  schedules: many(schedules),
  enrollments: many(enrollments),
  coordinators: many(sessionCoordinators),
}));

// Many-to-many: coordinators assigned to sessions
export const sessionCoordinators = pgTable('session_coordinators', {
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.sessionId, t.userId] }),
  })
);

export const sessionCoordinatorsRelations = relations(
  sessionCoordinators,
  ({ one }) => ({
    session: one(sessions, { fields: [sessionCoordinators.sessionId], references: [sessions.id] }),
    coordinator: one(users, { fields: [sessionCoordinators.userId], references: [users.id] }),
  })
);



// 5. Schedules (actual date/time occurrences — can be one-off or recurring instances)
export const schedules = pgTable('schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  location: varchar('location', { length: 200 }),
  isRecurringInstance: boolean('is_recurring_instance').default(false),
  recurrenceParentId: uuid('recurrence_parent_id').references(() => schedules.id),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const schedulesRelations = relations(schedules, ({ one, many }) => ({
  session: one(sessions, { fields: [schedules.sessionId], references: [sessions.id] }),
  attendances: many(attendances),
  // enrollments: many(enrollments),
}));



// 6. Enrollments (which users should attend which session)
export const enrollments = pgTable(
  'enrollments',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
    enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
    enrolledBy: uuid('enrolled_by').references(() => users.id), // manager or self
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.sessionId] }),
  })
);

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, { 
    fields: [enrollments.userId], 
    references: [users.id] 
  }),
  session: one(sessions, { 
    fields: [enrollments.sessionId], 
    references: [sessions.id] 
  }),
}));



// 7. Attendance (per schedule occurrence)
export const attendances = pgTable('attendances', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  scheduleId: uuid('schedule_id')
    .notNull()
    .references(() => schedules.id, { onDelete: 'cascade' }),
  checkInTime: timestamp('check_in_time'),
  checkOutTime: timestamp('check_out_time'),
  status: varchar('status', { length: 30 }).notNull(), // present, absent, late, excused, pending
  verificationMethod: varchar('verification_method', { length: 50 }), // face, fingerprint, manual, qr, etc.
  verifiedBy: uuid('verified_by').references(() => users.id),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const attendancesRelations = relations(attendances, ({ one }) => ({
  user: one(users, { fields: [attendances.userId], references: [users.id], relationName: "userAttendances", }),
  schedule: one(schedules, { fields: [attendances.scheduleId], references: [schedules.id] }),
  verifier: one(users, { fields: [attendances.verifiedBy], references: [users.id] }),
}));

// ────────────────────────────────────────────────
// 8. Leave Requests
export const leaveRequests = pgTable('leave_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  submittedBy: uuid('submitted_by')
    .notNull()
    .references(() => users.id),
  scheduleId: uuid('schedule_id').references(() => schedules.id), // specific occurrence or null for general
  reason: text('reason').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  status: varchar('status', { length: 30 }).notNull().default('pending'), // pending, approved, rejected
  handledBy: uuid('handled_by').references(() => users.id),
  handledAt: timestamp('handled_at'),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const leaveRequestsRelations = relations(leaveRequests, ({ one }) => ({
  requester: one(users, { fields: [leaveRequests.userId], references: [users.id] }),
  submitter: one(users, {
    fields: [leaveRequests.submittedBy],
    references: [users.id],
    relationName: 'submittedBy',
  }),
  handler: one(users, {
    fields: [leaveRequests.handledBy],
    references: [users.id],
    relationName: 'handledBy',
  }),
  schedule: one(schedules, { fields: [leaveRequests.scheduleId], references: [schedules.id] }),
}));

// ────────────────────────────────────────────────
// 9. Basic Audit Logs (expand later)
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(), // e.g. "attendance_modified", "leave_approved"
  entityType: varchar('entity_type', { length: 50 }), // attendance, leave_request, user, etc.
  entityId: uuid('entity_id'),
  changes: jsonb('changes'), // { before: {}, after: {} }
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));


// will do for the rest too
export type User = typeof users.$inferSelect
export type Department = typeof departments.$inferSelect
export type NewUser = typeof users.$inferInsert

// same here
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)