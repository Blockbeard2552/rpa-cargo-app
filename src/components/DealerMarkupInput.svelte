<script lang="ts">
	let {
		dealerMarkup = $bindable(),
		defaultMarkup
	}: {
		dealerMarkup: number;
		defaultMarkup: number;
	} = $props();

	function resetToDefault() {
		dealerMarkup = defaultMarkup;
	}
</script>

<div class="w-full max-w-[296px] rounded-lg border border-slate-200 bg-slate-50 p-4">
	<div class="mb-2 flex items-center justify-between">
		<label for="dealer-markup" class="text-sm font-medium text-slate-700"> Dealer Markup: </label>
		<button
			type="button"
			onclick={resetToDefault}
			class="text-xs text-blue-600 hover:text-blue-800"
		>
			Reset to Default
		</button>
	</div>
	<div class="flex items-center gap-2">
		<span class="text-sm text-slate-600">$</span>
		<input
			id="dealer-markup"
			type="number"
			min="0"
			step="1"
			bind:value={dealerMarkup}
			class="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
		/>
	</div>
	<div class="mt-1 text-xs text-slate-500">
		Default: ${defaultMarkup.toLocaleString()}
	</div>
</div>
