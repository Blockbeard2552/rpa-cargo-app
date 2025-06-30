<!-- src/components/PriceDisplay.svelte -->

<script lang="ts">
	let {
		totalPrice,
		unitCost,
		showBreakdown = false,
		mfgBaseCost = 0,
		mfgSurcharge = 0,
		dealerMarkup = 0
	}: {
		totalPrice: number;
		unitCost: number;
		showBreakdown?: boolean;
		mfgBaseCost?: number;
		mfgSurcharge?: number;
		dealerMarkup?: number;
	} = $props();
</script>

<div class="w-full max-w-[296px] rounded-lg border border-slate-200 bg-slate-50 p-4">
	<div class="flex items-center justify-between">
		<span class="text-sm font-medium text-slate-700">Total Price:</span>
		<span class="text-lg font-bold text-slate-900">${totalPrice.toLocaleString()}</span>
	</div>

	{#if showBreakdown}
		<div class="mt-2 space-y-1 text-xs text-slate-500">
			<div class="flex justify-between">
				<span>Mfg Base Cost:</span>
				<span>${mfgBaseCost.toLocaleString()}</span>
			</div>
			<div class="flex justify-between">
				<span>Mfg Surcharge:</span>
				<span>${mfgSurcharge.toLocaleString()}</span>
			</div>
			<div class="flex justify-between">
				<span>Dealer Markup:</span>
				<span>${dealerMarkup.toLocaleString()}</span>
			</div>
			<div class="flex justify-between border-t pt-1">
				<span>Unit Cost:</span>
				<span>${unitCost.toLocaleString()}</span>
			</div>
			<div class="flex justify-between">
				<span>Options:</span>
				<span>${(totalPrice - unitCost).toLocaleString()}</span>
			</div>
		</div>
	{:else}
		<div class="mt-1 text-xs text-slate-500">
			Base: ${unitCost.toLocaleString()} + Options: ${(totalPrice - unitCost).toLocaleString()}
		</div>
	{/if}
</div>
