<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';

	type Member = {
		id: number;
		memberId: number;
		playerId: number;
		name: string;
		surname: string;
		age: number;
		country: string;
	};

	type Match = {
		round: number;
		position: number;
		players: (Member | null)[];
		winnerMemberId: number | null;
		isByeSingle?: boolean;
	};

	type Round = {
		label: string;
		matches: Match[];
	};

	let winners: Record<string, number | null> = {};

	const displayName = (member: Member) => `${member.name} ${member.surname}`;

	const getMatchId = (round: number, position: number) =>
		`r${round}-m${position}`;

	const roundLabel = (participantsCount: number, isPreliminary: boolean) => {
		if (isPreliminary) return 'Preliminary';
		if (participantsCount === 2) return 'Final';
		if (participantsCount === 4) return 'Semifinals';
		return `Round of ${participantsCount}`;
	};

	const createMatches = (
		participants: (Member | null)[],
		round: number,
		winnersMap: Record<string, number | null>
	) => {
		const matches: Match[] = [];
		for (let i = 0; i < participants.length; i += 2) {
			const position = i / 2;
			const matchId = getMatchId(round, position);
			const players = [participants[i] ?? null, participants[i + 1] ?? null];
			let winnerMemberId = winnersMap[matchId] ?? null;

			if (!players.find((player) => player?.memberId === winnerMemberId)) {
				winnerMemberId = null;
			}

			matches.push({
				round,
				position,
				players,
				winnerMemberId
			});
		}
		return matches;
	};

	const winnerFromMatch = (match: Match) =>
		match.players.find((player) => player?.memberId === match.winnerMemberId) ?? null;

	const buildBracket = (members: Member[], winnersMap: Record<string, number | null>, showPreliminaryByePlayers: boolean) => {
		const rounds: Round[] = [];
		const totalPlayers = members.length;

		if (totalPlayers < 2) {
			return rounds;
		}

		const powerOfTwo = 2 ** Math.floor(Math.log2(totalPlayers));
		const needsPreliminary = totalPlayers !== powerOfTwo;

		let round = 0;
		let participants: (Member | null)[] = [];

		if (needsPreliminary) {
			const preliminaryMatches = totalPlayers - powerOfTwo;
			const preliminaryPlayersCount = preliminaryMatches * 2;
			const preliminaryPlayers = members.slice(0, preliminaryPlayersCount);
			const byePlayers = members.slice(preliminaryPlayersCount);

			const preliminaryMatchesList = createMatches(preliminaryPlayers, round, winnersMap);

			const byeMatches = byePlayers.map((p, idx) => {
				const position = preliminaryMatchesList.length + idx;
				const matchId = getMatchId(round, position);
				return {
					round,
					position,
					players: [p, null],
					winnerMemberId: winnersMap[matchId] ?? null,
					isByeSingle: true
				};
			});

			const preliminaryWinners = preliminaryMatchesList.map(winnerFromMatch);
			participants = [...byePlayers, ...preliminaryWinners];

			const combinedPreliminary = [ ...( showPreliminaryByePlayers ? byeMatches : []), ...preliminaryMatchesList];
			rounds.push({
				label: roundLabel(preliminaryPlayers.length, true),
				matches: combinedPreliminary
			});
			round += 1;
		} else {
			participants = [...members];
		}

		while (participants.length > 1) {
			const matches = createMatches(participants, round, winnersMap);
			rounds.push({
				label: roundLabel(participants.length, false),
				matches
			});

			participants = matches.map(winnerFromMatch);
			round += 1;
		}

		return rounds;
	};

	const saveMatchResult = async (round: number, position: number, winnerMemberId: number | null) => {
		const formData = new FormData();
		formData.append('round', round.toString());
		formData.append('position', position.toString());
		if (winnerMemberId) {
			formData.append('winnerMemberId', winnerMemberId.toString());
		}

		try {
			const response = await fetch(`?/saveMatch`, {
				method: 'POST',
				body: formData
			});
			
			if (response.ok) {
				await invalidateAll();
			} else {
				console.error('Failed to save match result');
			}
		} catch (error) {
			console.error('Error saving match:', error);
		}
	};

	const toggleWinner = async (match: Match, member: Member) => {
		const matchId = getMatchId(match.round, match.position);
		const current = winners[matchId] ?? null;
		const next = current === member.memberId ? null : member.memberId;
		
		await saveMatchResult(match.round, match.position, next);
		
		winners = { ...winners, [matchId]: next };
	};

	const needsPreliminary = (members: 	Member[]) => {
		const powerOfTwo = 2 ** Math.floor(Math.log2(members.length));
		return members.length !== powerOfTwo;
	}

	let preliminaryShowByePlayers = true;

	$: members = (page.data.members || []).map((member: any) => ({
		memberId: member.id,
		id: member.playerId,
		playerId: member.playerId,
		name: member.playerName,
		surname: member.playerSurname,
		age: member.playerAge,
		country: member.playerCountry
	}));

	$: {
		const newWinners: Record<string, number | null> = {};
		(page.data.matches || []).forEach((match: any) => {
			if (match.winnerMemberId) {
				const matchId = getMatchId(match.round, match.position);
				newWinners[matchId] = match.winnerMemberId;
			}
		});
		winners = newWinners;
	}

	$: bracketRounds = buildBracket(members, winners, preliminaryShowByePlayers);

import { onMount, onDestroy } from 'svelte';

let topScroll: HTMLDivElement | null = null;
let bottomScroll: HTMLDivElement | null = null;
let topSpacer: HTMLDivElement | null = null;
let ro: ResizeObserver | null = null;

const updateTopSpacer = () => {
	if (!bottomScroll || !topSpacer) return;
	topSpacer.style.width = `${bottomScroll.scrollWidth}px`;
};

const onTopScroll = () => {
	if (!topScroll || !bottomScroll) return;
	bottomScroll.scrollLeft = topScroll.scrollLeft;
};

const onBottomScroll = () => {
	if (!topScroll || !bottomScroll) return;
	topScroll.scrollLeft = bottomScroll.scrollLeft;
};

onMount(() => {
	updateTopSpacer();
	if (bottomScroll) {
		ro = new ResizeObserver(() => updateTopSpacer());
		ro.observe(bottomScroll);
	}
	window.addEventListener('resize', updateTopSpacer);
});

onDestroy(() => {
	if (ro && bottomScroll) ro.unobserve(bottomScroll);
	ro = null;
});

</script>

<svelte:head>
	<title>Tournament - {page.data.tournament.name}</title>
</svelte:head>

<div class="tournament-container">
	<div class="tournament-header">
		<a href="/tournaments" class="back-link">
			<i class="fa-solid fa-arrow-left"></i> Back to Tournaments
		</a>
		<h1 class="tournament-title">{page.data.tournament.name}</h1>
	</div>

		<div class="bracket-section">
				<div class="flex justify-between gap-8 flex-wrap">
					{#if needsPreliminary(members)}
					<p class="bracket-hint">
						<label for="preliminary">
							<input id="preliminary" type="checkbox" bind:checked={preliminaryShowByePlayers}> Show preliminary bye players
						</label>
					</p>
					{:else}
					<i></i>
					{/if}
					<p class="bracket-hint">
						Click a player to advance them. Click again to undo.
					</p>
				</div>

				<div class="bracket-scroll-wrapper">
					<div class="bracket-scroll-top" bind:this={topScroll} on:scroll={onTopScroll} aria-hidden="true">
						<div class="top-spacer" bind:this={topSpacer}></div>
					</div>
					<div class="bracket-scroll" bind:this={bottomScroll} on:scroll={onBottomScroll}>
						<div class="bracket-grid">
						{#each bracketRounds as round, ridx}
							<div class="round-column">
								<div class="round-title">{round.label}</div>

									<div class="matches">
										{#each round.matches as match}
											<div class="match-card">
												{#each match.players as member, idx}
													{#if member || ridx !== 0}
														<button
														type="button"
														class="player-slot {match.winnerMemberId === member?.memberId ? 'winner' : ''} {match.isByeSingle && ridx === 0 ? 'eliminations-pass' : ''}"
														disabled={!member || (match.isByeSingle && idx === 0)}
														on:click={() => member && !match.isByeSingle && toggleWinner(match, member)}
													>
														<span class="player-name">
															{member ? displayName(member) : '--------'}
														</span>
													</button>
													{/if}
												{/each}
											</div>
										{/each}
									</div>

							</div>
						{/each}
					</div>
				</div>
			</div>
	</div>
</div>

<style>
	.tournament-container {
		max-width: 1200px;
		max-width: 100%;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.tournament-header {
		margin-bottom: 2rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: #b4c2d4;
		text-decoration: none;
		font-size: 0.95rem;
		margin-bottom: 1rem;
		transition: color 0.3s ease;
	}

	.back-link:hover {
		color: #93c5fd;
	}

	.tournament-title {
		font-size: 2.25rem;
		font-weight: bold;
		color: white;
		border-bottom: 3px solid #b4c2d4;
		padding-bottom: 1rem;
	}

	.bracket-scroll {
		overflow-x: auto;
		padding-bottom: 0.75rem;
	}

	.bracket-scroll-wrapper {
		display: block;
	}

	.bracket-scroll-top {
		overflow-x: auto;
		overflow-y: hidden;
		height: 14px;
		margin-bottom: 6px;
	}

	.bracket-scroll-top .top-spacer {
		height: 1px;
	}

	.bracket-grid {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(190px, 1fr);
		gap: 1.5rem;
		align-items: start;
	}

	.round-column {
		background: rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(96, 165, 250, 0.2);
		border-radius: 0.75rem;
		padding: 1rem;
		min-height: 100%;
        display:flex;
        flex-direction: column;
	}

	.round-title {
		font-size: 1rem;
		font-weight: 600;
		color: #bfdbfe;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 1rem;
	}

	.matches {
        flex:1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
        justify-content: center;
	}

	.match-card {
		background: rgba(30, 41, 59, 0.5);
		border-radius: 0.6rem;
		border: 1px solid rgba(148, 163, 184, 0.3);
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.player-slot {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.6rem 0.75rem;
		background: rgba(15, 23, 42, 0.7);
		color: #e2e8f0;
		border: 1px solid rgba(148, 163, 184, 0.35);
		border-radius: 0.5rem;
		font-size: 0.9rem;
		text-align: left;
		transition: all 0.2s ease;
	}

	.player-slot:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.eliminations-pass{
		opacity:1 !important;
 		border-color: rgba(27, 92, 129, 0.8);
		background: rgba(22, 163, 156, 0.25);
		color: #6391e7;
		box-shadow: 0 0 0 1px rgba(34, 178, 197, 0.4);	}

	.player-slot:hover:not(:disabled) {
		border-color: rgba(96, 165, 250, 0.8);
		background: rgba(30, 58, 138, 0.4);
	}

	.player-slot.winner {
		border-color: rgba(34, 197, 94, 0.8);
		background: rgba(22, 163, 74, 0.25);
		color: #bbf7d0;
		box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.4);
	}

    .round-column:nth-last-child(1) .player-slot.winner{
        border-color: rgba(194, 197, 34, 0.8);
		background: rgba(163, 142, 22, 0.25);
		color: #e2b009;
		box-shadow: 0 0 0 1px rgba(167, 197, 34, 0.4);
    }

    .round-column:nth-last-child(1) .player-slot.winner::before{
        content: "👑"
    }

	.player-name {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.bracket-hint {
		color: #b4c2d4;
		font-size: 0.9rem;
		text-align: right;
	}

	@media (max-width: 775px) {
		.tournament-content {
			grid-template-columns: 1fr;
		}

		.tournament-title {
			font-size: 1.75rem;
		}
		.bracket-section>div:has(p.bracket-hint){
		gap:0.25rem;
		}
	}
</style>
