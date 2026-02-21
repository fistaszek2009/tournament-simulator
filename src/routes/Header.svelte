<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import logo from '$lib/images/trophy.svg';
</script>

<header class="bg-gray-700 flex justify-between">
	<div class="flex items-center justify-center w-20 p-3">
			<img src={logo} alt="Throphy logo"/>
	</div>

	<nav class="flex justify-center items-center">
		<a href={resolve('/')} class="hover:bg-gray-600 duration-300 ease-out">Home</a>
		<a href={resolve('/players')} class="hover:bg-gray-600 duration-300 ease-out">Players</a>
		<a href={resolve('/tournaments')} class="hover:bg-gray-600 duration-300 ease-out">Tournaments</a>
	</nav>
</header>

<style>
	nav a{
		color:white;
		height:100%;
		display:flex;
		justify-content: center;
		align-items: center;
		font-size: 1.25em;
		font-weight: 700;
		width:160px;
	}
</style>