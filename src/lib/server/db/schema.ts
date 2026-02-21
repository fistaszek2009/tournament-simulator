import { pgTable, serial, integer, varchar, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  surname: varchar('surname', { length: 255 }).notNull(),
  age: integer('age').notNull(),
  country: varchar('country', { length: 255 }).notNull()
});

export const tournaments = pgTable('tournaments', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull()
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

    player1MemberId: integer('player1_member_id')
      .references(() => tournamentMembers.id, { onDelete: 'set null' }),
    player2MemberId: integer('player2_member_id')
      .references(() => tournamentMembers.id, { onDelete: 'set null' }),
    score1: integer('score1'),
    score2: integer('score2'),

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
    }),
    matchesAsPlayer1: many(tournamentMatches, {
      relationName: 'player1'
    }),
    matchesAsPlayer2: many(tournamentMatches, {
      relationName: 'player2'
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
    player1: one(tournamentMembers, {
      fields: [tournamentMatches.player1MemberId],
      references: [tournamentMembers.id],
      relationName: 'player1'
    }),
    player2: one(tournamentMembers, {
      fields: [tournamentMatches.player2MemberId],
      references: [tournamentMembers.id],
      relationName: 'player2'
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