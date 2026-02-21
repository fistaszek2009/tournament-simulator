<script lang="ts">
  import { enhance } from '$app/forms';
  export let id: number;
  export let name: string;
  export let surname: string;
  export let age: number;
  export let country: string;

  function openEdit() {
    document.dispatchEvent(new CustomEvent('open-player-form', { detail: { mode: 'edit', user: { id, name, surname, age, country } } }));
  }
</script>

<div class="player-card">
    <div class="flex items-center gap-5">
        <i class="fa-solid fa-user fa-2x"></i>
        <div class="player-info">
            <h3 class="player-name">{name} {surname}</h3>
            <div class="player-meta">Wiek: {age} • {country}
        </div>
    </div>
    </div>
  <div class="player-actions">
    <button class="btn-edit" on:click={openEdit} aria-label="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
    <form method="POST" action="?/deleteUser" use:enhance={({ formData }) => {
      return async ({ result }) => {
        if (result.type === 'success') location.reload();
      }
    }}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" class="btn-delete" aria-label="Delete"><i class="fa-solid fa-trash"></i></button>
    </form>
  </div>
</div>

<style>
  .player-card{display:flex;align-items:center;justify-content:space-between;width:100%;max-width:48rem;background:rgba(255,255,255,0.1);padding:0.75rem;border-radius:0.5rem}
  .player-name{font-weight:700;margin:0}
  .player-meta{font-size:0.9rem;color:rgba(255,255,255,0.75)}
  .player-actions{display:flex;gap:0.5rem}
  .btn-edit{background:#f59e0b;padding:0.4rem 0.6rem;border-radius:0.375rem;border:none;cursor:pointer}
  .btn-delete{background:#dc2626;padding:0.4rem 0.6rem;border-radius:0.375rem;border:none;cursor:pointer}
</style>
