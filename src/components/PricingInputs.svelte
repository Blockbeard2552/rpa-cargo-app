<!-- src/components/PricingInputs.svelte -->

<script lang="ts">
	import { Checkbox, Label } from 'bits-ui';
	import Check from 'phosphor-svelte/lib/Check';
	import Minus from 'phosphor-svelte/lib/Minus';

	let {
		dealerMarkup = $bindable(),
		includeSalesTax = $bindable(),
		shippingCost = $bindable(),
		defaultMarkup
	}: {
		dealerMarkup: number;
		includeSalesTax: boolean;
		shippingCost: number;
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
			class="mb-2 flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
		/>
	</div>
	<div class="mb-2 flex items-center justify-between">
		<label for="shipping-cost" class="text-sm font-medium text-slate-700"> Shipping Cost: </label>
	</div>
	<div class="mb-4 flex items-center gap-2">
		<span class="text-sm text-slate-600">$</span>
		<input
			id="shipping-cost"
			type="number"
			min="0"
			step="1"
			bind:value={shippingCost}
			class="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
		/>
	</div>
	<div class="flex items-center justify-end space-x-3">
		<Checkbox.Root
			id="include-sales-tax"
			aria-labelledby="include-sales-tax-label"
			class="border-muted bg-foreground data-[state=unchecked]:border-border-input data-[state=unchecked]:bg-background data-[state=unchecked]:hover:border-dark-40 peer inline-flex size-[25px] items-center justify-center rounded-md border transition-all duration-150 ease-in-out active:scale-[0.98]"
			name="include-sales-tax"
			indeterminate
		>
			{#snippet children({ checked, indeterminate })}
				<div class="text-background inline-flex items-center justify-center">
					{#if indeterminate}
						<Minus class="size-[15px]" weight="bold" />
					{:else if checked}
						<Check class="size-[15px]" weight="bold" />
					{/if}
				</div>
			{/snippet}
		</Checkbox.Root>
		<Label.Root
			id="include-sales-tax-label"
			for="include-sales-tax"
			class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		>
			Include Sales Tax
		</Label.Root>
	</div>
</div>
