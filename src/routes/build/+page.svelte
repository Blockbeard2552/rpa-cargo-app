<!-- src/routes/build/+page.svelte -->

<script lang="ts">
	import ModelSelector from '../../components/ModelSelector.svelte';
	import PricingInputs from '../../components/PricingInputs.svelte';
	import OptionsAccordion from '../../components/OptionsAccordion.svelte';
	import PriceDisplay from '../../components/PriceDisplay.svelte';
	import OrderSummary from '../../components/OrderSummary.svelte';
	import CustomerInfo from '../../components/CustomerInfo.svelte';
	import SaveEstimate from '../../components/SaveEstimate.svelte';
	import { calculateAllPricing } from '../../utils/price-calculator';
	import type { Tables } from '../../lib/types/database.types';
	import type { FormattedOption } from '../../lib/types/configurator.types';

	// This would come from your page data
	const { data } = $props<{
		data: { models: Tables<'models'>[]; categories: any[] };
	}>();

	const models = data.models;
	const categories = data.categories;

	// Model selection state
	let modelId = $state<string>('');
	let model = $derived(() => models.find((m: Tables<'models'>) => m.id === modelId));

	// Dealer markup state - initialize as 0, will be set when model loads
	let dealerMarkup = $state<number>(0);
	let includeSalesTax = $state<boolean>(false);
	let shippingCost = $state<number>(0);

	let customerName = $state<string>('');
	let customerEmail = $state<string>('');
	let customerPhone = $state<string>('');

	// Format models for dropdown
	let formattedModels = $derived(() =>
		models.map((m: Tables<'models'>) => ({
			value: m.id,
			label: `${m.width}x${m.length} ${m.axle} $${m.starting_price}`
		}))
	);

	// Selection state per subcategory
	let singleSelections = $state<Record<string, string>>({});
	let multipleSelections = $state<Record<string, string[]>>({});
	let quantities = $state<Record<string, number>>({});
	let optionDimensions = $state<
		Record<string, { width?: number; height?: number; location?: string }>
	>({});
	let optionColors = $state<Record<string, string>>({});

	// Update dealer markup when model changes and clear selections
	$effect(() => {
		if (model() && modelId) {
			// Reset selections
			singleSelections = {};
			multipleSelections = {};
			quantities = {};
			optionDimensions = {};
			optionColors = {};
			// Set dealer markup from model
			dealerMarkup = Number(model()!.dealer_mark_up) || 0;
		}
	});

	// Calculate all pricing using the price calculator
	let pricingResult = $derived(() => {
		return calculateAllPricing({
			model: model(),
			models,
			singleSelections,
			multipleSelections,
			quantities,
			categories,
			dealerMarkup,
			includeSalesTax,
			shippingCost
		});
	});

	// Extract individual values for easier use
	let unitCost = $derived(() => pricingResult().unitCost);
	let subtotal = $derived(() => pricingResult().subtotal);
	let finalTotal = $derived(() => pricingResult().finalTotal);
	let depositAmount = $derived(() => pricingResult().depositAmount);
	let salesTax = $derived(() => pricingResult().salesTax);
	let selectedOptions = $derived(() => pricingResult().selectedOptions);
	let porchInfo = $derived(() => pricingResult().porchInfo);
	let boxLength = $derived(() => pricingResult().boxLength);

	// Initialize quantity when option is selected
	$effect(() => {
		// Set default quantities for newly selected options
		Object.values(singleSelections).forEach((selectedId) => {
			if (selectedId && !quantities[selectedId]) {
				quantities[selectedId] = 1;
			}
		});

		Object.values(multipleSelections).forEach((selectedIds) => {
			if (selectedIds?.length > 0) {
				selectedIds.forEach((selectedId) => {
					if (!quantities[selectedId]) {
						quantities[selectedId] = 1;
					}
				});
			}
		});
	});

	// Add some debug info temporarily
	let debugInfo = $derived(() => {
		if (!model()) return null;

		const { hasPorch, porchLength } = porchInfo();

		let mfgBaseCost = Number(model()!.mfg_base_cost) || 0;
		let boxModelFound = false;

		// Same logic as unitCost for debugging
		if (hasPorch && porchLength > 0) {
			const calculatedBoxLength = model()!.length - porchLength;
			const boxModel = models.find(
				(m: Tables<'models'>) =>
					m.width === model()!.width && m.axle === model()!.axle && m.length === calculatedBoxLength
			);

			if (boxModel) {
				mfgBaseCost = Number(boxModel.mfg_base_cost) || 0;
				boxModelFound = true;
			}
		}

		return {
			originalMfgBaseCost: Number(model()!.mfg_base_cost) || 0,
			adjustedMfgBaseCost: mfgBaseCost,
			mfgSurcharge: Number(model()!.mfg_surcharge) || 0,
			dealerMarkup: dealerMarkup,
			unitCost: unitCost(),
			subtotal: subtotal(),
			optionsCost: subtotal() - unitCost(),
			hasPorch: hasPorch,
			porchLength: porchLength,
			boxLength: boxLength(),
			boxModelFound: boxModelFound
		};
	});
</script>

<div class="mx-auto grid max-w-7xl grid-cols-1 gap-8 p-4 lg:grid-cols-2">
	<!-- Left Column - Configurator -->
	<div class="flex w-full items-center justify-center">
		<div class="space-y-4">
			<!-- Model selector -->
			<ModelSelector bind:modelId formattedModels={() => formattedModels()} />

			<!-- Show dealer markup input and other controls when model is selected -->
			{#if model()}
				<!-- Dealer Markup Input -->
				<PricingInputs
					bind:dealerMarkup
					bind:includeSalesTax
					bind:shippingCost
					defaultMarkup={Number(model()!.dealer_mark_up) || 0}
				/>
				<CustomerInfo bind:customerName bind:customerEmail bind:customerPhone />

				<!-- Debug info (remove this later) -->
				<!-- {#if debugInfo()}
					<div
						class="w-full max-w-[296px] rounded-lg border border-blue-200 bg-blue-50 p-4 text-xs"
					>
						<div><strong>Debug Info:</strong></div>
						<div>Original MFG Base Cost: ${debugInfo()?.originalMfgBaseCost}</div>
						<div>Adjusted MFG Base Cost: ${debugInfo()?.adjustedMfgBaseCost}</div>
						<div>MFG Surcharge: ${debugInfo()?.mfgSurcharge}</div>
						<div>Dealer Markup: ${debugInfo()?.dealerMarkup}</div>
						<div>Unit Cost: ${debugInfo()?.unitCost}</div>
						<div>Subtotal: ${debugInfo()?.subtotal}</div>
						<div>Options Cost: ${debugInfo()?.optionsCost}</div>
						<div>Has Porch: {debugInfo()?.hasPorch}</div>
						<div>Porch Length: {debugInfo()?.porchLength}'</div>
						<div>Box Length: {debugInfo()?.boxLength}'</div>
						<div>Box Model Found: {debugInfo()?.boxModelFound}</div>
					</div>
				{/if} -->

				<!-- Price Display -->
				<PriceDisplay
					subtotal={subtotal()}
					finalTotal={finalTotal()}
					unitCost={unitCost()}
					depositAmount={depositAmount()}
					salesTax={salesTax()}
					{shippingCost}
					showBreakdown={true}
					mfgBaseCost={Number(model()!.mfg_base_cost) || 0}
					mfgSurcharge={Number(model()!.mfg_surcharge) || 0}
					{dealerMarkup}
				/>
				{#if model()}
					<SaveEstimate
						model={model()}
						selectedOptions={selectedOptions()}
						{singleSelections}
						{multipleSelections}
						{quantities}
						{optionDimensions}
						{optionColors}
						subtotal={subtotal()}
						finalTotal={finalTotal()}
						depositAmount={depositAmount()}
						salesTax={salesTax()}
						{shippingCost}
						{dealerMarkup}
						{customerName}
						{customerEmail}
						{customerPhone}
					/>
				{/if}
				<!-- Options Accordion -->
				<OptionsAccordion
					{categories}
					model={model()}
					bind:singleSelections
					bind:multipleSelections
					bind:quantities
					bind:optionDimensions
					bind:optionColors
				/>
			{/if}
		</div>
	</div>

	<!-- Right Column - Order Summary -->
	<div class="flex w-full justify-center">
		{#if model()}
			<OrderSummary
				model={model()}
				selectedOptions={selectedOptions()}
				subtotal={subtotal()}
				finalTotal={finalTotal()}
				depositAmount={depositAmount()}
				salesTax={salesTax()}
				unitCost={unitCost()}
				{quantities}
				{optionDimensions}
				{optionColors}
				{customerName}
				{customerEmail}
				{customerPhone}
				{shippingCost}
			/>
		{/if}
	</div>
</div>
