<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import logo from '$lib/images/trophy.svg';
</script>

<header class="bg-gray-700 flex justify-between">
	<div class="flex items-center justify-center p-3 gap-2">
			<img src={logo} class="w-[45px]" alt="Throphy logo"/>
			<h1 class="font-bold text-white text-2xl">Tournament simulator</h1>
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
		font-size: 1em;
		font-weight: 600;
		width:140px;
	}
	@media (max-width: 750px) {
		header>div>h1{display: none;}
	}	
	@media (max-width: 700px) {
		nav a{
			width:100px;
			font-size: 0.9em;
		}
	}	
</style>