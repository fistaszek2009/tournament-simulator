<script lang="ts">
  import { enhance } from '$app/forms';
  export let id: number;
  export let name: string;

</script>

<a href="/tournaments/{id}" class="player-card-link cursor-pointer">
  <div class="player-card">
      <div class="flex items-center gap-5">
          <i class="fa-solid fa-futbol fa-2x"></i>
          <h3 class="font-semibold ">{name}</h3>
      </div>
      <form method="POST" action="?/deleteTournament" use:enhance={({ formData }) => {
        return async ({ result }) => {
          if (result.type === 'success') location.reload();
        }
      }}  on:submit|stopPropagation>
        <input type="hidden" name="id" value={id} />
        <button type="submit" class="btn-delete" aria-label="Delete" on:click|stopPropagation><i class="fa-solid fa-trash"></i></button>
      </form>
  </div>
</a>

<style>
  .player-card-link {
    display:block;
    text-decoration: none;
    color: inherit;
    width:100%;
    max-width:48rem;
  }
  
  .player-card{display:flex;align-items:center;justify-content:space-between; background:rgba(255,255,255,0.1);padding:0.75rem;border-radius:0.5rem;transition:all 0.3s ease;}
  
  .player-card-link:hover .player-card {
    background:rgba(255,255,255,0.2);
  }
  
  .btn-delete{background:#dc2626;padding:0.4rem 0.6rem;border-radius:0.375rem;border:none;cursor:pointer}
</style>
