<!-- src/routes/build/+page.svelte -->

<script lang="ts">
	import ModelSelector from '../../components/ModelSelector.svelte';
	import DealerMarkupInput from '../../components/DealerMarkupInput.svelte';
	import OptionsAccordion from '../../components/OptionsAccordion.svelte';
	import PriceDisplay from '../../components/PriceDisplay.svelte';
	import OrderSummary from '../../components/OrderSummary.svelte';
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

	// Update dealer markup when model changes and clear selections
	$effect(() => {
		if (model() && modelId) {
			// Reset selections
			singleSelections = {};
			multipleSelections = {};
			quantities = {};
			// Set dealer markup from model
			dealerMarkup = Number(model()!.dealer_mark_up) || 0;
		}
	});

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

	// Calculate box length when porch is present
	let boxLength = $derived(() => {
		if (!model()) return 0;

		const { hasPorch, porchLength } = porchInfo();

		if (hasPorch && porchLength > 0) {
			return model()!.length - porchLength;
		}

		return model()!.length;
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
			// If no matching box model found, use original (fallback)
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

	// Calculate total price with all cost modifiers
	let totalPrice = $derived(() => {
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

	// Add some debug info temporarily
	let debugInfo = $derived(() => {
		if (!model()) return null;

		const { hasPorch, porchLength } = porchInfo();

		let mfgBaseCost = Number(model()!.mfg_base_cost) || 0;
		let boxModelFound = false;

		// Same logic as unitCost for debugging
		if (hasPorch && porchLength > 0) {
			const boxLength = model()!.length - porchLength;
			const boxModel = models.find(
				(m: Tables<'models'>) =>
					m.width === model()!.width && m.axle === model()!.axle && m.length === boxLength
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
			totalPrice: totalPrice(),
			optionsCost: totalPrice() - unitCost(),
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
				<DealerMarkupInput bind:dealerMarkup defaultMarkup={Number(model()!.dealer_mark_up) || 0} />

				<!-- Debug info (remove this later) -->
				{#if debugInfo()}
					<div
						class="w-full max-w-[296px] rounded-lg border border-blue-200 bg-blue-50 p-4 text-xs"
					>
						<div><strong>Debug Info:</strong></div>
						<div>OG MFG Base Cost: ${debugInfo()?.originalMfgBaseCost}</div>
						<div>MFG Surcharge: ${debugInfo()?.mfgSurcharge}</div>
						<div>Dealer Markup: ${debugInfo()?.dealerMarkup}</div>
						<div>Unit Cost: ${debugInfo()?.unitCost}</div>
						<div>Total Price: ${debugInfo()?.totalPrice}</div>
						<div>Options Cost: ${debugInfo()?.optionsCost}</div>
						<div>Has Porch: {debugInfo()?.hasPorch}</div>
						<div>Porch Length: {debugInfo()?.porchLength}'</div>
						<div>Box Length: {debugInfo()?.boxLength}'</div>
						<div>Box Model Found: {debugInfo()?.boxModelFound}</div>
						<div>New MFG Base Cost: ${debugInfo()?.adjustedMfgBaseCost}</div>
					</div>
				{/if}

				<!-- Price Display -->
				<PriceDisplay
					totalPrice={totalPrice()}
					unitCost={unitCost()}
					showBreakdown={true}
					mfgBaseCost={Number(model()!.mfg_base_cost) || 0}
					mfgSurcharge={Number(model()!.mfg_surcharge) || 0}
					{dealerMarkup}
				/>

				<!-- Options Accordion -->
				<OptionsAccordion
					{categories}
					model={model()}
					bind:singleSelections
					bind:multipleSelections
					bind:quantities
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
				totalPrice={totalPrice()}
				unitCost={unitCost()}
				{quantities}
			/>
		{/if}
	</div>
</div>
