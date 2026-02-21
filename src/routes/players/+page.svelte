<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Form from './Form.svelte';
	import Player from './Player.svelte';

	function openForm() {
		document.dispatchEvent(new Event('open-player-form'));
	}
</script>

<svelte:head>
	<title>Players</title>
</svelte:head>

<button
	on:click={openForm}
	class="bg-white text-blue-900 text-xl p-2 w-3xs mx-auto my-5 rounded-md border-4 border-white hover:text-white hover:bg-transparent cursor-pointer duration-300 ease-in"
>
	Create new player
</button>
<Form />

{#if !page.data.users || page.data.users.length === 0}
	<h2 class="text-2xl font-bold text-white text text-center mt-5">There are no added players yet...</h2>
{:else}
	<h2 class="text-2xl font-bold text-white text text-center mt-5 border-b-2 pb-4">Players</h2>
	<div class="flex flex-col gap-4 items-center py-4 w-full">
		{#each page.data.users as u}
			<Player id={u.id} name={u.name} surname={u.surname} age={u.age} country={u.country} />
		{/each}
	</div>
{/if}