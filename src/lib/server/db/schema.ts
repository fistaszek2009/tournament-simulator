import { pgTable, serial, integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  surname: varchar('surname', { length: 255 }).notNull(),
  age: integer('age').notNull(),
  country: varchar('country', { length: 255 }).notNull(),
  register_date: timestamp('register_date').notNull().defaultNow(),
});

export const tournaments = pgTable('tournaments', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  pair_by: varchar('pair_by', { length: 50 }).notNull().default('name')
});

export const tournamentMembers = pgTable('tournament_members',{
    id: serial('id').primaryKey(),
    tournamentId: integer('tournament_id')
      .notNull()
      .references(() => tournaments.id, { onDelete: 'cascade' }),
    playerId: integer('player_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
  });

export const tournamentMatches = pgTable('tournament_matches',{
    id: serial('id').primaryKey(),
    tournamentId: integer('tournament_id')
      .notNull()
      .references(() => tournaments.id, { onDelete: 'cascade' }),

    // struktura drzewka
    round: integer('round').notNull(),        // np. 1, 2, 3...
    position: integer('position').notNull(),  // kolejność w rundzie

    winnerMemberId: integer('winner_member_id')
      .references(() => tournamentMembers.id, { onDelete: 'set null' }),
    nextMatchId: integer('next_match_id')
      .references((): any => tournamentMatches.id, { onDelete: 'set null' })
  });

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(tournamentMembers)
}));

export const tournamentsRelations = relations(tournaments, ({ many }) => ({
  members: many(tournamentMembers),
  matches: many(tournamentMatches)
}));

export const tournamentMembersRelations = relations(
  tournamentMembers,
  ({ one, many }) => ({
    user: one(users, {
      fields: [tournamentMembers.playerId],
      references: [users.id]
    }),
    tournament: one(tournaments, {
      fields: [tournamentMembers.tournamentId],
      references: [tournaments.id]
    })
  })
);

export const tournamentMatchesRelations = relations(
  tournamentMatches,
  ({ one }) => ({
    tournament: one(tournaments, {
      fields: [tournamentMatches.tournamentId],
      references: [tournaments.id]
    }),
    winner: one(tournamentMembers, {
      fields: [tournamentMatches.winnerMemberId],
      references: [tournamentMembers.id]
    }),
    nextMatch: one(tournamentMatches, {
      fields: [tournamentMatches.nextMatchId],
      references: [tournamentMatches.id]
    })
  })
);