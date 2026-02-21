<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let expandedMatches = new Set<number>();

	function toggleMatch(matchId: number) {
		if (expandedMatches.has(matchId)) {
			expandedMatches.delete(matchId);
		} else {
			expandedMatches.add(matchId);
		}
		expandedMatches = expandedMatches;
	}

	// Group matches by round
	$: matchesByRound = Array.from(
		{ length: Math.max(...(page.data.matches?.map((m: any) => m.round) ?? [0]), 0) || 1 },
		(_, i) => ({
			round: i + 1,
			matches: (page.data.matches?.filter((m: any) => m.round === i + 1).sort((a: any, b: any) => a.position - b.position) ?? [])
		})
	);

	// Find tournament winner (match from final round with a winner)
	$: finalRound = matchesByRound[matchesByRound.length - 1];
	$: winner = (finalRound?.matches[0] as any)?.winnerInfo;
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

	<div class="tournament-content">
		<div class="members-section">
			<h2 class="section-title">Tournament Members ({page.data.members.length})</h2>
			{#if page.data.members.length === 0}
				<p class="empty-message">No members in this tournament</p>
			{:else}
				<div class="members-list">
					{#each page.data.members as member(member.id)}
						<div class="member-card">
							<div class="member-info">
								<h3>{member.playerName} {member.playerSurname}</h3>
								<p class="member-details">
									<span><strong>Age:</strong> {member.playerAge}</span>
									<span><strong>Country:</strong> {member.playerCountry}</span>
								</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div class="bracket-section">
			<div class="bracket-header">
				<h2 class="section-title">Tournament Bracket</h2>
				{#if winner}
					<div class="winner-banner">
						<i class="fa-solid fa-trophy"></i>
						<span><strong>Champion:</strong> {winner.playerName} {winner.playerSurname}</span>
					</div>
				{/if}
			</div>

			<div class="bracket-rounds">
				{#each matchesByRound as round (round.round)}
					<div class="bracket-round">
						<h3 class="round-title">Round {round.round}</h3>
						<div class="matches-column">
							{#each round.matches as match (match.id)}
								<div class="match-card" class:completed={match.score1 !== null && match.score2 !== null}>
									<div class="match-teams">
										<div class="team team-1">
											<span class="team-name">
												{#if match.player1Info}
													{match.player1Info.playerName} {match.player1Info.playerSurname}
												{:else}
													<em class="bye">Bye</em>
												{/if}
											</span>
											<span class="team-score" class:winner={match.winnerMemberId === match.player1MemberId}>
												{match.score1 ?? '-'}
											</span>
										</div>
										<div class="match-divider">VS</div>
										<div class="team team-2">
											<span class="team-name">
												{#if match.player2Info}
													{match.player2Info.playerName} {match.player2Info.playerSurname}
												{:else}
													<em class="bye">Bye</em>
												{/if}
											</span>
											<span class="team-score" class:winner={match.winnerMemberId === match.player2MemberId}>
												{match.score2 ?? '-'}
											</span>
										</div>
									</div>

									{#if match.player1Info || match.player2Info}
										<button
											class="expand-btn"
											on:click={() => toggleMatch(match.id)}
											aria-expanded={expandedMatches.has(match.id)}
											title="Edit match score"
										>
											<i
												class="fa-solid"
												class:fa-chevron-down={!expandedMatches.has(match.id)}
												class:fa-chevron-up={expandedMatches.has(match.id)}
											></i>
										</button>

										{#if expandedMatches.has(match.id)}
											<form method="POST" action="?/updateScore" use:enhance class="score-form">
												<input type="hidden" name="matchId" value={match.id} />

												<div class="score-inputs">
													<div class="input-group">
														<label for="score1-{match.id}">
															{match.player1Info?.playerName ?? 'Player 1'} Score:
														</label>
														<input
															type="number"
															id="score1-{match.id}"
															name="score1"
															value={match.score1 ?? ''}
															min="0"
														/>
													</div>
													<div class="input-group">
														<label for="score2-{match.id}">
															{match.player2Info?.playerName ?? 'Player 2'} Score:
														</label>
														<input
															type="number"
															id="score2-{match.id}"
															name="score2"
															value={match.score2 ?? ''}
															min="0"
														/>
													</div>
												</div>

												<button type="submit" class="submit-btn">Update Score</button>
											</form>
										{/if}
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.tournament-container {
		max-width: 1400px;
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
		color: #60a5fa;
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
		border-bottom: 3px solid #60a5fa;
		padding-bottom: 1rem;
	}

	.tournament-content {
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: 2rem;
	}

	.members-section,
	.bracket-section {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 0.75rem;
		padding: 1.5rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.bracket-header {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.winner-banner {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		background: linear-gradient(135deg, #fbbf24, #f59e0b);
		color: #000;
		padding: 1rem;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 1.1rem;
	}

	.winner-banner i {
		font-size: 1.5rem;
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: white;
		margin-bottom: 1.5rem;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid rgba(96, 165, 250, 0.5);
	}

	.empty-message {
		color: #9ca3af;
		text-align: center;
		padding: 2rem 0;
		font-style: italic;
	}

	.members-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.member-card {
		background: rgba(30, 41, 59, 0.5);
		border: 1px solid rgba(96, 165, 250, 0.3);
		border-radius: 0.5rem;
		padding: 1rem;
		transition: all 0.3s ease;
	}

	.member-card:hover {
		background: rgba(30, 41, 59, 0.7);
		border-color: rgba(96, 165, 250, 0.6);
		transform: translateX(4px);
	}

	.member-info h3 {
		color: #e0e7ff;
		font-size: 1.1rem;
		margin: 0 0 0.5rem 0;
	}

	.member-details {
		color: #a0aec0;
		font-size: 0.9rem;
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
		margin: 0;
	}

	.member-details span {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.bracket-rounds {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
	}

	.bracket-round {
		padding: 1rem;
		background: rgba(30, 41, 59, 0.3);
		border-radius: 0.5rem;
		border: 1px solid rgba(96, 165, 250, 0.2);
	}

	.round-title {
		font-size: 1rem;
		font-weight: 600;
		color: #93c5fd;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 1rem;
		text-align: center;
	}

	.matches-column {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.match-card {
		background: rgba(30, 41, 59, 0.6);
		border: 1px solid rgba(96, 165, 250, 0.4);
		border-radius: 0.5rem;
		padding: 1rem;
		transition: all 0.3s ease;
	}

	.match-card:hover {
		background: rgba(30, 41, 59, 0.8);
		border-color: rgba(96, 165, 250, 0.7);
	}

	.match-card.completed {
		background: rgba(34, 197, 94, 0.15);
		border-color: rgba(34, 197, 94, 0.5);
	}

	.match-teams {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.team {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		background: rgba(15, 23, 42, 0.5);
		border-radius: 0.375rem;
		gap: 1rem;
	}

	.team-name {
		flex: 1;
		color: #e0e7ff;
		font-size: 0.95rem;
		word-break: break-word;
	}

	em {
		color: #6b7280;
		font-style: italic;
	}

	.team-score {
		background: rgba(96, 165, 250, 0.2);
		color: #93c5fd;
		padding: 0.25rem 0.75rem;
		border-radius: 0.25rem;
		min-width: 3rem;
		text-align: center;
		font-weight: 600;
	}

	.team-score.winner {
		background: rgba(34, 197, 94, 0.3);
		color: #86efac;
		box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
	}

	.match-divider {
		text-align: center;
		color: #6b7280;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0;
	}

	.expand-btn {
		width: 100%;
		margin-top: 0.75rem;
		padding: 0.5rem;
		background: rgba(96, 165, 250, 0.2);
		border: 1px solid rgba(96, 165, 250, 0.4);
		color: #93c5fd;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.3s ease;
		font-size: 0.9rem;
	}

	.expand-btn:hover {
		background: rgba(96, 165, 250, 0.3);
		border-color: rgba(96, 165, 250, 0.6);
	}

	.score-form {
		margin-top: 1rem;
		padding: 1rem;
		background: rgba(15, 23, 42, 0.7);
		border-radius: 0.5rem;
		border-top: 2px solid rgba(96, 165, 250, 0.3);
	}

	.score-inputs {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.input-group label {
		color: #a0aec0;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.input-group input {
		background: rgba(30, 41, 59, 0.8);
		border: 1px solid rgba(96, 165, 250, 0.3);
		color: #e0e7ff;
		padding: 0.5rem;
		border-radius: 0.375rem;
		font-size: 1rem;
	}

	.input-group input:focus {
		outline: none;
		border-color: rgba(96, 165, 250, 0.7);
		background: rgba(30, 41, 59, 1);
		box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
	}

	.submit-btn {
		width: 100%;
		padding: 0.75rem 1rem;
		background: linear-gradient(135deg, #3b82f6, #2563eb);
		color: white;
		border: none;
		border-radius: 0.375rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.submit-btn:hover {
		background: linear-gradient(135deg, #2563eb, #1d4ed8);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
	}

	@media (max-width: 1024px) {
		.tournament-content {
			grid-template-columns: 1fr;
		}

		.bracket-rounds {
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		}
	}

	@media (max-width: 768px) {
		.tournament-title {
			font-size: 1.75rem;
		}

		.score-inputs {
			grid-template-columns: 1fr;
		}
	}
</style>
