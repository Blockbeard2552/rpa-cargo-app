<script lang="ts">
	import ModelSelector from '../../components/ModelSelector.svelte';
	import OptionsAccordion from '../../components/OptionsAccordion.svelte';
	import PriceDisplay from '../../components/PriceDisplay.svelte';
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

	// Clear selections when model changes
	$effect(() => {
		if (modelId) {
			singleSelections = {};
			multipleSelections = {};
			quantities = {};
		}
	});

	// Calculate total price with quantity support
	let totalPrice = $derived(() => {
		if (!model()) return 0;

		let total = Number(model()!.starting_price) || 0;

		// Add costs from single selections
		Object.values(singleSelections).forEach((selectedId) => {
			if (selectedId) {
				const option = findOptionById(selectedId, categories);
				if (option) {
					const quantity = quantities[selectedId] || 1;
					const cost = Number(option.cost) || 0;

					if (option.cost_mod === 'Each' || option.cost_mod === 'Per Foot') {
						total += cost * quantity;
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
</script>

<div class="flex w-full items-center justify-center">
	<div class="space-y-4">
		<!-- Model selector -->
		<ModelSelector bind:modelId formattedModels={() => formattedModels()} />

		<!-- Show options and price only when model is selected -->
		{#if model()}
			<!-- Price Display -->
			<PriceDisplay totalPrice={totalPrice()} basePrice={model()!.starting_price} />

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
