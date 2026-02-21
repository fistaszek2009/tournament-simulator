import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { tournaments, tournamentMembers, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load = (async ({ params }) => {
	const tournamentId = parseInt(params.id);
	
	if (isNaN(tournamentId)) {
		throw error(400, 'Invalid tournament ID');
	}

	const tournament = await db
		.select()
		.from(tournaments)
		.where(eq(tournaments.id, tournamentId))
		.limit(1);

	if (tournament.length === 0) {
		throw error(404, 'Tournament not found');
	}

	const members = await db
		.select({
			id: tournamentMembers.id,
			playerId: tournamentMembers.playerId,
			tournamentId: tournamentMembers.tournamentId,
			playerName: users.name,
			playerSurname: users.surname,
			playerAge: users.age,
			playerCountry: users.country
		})
		.from(tournamentMembers)
		.innerJoin(users, eq(tournamentMembers.playerId, users.id))
		.where(eq(tournamentMembers.tournamentId, tournamentId))
		.orderBy(users.name);

	return {
		tournament: tournament[0],
		members
	};
}) satisfies PageServerLoad;
