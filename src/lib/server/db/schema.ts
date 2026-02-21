import { pgTable, serial, integer, varchar } from 'drizzle-orm/pg-core';

export const user = pgTable('user', { 
  id: serial('id').primaryKey(), 
  name: varchar('name', { length: 255 }).notNull(),
  surname: varchar('surname', { length: 255 }).notNull(),
  age: integer('age').notNull(),
  country: varchar('country', { length: 255 }).notNull()
});
