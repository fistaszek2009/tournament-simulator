<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	export let players: any[] = [];

	let dialogElement: HTMLDialogElement;
	let name = '';
	let selectedPlayers = new Set<number>();
	let isSubmitting = false;
	let error: string | null = null;

	onMount(() => {
		if (typeof document !== 'undefined') {
			document.addEventListener('open-player-form', () => {
				open();
			});
		}
	});

	function open() {
		dialogElement?.showModal();
	}

	function close() {
		dialogElement?.close();
		reset();
	}

	function reset() {
		name = '';
		selectedPlayers = new Set<number>();
		error = null;
	}

	function allChecked(){
		selectedPlayers = new Set<number>(players.map(p=>p.id))
	}

	function noneChecked(){
		selectedPlayers = new Set<number>()
	}

	function togglePlayer(playerId: number) {
		if (selectedPlayers.has(playerId)) {
			selectedPlayers.delete(playerId);
		} else {
			selectedPlayers.add(playerId);
		}
		selectedPlayers = selectedPlayers;
	}
</script>

<dialog bind:this={dialogElement} >
	<div class="modal">
		<h4 class="title">Create tournament</h4>
		<form
			method="POST"
			action="?/addTournament"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result }) => {
					isSubmitting = false;
					if (result.type === 'success') {
						error = null;
						close();
						location.reload();
					} else if (result.type === 'failure') {
						error = String(result.data?.message) || 'Błąd';
					}
				};
			}}
		>
			<div class="form-group">
				<input type="text" name="name" placeholder="Tournament Name" bind:value={name} required />
			</div>

			<div class="form-group">
				<div class="flex justify-between items-center mb-2">
					<h4 class="label">Select Players (min 2)</h4>
					<div class="flex gap-2 items-center">
						<button 
						type="button" 
						on:click={allChecked}
						class="text-sm bg-blue-800 py-1 px-3 w-[60px] rounded-sm cursor-pointer duration-200 ease-in-out">
							All
						</button>
						<button 
						type="button" 
						on:click={noneChecked}
						class="text-sm bg-blue-800 py-1 px-3 w-[60px] rounded-sm cursor-pointer duration-200 ease-in-out">
							None
						</button>
					</div>
				</div>
				<div class="players-list">
					{#each players as player (player.id)}
							<label class="player-checkbox cursor-pointer" for="player-{player.id}">
								<input
								type="checkbox"
								id="player-{player.id}"
								value={player.id}
								checked={selectedPlayers.has(player.id)}
								on:change={() => togglePlayer(player.id)}
								name="playerIds"
							/>
								<p>{player.name} {player.surname}</p>
							</label>
					{/each}
				</div>
			</div>

			{#if error}
				<div class="error-message">{error}</div>
			{/if}

			<div class="button-group">
				<button type="submit" disabled={isSubmitting || selectedPlayers.size < 2 || name.trim()==="" } class="btn-add bg-green-900">
					{isSubmitting ? 'Creating...' : 'Create'}
				</button>
				<button type="button" on:click={close} class="btn-cancel bg-red-900">Cancel</button>
			</div>
		</form>
	</div>
</dialog>

<style>
    dialog {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        border: none;
        padding: 0;
        margin: 0;
        background: transparent;
        }

        dialog::backdrop {
        background: rgba(0, 0, 0, 0.4);
        }

        dialog[open] {
        display: flex;
        align-items: center;
        justify-content: center;
        }

	.modal {
		background-color: rgb(107, 114, 128);
		padding: 1rem;
		border-radius: 0.75rem;
		color: white;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 24rem;
	}

	.title {
		font-weight: bold;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid white;
		margin: 0 0 1.25rem 0;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	input[type="text"] {
		color: black;
		padding: 0.4rem;
		outline: none;
		border: none;
		border-radius: 0.5rem;
		width: 100%;
		box-sizing: border-box;
	}

	input[type="text"]:focus {
		box-shadow: 0 0 0 2px rgb(30, 58, 138);
	}

	.label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		color: white;
	}

	.players-list {
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 0.5rem;
		padding: 0.75rem;
		max-height: 200px;
		overflow-y: auto;
	}

	.player-checkbox {
		display: flex;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.player-checkbox input[type="checkbox"] {
		margin-right: 0.5rem;
		
		cursor: pointer;
	}

	.player-checkbox label {
		cursor: pointer;
		color: white;
		font-size: 0.9375rem;
		margin: 0;
	}

	.error-message {
		color: #fca5a5;
		font-size: 0.875rem;
		margin-bottom: 0.75rem;
		padding: 0.5rem;
		background-color: rgba(220, 38, 38, 0.1);
		border-radius: 0.375rem;
	}

	.button-group {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-top: 1.25rem;
	}

	.button-group button {
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s ease-in-out;
		border: none;
		width: 100px;
	}

	button:hover:not(:disabled) {
		transform: scale(1.1);
	}

	.button-group button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

</style>