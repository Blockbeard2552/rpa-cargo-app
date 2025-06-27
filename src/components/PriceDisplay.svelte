<script lang="ts">
	let {
		totalPrice,
		basePrice
	}: {
		totalPrice: number;
		basePrice: number;
	} = $props();
</script>

<div class="w-full max-w-[296px] rounded-lg border border-slate-200 bg-slate-50 p-4">
	<div class="flex items-center justify-between">
		<span class="text-sm font-medium text-slate-700">Total Price:</span>
		<span class="text-lg font-bold text-slate-900">${totalPrice.toLocaleString()}</span>
	</div>
	<div class="mt-1 text-xs text-slate-500">
		Base: ${basePrice.toLocaleString()} + Options: ${(totalPrice - basePrice).toLocaleString()}
	</div>
</div>
