import { db } from './db';
import { tournamentMatches, tournamentMembers } from './db/schema';
import { eq } from 'drizzle-orm';

export async function generateBracket(tournamentId: number, memberIds: number[]) {
	if (memberIds.length < 2) {
		throw new Error('Tournament must have at least 2 members');
	}

	// Calculate number of rounds needed for single elimination
	const numPlayers = memberIds.length;
	const numRounds = Math.ceil(Math.log2(numPlayers));
	const totalPositionsFirstRound = Math.pow(2, numRounds);

	// Pad with byes if necessary
	const paddedMemberIds = [...memberIds];
	while (paddedMemberIds.length < totalPositionsFirstRound) {
		paddedMemberIds.push(0); // 0 indicates a bye
	}

	// Create matches structure
	const matches: Array<{
		tournamentId: number;
		round: number;
		position: number;
		player1MemberId: number | null;
		player2MemberId: number | null;
		nextMatchId: number | null;
	}> = [];

	// Generate first round matches
	for (let i = 0; i < totalPositionsFirstRound / 2; i++) {
		const player1Id = paddedMemberIds[i * 2];
		const player2Id = paddedMemberIds[i * 2 + 1];

		matches.push({
			tournamentId,
			round: 1,
			position: i + 1,
			player1MemberId: player1Id > 0 ? player1Id : null,
			player2MemberId: player2Id > 0 ? player2Id : null,
			nextMatchId: null
		});
	}

	// Generate subsequent rounds
	for (let round = 2; round <= numRounds; round++) {
		const matchesInRound = Math.pow(2, numRounds - round);
		for (let i = 0; i < matchesInRound; i++) {
			matches.push({
				tournamentId,
				round,
				position: i + 1,
				player1MemberId: null,
				player2MemberId: null,
				nextMatchId: null
			});
		}
	}

	// Link matches to next round
	for (let round = 1; round < numRounds; round++) {
		const matchesInCurrentRound = Math.pow(2, numRounds - round);
		const startIndexCurrent = matches.findIndex(m => m.round === round);
		const startIndexNext = matches.findIndex(m => m.round === round + 1);

		for (let i = 0; i < matchesInCurrentRound; i++) {
			const currentMatch = matches[startIndexCurrent + i];
			const nextMatchIndex = startIndexNext + Math.floor(i / 2);
			currentMatch.nextMatchId = nextMatchIndex + 1; // Store index as ID reference
		}
	}

	// Insert matches into database and get their IDs
	const insertedMatches = await db.insert(tournamentMatches).values(matches).returning();

	// Update next_match_id with actual database IDs
	for (let round = 1; round < numRounds; round++) {
		const matchesInCurrentRound = Math.pow(2, numRounds - round);
		const roundMatches = insertedMatches.filter(m => m.round === round);
		const nextRoundMatches = insertedMatches.filter(m => m.round === round + 1);

		for (let i = 0; i < matchesInCurrentRound; i++) {
			const currentMatch = roundMatches[i];
			const nextMatchIndex = Math.floor(i / 2);
			const nextMatch = nextRoundMatches[nextMatchIndex];

			await db
				.update(tournamentMatches)
				.set({ nextMatchId: nextMatch.id })
				.where(eq(tournamentMatches.id, currentMatch.id));
		}
	}
}
