<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Tournament from './Tournament.svelte';
	import Form from './Form.svelte';
	import DeleteDialog from './DeleteDialog.svelte';

	function openForm() {
		document.dispatchEvent(new Event('open-player-form'));
	}
</script>

<svelte:head>
	<title>Tournaments</title>
</svelte:head>

<Form players={page.data.players} />
<DeleteDialog/>

<button 
	on:click={openForm}
	class="bg-white text-blue-900 text-xl p-2 w-3xs mx-auto my-5 rounded-md border-4 border-white hover:text-white hover:bg-transparent cursor-pointer duration-300 ease-in" 
>
Create new tournament
</button>

{#if !page.data.tournaments_display || page.data.tournaments_display.length === 0}
	<h2 class="text-2xl font-bold text-white text text-center mt-5">There are no created tournaments yet...</h2>
{:else}
	<h2 class="text-2xl font-bold text-white text text-center mt-5 border-b-2 pb-4">Tournaments</h2>
	<div class="flex flex-col gap-4 items-center py-4 w-full">
		{#each page.data.tournaments_display as t}
			<Tournament id={t.id} name={t.name} />
		{/each}
	</div>
{/if}