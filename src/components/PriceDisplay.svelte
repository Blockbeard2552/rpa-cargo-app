<!-- src/components/PriceDisplay.svelte -->

<script lang="ts">
	let {
		subtotal,
		finalTotal,
		unitCost,
		depositAmount,
		salesTax = 0,
		shippingCost = 0,
		showBreakdown = false,
		mfgBaseCost = 0,
		mfgSurcharge = 0,
		dealerMarkup = 0
	}: {
		subtotal: number;
		finalTotal: number;
		unitCost: number;
		depositAmount: number;
		salesTax?: number;
		shippingCost?: number;
		showBreakdown?: boolean;
		mfgBaseCost?: number;
		mfgSurcharge?: number;
		dealerMarkup?: number;
	} = $props();
</script>

<div class="w-full max-w-[296px] rounded-lg border border-slate-200 bg-slate-50 p-4">
	<div class="flex items-center justify-between">
		<span class="text-sm font-medium text-slate-700">Total Price:</span>
		<span class="text-lg font-bold text-slate-900">${finalTotal.toLocaleString()}</span>
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
				<span>${(subtotal - unitCost).toLocaleString()}</span>
			</div>
			<div class="flex justify-between border-t pt-1">
				<span>Subtotal:</span>
				<span>${subtotal.toLocaleString()}</span>
			</div>
			{#if salesTax > 0}
				<div class="flex justify-between">
					<span>Sales Tax (8%):</span>
					<span>${salesTax.toLocaleString()}</span>
				</div>
			{/if}
			<div class="flex justify-between">
				<span>Shipping:</span>
				<span>${shippingCost.toLocaleString()}</span>
			</div>
			{#if salesTax > 0 || shippingCost > 0}
				<div class="flex justify-between border-t pt-1 font-medium">
					<span>Final Total:</span>
					<span>${finalTotal.toLocaleString()}</span>
				</div>
			{/if}
			<div
				class="flex justify-between rounded border-t bg-blue-50 px-2 py-1 pt-1 font-medium text-blue-800"
			>
				<span>Deposit Required (10%):</span>
				<span>${depositAmount.toLocaleString()}</span>
			</div>
		</div>
	{:else}
		<div class="mt-1 space-y-1 text-xs text-slate-500">
			<div>
				Base: ${unitCost.toLocaleString()} + Options: ${(subtotal - unitCost).toLocaleString()}
				{#if salesTax > 0}
					+ Tax: ${salesTax.toLocaleString()}
				{/if}
				{#if shippingCost > 0}
					+ Shipping: ${shippingCost.toLocaleString()}
				{/if}
			</div>
			<div class="font-medium text-blue-700">
				Deposit Required: ${depositAmount.toLocaleString()}
			</div>
		</div>
	{/if}
</div>
