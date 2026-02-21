<script lang="ts">
	function close(){
        this.querySelector("#form")?.style.display = "none"
    }
</script>

<div id="form" class="absolute top-0 left-0 w-full h-full bg-black/40 flex justify-center items-center">
    <div class="bg-gray-500 p-4 rounded-xl text-white shadow-white/50 shadow-sm">
        <h4 class="font-bold w-2xs pb-2 border-b-2">Add new user</h4>
        <div class="flex flex-col gap-4 py-5">
            <input type="text" placeholder="Imię"/>
            <input type="text" placeholder="Nazwisko"/>
            <input type="text" placeholder="Wiek"/>
            <input type="text" placeholder="Kraj"/>
        </div>
        <div class="flex justify-center gap-4">
            <button class="bg-blue-800 px-3 py-2 rounded-lg font-semibold hover:scale-110 ease-in-out duration-200 cursor-pointer w-[100px] text-gray-500" >Add</button>
            <button class="bg-blue-800 px-3 py-2 rounded-lg font-semibold hover:scale-110 ease-in-out duration-200 cursor-pointer w-[100px]" >Cancel</button>
        </div>
    </div>
</div>

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
    input{
        color:black;
        padding:0.4em;
        outline: none;
        border:none;
        border-radius: 0.5rem;
    }
</style>