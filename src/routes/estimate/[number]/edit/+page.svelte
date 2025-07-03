<!-- src/routes/estimate/[number]/edit/+page.svelte -->

<script lang="ts">
	import ModelSelector from '../../../../components/ModelSelector.svelte';
	import PricingInputs from '../../../../components/PricingInputs.svelte';
	import OptionsAccordion from '../../../../components/OptionsAccordion.svelte';
	import PriceDisplay from '../../../../components/PriceDisplay.svelte';
	import OrderSummary from '../../../../components/OrderSummary.svelte';
	import CustomerInfo from '../../../../components/CustomerInfo.svelte';
	import UpdateEstimate from '../../../../components/UpdateEstimate.svelte';
	import { Button } from 'bits-ui';
	import { goto } from '$app/navigation';
	import type { Tables } from '../../../../lib/types/database.types';

	const { data } = $props<{
		data: {
			estimate: any;
			models: Tables<'models'>[];
			categories: any[];
			isEditing: boolean;
		};
	}>();

	const models = data.models;
	const categories = data.categories;
	const originalEstimate = data.estimate;

	// Initialize state from estimate data
	let modelId = $state<string>(originalEstimate.model_id || '');
	let model = $derived(() => models.find((m: Tables<'models'>) => m.id === modelId));

	// Initialize pricing from estimate
	let dealerMarkup = $state<number>(originalEstimate.pricing_data?.dealer_markup || 0);
	let includeSalesTax = $state<boolean>(originalEstimate.sales_tax > 0);
	let shippingCost = $state<number>(originalEstimate.shipping_cost || 0);

	// Initialize customer info from estimate
	let customerName = $state<string>(originalEstimate.customer_name || '');
	let customerEmail = $state<string>(originalEstimate.customer_email || '');
	let customerPhone = $state<string>(originalEstimate.customer_phone || '');

	// Initialize selections from estimate data
	let singleSelections = $state<Record<string, string>>(
		originalEstimate.selected_options?.single_selections || {}
	);
	let multipleSelections = $state<Record<string, string[]>>(
		originalEstimate.selected_options?.multiple_selections || {}
	);
	let quantities = $state<Record<string, number>>(
		originalEstimate.selected_options?.quantities || {}
	);
	let optionDimensions = $state<
		Record<string, { width?: number; height?: number; location?: string }>
	>(originalEstimate.selected_options?.option_dimensions || {});
	let optionColors = $state<Record<string, string>>(
		originalEstimate.selected_options?.option_colors || {}
	);

	// Format models for dropdown
	let formattedModels = $derived(() =>
		models.map((m: Tables<'models'>) => ({
			value: m.id,
			label: `${m.width}x${m.length} ${m.axle} $${m.starting_price}`
		}))
	);

	// Helper to check if porch is selected (ID 230) and get porch length
	let porchInfo = $derived(() => {
		let porchLength = 0;
		let hasPorch = false;

		// Check single selections for porch (ID 230)
		Object.values(singleSelections).forEach((selectedId) => {
			if (selectedId === '230') {
				hasPorch = true;
				porchLength = quantities[selectedId] || 0;
			}
		});

		// Check multiple selections for porch (ID 230)
		Object.values(multipleSelections).forEach((selectedIds) => {
			if (selectedIds?.length > 0) {
				selectedIds.forEach((selectedId) => {
					if (selectedId === '230') {
						hasPorch = true;
						porchLength += quantities[selectedId] || 0;
					}
				});
			}
		});

		return { hasPorch, porchLength };
	});

	// Calculate base price using manufacturer pricing + dealer markup
	let unitCost = $derived(() => {
		if (!model()) return 0;

		const { hasPorch, porchLength } = porchInfo();

		let mfgBaseCost = Number(model()!.mfg_base_cost) || 0;
		const mfgSurcharge = Number(model()!.mfg_surcharge) || 0;

		// If porch is selected, find the model with the box length
		if (hasPorch && porchLength > 0) {
			const boxLength = model()!.length - porchLength;

			// Find a model with same width/axle but box length
			const boxModel = models.find(
				(m: Tables<'models'>) =>
					m.width === model()!.width && m.axle === model()!.axle && m.length === boxLength
			);

			if (boxModel) {
				mfgBaseCost = Number(boxModel.mfg_base_cost) || 0;
			}
		}

		return mfgBaseCost + mfgSurcharge + dealerMarkup;
	});

	// Get selected options with category info for summary
	let selectedOptions = $derived(() => {
		const options: Array<{
			id: string;
			name: string;
			cost: number;
			cost_mod: string;
			note: string;
			category: string;
			subcategory: string;
		}> = [];

		// Add single selections
		Object.entries(singleSelections).forEach(([subId, selectedId]) => {
			if (selectedId) {
				const option = findOptionById(selectedId, categories);
				const categoryInfo = findCategoryInfoForOption(selectedId, categories);
				if (option && categoryInfo) {
					options.push({
						id: selectedId,
						name: option.name,
						cost: Number(option.cost),
						cost_mod: option.cost_mod || '',
						note: option.note || '',
						category: categoryInfo.categoryName,
						subcategory: categoryInfo.subcategoryName
					});
				}
			}
		});

		// Add multiple selections
		Object.entries(multipleSelections).forEach(([subId, selectedIds]) => {
			if (selectedIds?.length > 0) {
				selectedIds.forEach((selectedId) => {
					const option = findOptionById(selectedId, categories);
					const categoryInfo = findCategoryInfoForOption(selectedId, categories);
					if (option && categoryInfo) {
						options.push({
							id: selectedId,
							name: option.name,
							cost: Number(option.cost),
							cost_mod: option.cost_mod || '',
							note: option.note || '',
							category: categoryInfo.categoryName,
							subcategory: categoryInfo.subcategoryName
						});
					}
				});
			}
		});

		return options;
	});

	// Calculate subtotal (before tax and shipping)
	let subtotal = $derived(() => {
		if (!model()) return 0;

		let total = unitCost(); // Start with calculated base price

		// Add costs from single selections
		Object.values(singleSelections).forEach((selectedId) => {
			if (selectedId) {
				const option = findOptionById(selectedId, categories);
				if (option) {
					const quantity = quantities[selectedId] || 1;
					const cost = Number(option.cost) || 0;

					if (option.cost_mod === 'Each' || option.cost_mod === 'Per Foot') {
						total += cost * quantity;
					} else if (option.cost_mod === 'PLF') {
						total += cost * model()!.length;
					} else if (option.cost_mod === 'Per Axle') {
						total += cost * model()!.axle_value;
					} else {
						total += cost;
					}
				}
			}
		});

		// Add costs from multiple selections
		Object.values(multipleSelections).forEach((selectedIds) => {
			if (selectedIds?.length > 0) {
				selectedIds.forEach((selectedId) => {
					const option = findOptionById(selectedId, categories);
					if (option) {
						const quantity = quantities[selectedId] || 1;
						const cost = Number(option.cost) || 0;

						if (option.cost_mod === 'Each' || option.cost_mod === 'Per Foot') {
							total += cost * quantity;
						} else if (option.cost_mod === 'PLF') {
							total += cost * model()!.length;
						} else if (option.cost_mod === 'Per Axle') {
							total += cost * model()!.axle_value;
						} else {
							total += cost;
						}
					}
				});
			}
		});

		return total;
	});

	// Calculate sales tax (8% of subtotal if enabled)
	let salesTax = $derived(() => {
		return includeSalesTax ? Math.round(subtotal() * 0.08) : 0;
	});

	// Calculate final total (subtotal + sales tax + shipping)
	let finalTotal = $derived(() => {
		return subtotal() + salesTax() + shippingCost;
	});

	// Calculate deposit amount (10% of final total)
	let depositAmount = $derived(() => {
		return Math.round(finalTotal() * 0.1);
	});

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

	// Helper function to find option by ID across all categories
	function findOptionById(id: string, categories: any[]): Tables<'options'> | undefined {
		for (const cat of categories) {
			for (const sub of cat.subcategories) {
				const option = sub.options.find((opt: Tables<'options'>) => String(opt.id) === id);
				if (option) return option;
			}
		}
		return undefined;
	}

	// Helper function to find category and subcategory info for an option
	function findCategoryInfoForOption(
		id: string,
		categories: any[]
	): { categoryName: string; subcategoryName: string } | undefined {
		for (const cat of categories) {
			for (const sub of cat.subcategories) {
				const option = sub.options.find((opt: Tables<'options'>) => String(opt.id) === id);
				if (option) {
					return {
						categoryName: cat.name,
						subcategoryName: sub.name
					};
				}
			}
		}
		return undefined;
	}

	function cancelEdit() {
		goto(`/estimate/${originalEstimate.estimate_number}`);
	}
</script>

<svelte:head>
	<title>Edit Estimate {originalEstimate.estimate_number}</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-4">
	<!-- Header -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">
				Edit Estimate {originalEstimate.estimate_number}
			</h1>
			<p class="mt-1 text-gray-600">
				Created: {new Date(originalEstimate.created_at).toLocaleDateString()} • Expires: {new Date(
					originalEstimate.expires_at
				).toLocaleDateString()}
			</p>
		</div>
		<div class="flex gap-3">
			<Button.Root
				class="rounded-input shadow-mini inline-flex h-10 items-center justify-center bg-gray-600 px-4 text-sm font-semibold text-white hover:bg-gray-700"
				onclick={cancelEdit}
			>
				Cancel
			</Button.Root>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
		<!-- Left Column - Configurator -->
		<div class="flex w-full items-center justify-center">
			<div class="space-y-4">
				<!-- Model selector -->
				<ModelSelector bind:modelId formattedModels={() => formattedModels()} />

				<!-- Show controls when model is selected -->
				{#if model()}
					<!-- Dealer Markup Input -->
					<PricingInputs
						bind:dealerMarkup
						bind:includeSalesTax
						bind:shippingCost
						defaultMarkup={originalEstimate.pricing_data?.dealer_markup || 0}
					/>

					<CustomerInfo bind:customerName bind:customerEmail bind:customerPhone />

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

					<!-- Update Estimate Button -->
					<UpdateEstimate
						estimate={originalEstimate}
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
</div>
