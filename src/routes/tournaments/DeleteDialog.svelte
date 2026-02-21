<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	let dialogElement: HTMLDialogElement;
	let id: number | null;
	let isSubmitting = false;
	let error: string | null = null;

	onMount(() => {
		if (typeof document !== 'undefined') {
			document.addEventListener('open-delete-dialog', (e: Event) => {
				const ev = e as CustomEvent;
				id = ev.detail.id;
				console.log(id)
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
		id = null;
		error = null;
	}
</script>

<dialog bind:this={dialogElement} >
	<div class="modal">
		<h4 class="title">Do you want to delete tournament?</h4>
		<form
			method="POST"
			action="?/deleteUser"
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
			}}>

			{#if error}
				<div class="error-message">{error}</div>
			{/if}

            <input type="hidden" name="id" value={id}/>

			<div class="button-group">
				<button type="submit" 
				disabled={isSubmitting} 
				class="btn-add bg-red-900">
					{isSubmitting ? 'Deleting...' : 'Delete'}
				</button>
				<button type="button" on:click={close} class="btn-cancel bg-green-900">Cancel</button>
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
		font-size:1.5em;
		text-align: center;
		font-weight: bold;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid white;
		margin: 0 0 1.25rem 0;
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

	button {
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

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>