<script lang="ts">
  import { enhance } from '$app/forms';
  export let id: number;
  export let name: string;

  function openDeleteDialog() {
		document.dispatchEvent(new CustomEvent('open-delete-dialog', { detail: { id: id}}));
	}

</script>

<div class="tournament-card">
  <a href="/tournaments/{id}" class="cursor-pointer flex-1">
    <div class="flex items-center gap-5">
            <i class="fa-solid fa-futbol fa-2x"></i>
            <h3 class="font-semibold ">{name}</h3>
    </div> 
  </a>
  <button type="button" class="btn-delete" aria-label="Delete" on:click={openDeleteDialog}><i class="fa-solid fa-trash"></i></button>
</div>

<style>

  .tournament-card {
    text-decoration: none;
    color: inherit;
    width:100%;
    max-width:48rem;
    display:flex;
    align-items:center;
    justify-content:space-between;
    background:rgba(255,255,255,0.1);
    padding:0.75rem;
    border-radius:0.5rem;
    transition:all 0.3s ease;
  }
  
  .tournament-card:hover {
    background:rgba(255,255,255,0.2);
  }
  
  .btn-delete{background:#dc2626;padding:0.4rem 0.6rem;border-radius:0.375rem;border:none;cursor:pointer}
</style>
