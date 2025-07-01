<!-- src/components/CustomerInfo.svelte -->

<script lang="ts">
	let {
		customerName = $bindable(),
		customerEmail = $bindable(),
		customerPhone = $bindable()
	}: {
		customerName: string;
		customerEmail: string;
		customerPhone: string;
	} = $props();
</script>

<div class="w-full max-w-[296px] rounded-lg border border-slate-200 bg-slate-50 p-4">
	<div class="mb-2">
		<label for="customer-name" class="block text-sm font-medium text-slate-700">Customer Name</label
		>
		<input
			id="customer-name"
			type="text"
			bind:value={customerName}
			class="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
		/>
	</div>
	<div class="mb-2">
		<label for="customer-email" class="block text-sm font-medium text-slate-700">Email</label>
		<input
			id="customer-email"
			type="email"
			bind:value={customerEmail}
			class="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
		/>
	</div>
	<div>
		<label for="customer-phone" class="block text-sm font-medium text-slate-700">Phone</label>
		<input
			id="customer-phone"
			type="tel"
			bind:value={customerPhone}
			class="mt-1 block w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
		/>
	</div>
</div>
