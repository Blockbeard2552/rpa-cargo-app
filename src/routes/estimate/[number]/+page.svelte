<!-- src/routes/estimate/[number]/+page.svelte -->

<script lang="ts">
	import OrderSummary from '../../../components/OrderSummary.svelte';
	import { Button } from 'bits-ui';

	const { data }: { data: any } = $props();

	let estimate = data.estimate;
	let isExpired = $derived(() => {
		if (!estimate) return true;
		return new Date(estimate.expires_at) < new Date();
	});

	let daysUntilExpiration = $derived(() => {
		if (!estimate) return 0;
		const now = new Date();
		const expirationDate = new Date(estimate.expires_at);
		const diffTime = expirationDate.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return Math.max(0, diffDays);
	});

	function printEstimate() {
		window.print();
	}

	function convertToOrder() {
		// Redirect to configurator with pre-filled data
		const params = new URLSearchParams({
			estimate: estimate.estimate_number
		});
		window.location.href = `/build?${params.toString()}`;
	}
</script>

<svelte:head>
	<title>Estimate {estimate?.estimate_number || 'Not Found'}</title>
</svelte:head>

<div class="mx-auto max-w-4xl p-4">
	{#if !estimate}
		<div class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
			<h1 class="mb-2 text-2xl font-bold text-red-800">Estimate Not Found</h1>
			<p class="text-red-600">This estimate may have expired or the link is invalid.</p>
			<Button.Root
				class="rounded-input shadow-mini mt-4 inline-flex h-12 items-center justify-center bg-blue-600 px-[21px] text-[15px] font-semibold text-white hover:bg-blue-700"
				href="/build"
			>
				Create New Estimate
			</Button.Root>
		</div>
	{:else if isExpired()}
		<div class="rounded-lg border border-orange-200 bg-orange-50 p-6 text-center">
			<h1 class="mb-2 text-2xl font-bold text-orange-800">Estimate Expired</h1>
			<p class="mb-4 text-orange-600">
				Estimate {estimate.estimate_number} expired on {new Date(
					estimate.expires_at
				).toLocaleDateString()}.
			</p>
			<Button.Root
				class="rounded-input shadow-mini inline-flex h-12 items-center justify-center bg-blue-600 px-[21px] text-[15px] font-semibold text-white hover:bg-blue-700"
				href="/build"
			>
				Create New Estimate
			</Button.Root>
		</div>
	{:else}
		<!-- Header with estimate info and actions -->
		<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Estimate {estimate.estimate_number}</h1>
				<div class="mt-2 space-y-1 text-sm text-gray-600">
					<div>Created: {new Date(estimate.created_at).toLocaleDateString()}</div>
					<div class="flex items-center gap-2">
						<span>Expires in {daysUntilExpiration()} days</span>
						<span
							class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {daysUntilExpiration() <=
							7
								? 'bg-red-100 text-red-700'
								: 'bg-green-100 text-green-700'}"
						>
							{daysUntilExpiration() <= 7 ? 'Expiring Soon' : 'Active'}
						</span>
					</div>
				</div>
			</div>

			<div class="flex gap-3 print:hidden">
				<Button.Root
					class="rounded-input shadow-mini inline-flex h-10 items-center justify-center bg-gray-600 px-4 text-sm font-semibold text-white hover:bg-gray-700"
					onclick={printEstimate}
				>
					Print Estimate
				</Button.Root>
				<Button.Root
					class="rounded-input shadow-mini inline-flex h-10 items-center justify-center bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
					href="/estimate/{estimate.estimate_number}/edit"
				>
					Edit Estimate
				</Button.Root>
				<Button.Root
					class="rounded-input shadow-mini inline-flex h-10 items-center justify-center bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700"
					onclick={convertToOrder}
				>
					Convert to Order
				</Button.Root>
			</div>
		</div>

		<!-- Estimate content -->
		<div class="grid grid-cols-1 gap-8">
			<OrderSummary
				model={estimate.model_data}
				selectedOptions={estimate.selected_options.options_list || []}
				subtotal={estimate.subtotal}
				finalTotal={estimate.final_total}
				depositAmount={estimate.deposit_amount}
				salesTax={estimate.sales_tax}
				unitCost={estimate.pricing_data.unit_cost}
				quantities={estimate.selected_options.quantities || {}}
				optionDimensions={estimate.selected_options.option_dimensions || {}}
				optionColors={estimate.selected_options.option_colors || {}}
				customerName={estimate.customer_name}
				customerEmail={estimate.customer_email}
				customerPhone={estimate.customer_phone || ''}
				shippingCost={estimate.shipping_cost}
			/>
		</div>

		<!-- Footer note -->
		<div
			class="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 print:hidden"
		>
			<div class="mb-2 font-semibold">Important Notes:</div>
			<ul class="list-inside list-disc space-y-1">
				<li>This estimate is valid until {new Date(estimate.expires_at).toLocaleDateString()}</li>
				<li>Prices are subject to change based on material costs and availability</li>
				<li>
					A {((estimate.deposit_amount / estimate.final_total) * 100).toFixed(0)}% deposit is
					required to begin production
				</li>
				<li>Lead times will be confirmed upon order placement</li>
			</ul>
		</div>
	{/if}
</div>

<style>
	@media print {
		.print\:hidden {
			display: none !important;
		}
	}
</style>
