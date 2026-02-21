import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { tournaments, tournamentMembers, tournamentMatches, users } from '$lib/server/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';

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

	const matches = await db
		.select({
			id: tournamentMatches.id,
			round: tournamentMatches.round,
			position: tournamentMatches.position,
			player1: {
				id: tournamentMatches.player1MemberId,
				name: users.name,
				surname: users.surname
			},
			player2: {
				id: tournamentMatches.player2MemberId,
				name: users.name,
				surname: users.surname
			},
			score1: tournamentMatches.score1,
			score2: tournamentMatches.score2,
			winnerId: tournamentMatches.winnerMemberId,
			nextMatchId: tournamentMatches.nextMatchId
		})
		.from(tournamentMatches)
		.leftJoin(users, eq(tournamentMatches.player1MemberId, tournamentMembers.id))
		.where(eq(tournamentMatches.tournamentId, tournamentId));

	// Simplified matches loading
	const rawMatches = await db
		.select()
		.from(tournamentMatches)
		.where(eq(tournamentMatches.tournamentId, tournamentId));

	// Get all member info
	const memberMap = new Map(members.map(m => [m.id, m]));

	return {
		tournament: tournament[0],
		members,
		matches: rawMatches.map(m => ({
			...m,
			player1Info: m.player1MemberId ? memberMap.get(m.player1MemberId) : null,
			player2Info: m.player2MemberId ? memberMap.get(m.player2MemberId) : null,
			winnerInfo: m.winnerMemberId ? memberMap.get(m.winnerMemberId) : null
		}))
	};
}) satisfies PageServerLoad;

export const actions = {
	updateScore: async ({ request }) => {
		const formData = await request.formData();
		const matchId = parseInt(formData.get('matchId')?.toString() || '');
		const score1 = parseInt(formData.get('score1')?.toString() || '');
		const score2 = parseInt(formData.get('score2')?.toString() || '');

		if (isNaN(matchId) || isNaN(score1) || isNaN(score2)) {
			return fail(400, { message: 'Nieprawidłowe dane' });
		}

		try {
			const match = await db
				.select()
				.from(tournamentMatches)
				.where(eq(tournamentMatches.id, matchId))
				.limit(1);

			if (match.length === 0) {
				return fail(404, { message: 'Mecz nie znaleziony' });
			}

			const m = match[0];

			// Determine winner
			let winnerId: number | null = null;
			if (score1 > score2 && m.player1MemberId) {
				winnerId = m.player1MemberId;
			} else if (score2 > score1 && m.player2MemberId) {
				winnerId = m.player2MemberId;
			}

			// Update match
			await db
				.update(tournamentMatches)
				.set({
					score1,
					score2,
					winnerMemberId: winnerId
				})
				.where(eq(tournamentMatches.id, matchId));

			// If there's a next match and there's a winner, advance them
			if (winnerId && m.nextMatchId) {
				const nextMatch = await db
					.select()
					.from(tournamentMatches)
					.where(eq(tournamentMatches.id, m.nextMatchId))
					.limit(1);

				if (nextMatch.length > 0) {
					const nxt = nextMatch[0];
							// Position matters: each match gets a player in the next round
					// Match 0 and 1 go to next round position 0, etc.
					const isFirstInRound = m.position % 2 === 1;
					const nextMatchSlot = isFirstInRound;  // First in pair goes to player1

					if (isFirstInRound || nxt.player1MemberId === null) {
						await db
							.update(tournamentMatches)
							.set({ player1MemberId: winnerId })
							.where(eq(tournamentMatches.id, m.nextMatchId));
					} else {
						await db
							.update(tournamentMatches)
							.set({ player2MemberId: winnerId })
							.where(eq(tournamentMatches.id, m.nextMatchId));
					}
				}
			}

			return { success: true, message: 'Wynik zaktualizowany!' };
		} catch (err) {
			console.error('Błąd przy aktualizacji wyniku:', err);
			return fail(500, { message: 'Błąd przy aktualizacji wyniku' });
		}
	}
} satisfies Actions;
