<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	let dialogElement: HTMLDialogElement;
	let name = '';
	let surname = '';
	let age = '';
	let country = '';
	let id: number | null = null;
	let mode: 'add' | 'edit' = 'add';
	let actionUrl = '?/addUser';
	let isSubmitting = false;
	let error: string | null = null;

	onMount(() => {
		if (typeof document !== 'undefined') {
			document.addEventListener('open-player-form', (e: Event) => {
				const ev = e as CustomEvent;
				if (ev?.detail?.mode === 'edit' && ev.detail.user) {
					const u = ev.detail.user;
					id = u.id;
					name = u.name;
					surname = u.surname;
					age = String(u.age);
					country = u.country;
					mode = 'edit';
					actionUrl = '?/editUser';
				} else {
					mode = 'add';
					actionUrl = '?/addUser';
				}
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
		surname = '';
		age = '';
		country = '';
		id = null;
		mode = 'add';
		actionUrl = '?/addUser';
		error = null;
	}
</script>

<dialog bind:this={dialogElement} >
	<div class="modal">
		<h4 class="title">{mode === 'add' ? 'Add new user' : 'Edit user'}</h4>
		<form
			method="POST"
			action={actionUrl}
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
			{#if mode === 'edit'}
				<input type="hidden" name="id" value={id} />
			{/if}
			<div class="form-group">
				<input type="text" name="name" placeholder="Name" bind:value={name} required />
			</div>
			<div class="form-group">
				<input type="text" name="surname" placeholder="Surname" bind:value={surname} required />
			</div>
			<div class="form-group">
				<input type="number" name="age" placeholder="Age" bind:value={age} min="1" max="150" required />
			</div>
			<div class="form-group">
				<input type="text" name="country" placeholder="Country" bind:value={country} required />
			</div>

			{#if error}
				<div class="error-message">{error}</div>
			{/if}

			<div class="button-group">
				<button type="submit" 
				disabled={isSubmitting || name.trim() === "" || surname.trim() === "" || country.trim() === "" || !age} 
				class="btn-add bg-green-900">
					{isSubmitting ? (mode === 'add' ? 'Adding...' : 'Saving...') : (mode === 'add' ? 'Add' : 'Save')}
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

	input {
		color: black;
		padding: 0.4rem;
		outline: none;
		border: none;
		border-radius: 0.5rem;
		width: 100%;
		box-sizing: border-box;
	}

	input:focus {
		box-shadow: 0 0 0 2px rgb(30, 58, 138);
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