<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Form from './Form.svelte';
</script>

<svelte:head>
	<title>Players</title>
</svelte:head>

<p>{ page.data.x }</p>
<button class="bg-white text-blue-900 text-xl p-2 w-3xs mx-auto my-5 rounded-md border-4 border-white hover:text-white hover:bg-transparent cursor-pointer duration-300 ease-in ">Create new user</button>
<Form></Form>