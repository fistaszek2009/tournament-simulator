import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { tournaments, tournamentMembers, users, tournamentMatches } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
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

	const orderByField = tournament[0].pair_by === 'age' ? users.age : tournament[0].pair_by === 'name' ? users.surname : users.register_date;

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
		.orderBy(orderByField);

	const matches = await db
		.select()
		.from(tournamentMatches)
		.where(eq(tournamentMatches.tournamentId, tournamentId));

	return {
		tournament: tournament[0],
		members,
		matches
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	saveMatch: async ({ request, params }) => {
		const tournamentId = parseInt(params.id);
		if (isNaN(tournamentId)) {
			throw error(400, 'Invalid tournament ID');
		}

		const formData = await request.formData();
		const round = parseInt(formData.get('round') as string);
		const position = parseInt(formData.get('position') as string);
		const winnerMemberId = formData.get('winnerMemberId') 
			? parseInt(formData.get('winnerMemberId') as string) 
			: null;

		if (isNaN(round) || isNaN(position)) {
			throw error(400, 'Invalid round or position');
		}

		const existingMatch = await db
			.select()
			.from(tournamentMatches)
			.where(
				and(
					eq(tournamentMatches.tournamentId, tournamentId),
					eq(tournamentMatches.round, round),
					eq(tournamentMatches.position, position)
				)
			)
			.limit(1);

		if (existingMatch.length > 0) {
			await db
				.update(tournamentMatches)
				.set({ winnerMemberId })
				.where(
					and(
						eq(tournamentMatches.tournamentId, tournamentId),
						eq(tournamentMatches.round, round),
						eq(tournamentMatches.position, position)
					)
				);
		} else {
			await db.insert(tournamentMatches).values({
				tournamentId,
				round,
				position,
				player1MemberId: null,
				player2MemberId: null,
				winnerMemberId
			});
		}

		return { success: true };
	}
};
