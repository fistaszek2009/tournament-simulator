<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.data.tournament.name}</title>
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
					{#each page.data.members as member (member.id)}
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
			<h2 class="section-title">Tournament Bracket</h2>
			<div class="bracket-placeholder">
				<p>Tournament bracket will be displayed here using brackets-manager and brackets-viewer</p>
			</div>
		</div>
	</div>
</div>

<style>
	.tournament-container {
		max-width: 1200px;
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
		grid-template-columns: 1fr 2fr;
		gap: 2rem;
	}

	.members-section,
	.bracket-section {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 0.75rem;
		padding: 1.5rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
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

	.bracket-placeholder {
		background: rgba(30, 41, 59, 0.5);
		border: 2px dashed rgba(96, 165, 250, 0.4);
		border-radius: 0.5rem;
		padding: 3rem 1rem;
		text-align: center;
		color: #94a3b8;
		min-height: 300px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@media (max-width: 768px) {
		.tournament-content {
			grid-template-columns: 1fr;
		}

		.tournament-title {
			font-size: 1.75rem;
		}
	}
</style>
