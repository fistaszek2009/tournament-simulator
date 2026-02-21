import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { tournaments, users, tournamentMembers } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { eq } from "drizzle-orm";

export const load = (async () => {
  const players = await db.select().from(users).orderBy(users.id);
  const tournaments_display = await db.select().from(tournaments).orderBy(tournaments.id);
  return { players, tournaments_display };
}) satisfies PageServerLoad;

export const actions = {
  addTournament: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name')?.toString() || '';
    const playerIds = formData.getAll('playerIds').map(id => parseInt(id.toString())).filter(id => !isNaN(id));
    
    if (!name.trim()) {
      return fail(400, { fieldError: 'name', message: 'Nazwa jest wymagana' });
    }

    if (playerIds.length < 2) {
      return fail(400, { message: 'Musisz wybrać co najmniej 2 graczy' });
    }

    try {
      const result = await db.insert(tournaments).values({
        name: name.trim(),
      }).returning();

      const tournamentId = result[0].id;

      const members = await db.insert(tournamentMembers).values(
        playerIds.map(playerId => ({
          tournamentId,
          playerId
        }))
      ).returning();

    } catch (error) {
      console.error('Błąd przy dodawaniu turnieju:', error);
      return fail(500, { message: 'Błąd przy dodawaniu turnieju' });
    }
  },
  deleteTournament: async ({ request }) => {
    const formData = await request.formData();
    const id = parseInt(formData.get('id')?.toString() || '');
    if (Number.isNaN(id)) return fail(400, { message: 'Nieprawidłowe id' });

    try {
      await db.delete(tournaments).where(eq(tournaments.id,id));
      return { success: true };
    } catch (error) {
      console.error('Błąd przy usuwaniu turnieju:', error);
      return fail(500, { message: 'Błąd przy usuwaniu turnieju' });
    }
  }
} satisfies Actions;