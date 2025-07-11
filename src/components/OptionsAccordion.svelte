<!-- src/components/OptionsAccordion.svelte -->

<script lang="ts">
	import { Accordion } from 'bits-ui';
	import OptionSelect from './OptionSelect.svelte';
	import type { Tables } from '../lib/types/database.types';
	import type { FormattedOption } from '../lib/types/configurator.types';
	import CaretDown from 'phosphor-svelte/lib/CaretDown';

	let {
		categories,
		model,
		singleSelections = $bindable(),
		multipleSelections = $bindable(),
		quantities = $bindable(),
		optionDimensions = $bindable(),
		optionColors = $bindable()
	}: {
		categories: any[];
		model: Tables<'models'> | undefined;
		singleSelections: Record<string, string>;
		multipleSelections: Record<string, string[]>;
		quantities: Record<string, number>;
		optionDimensions: Record<string, { width?: number; height?: number; location?: string }>;
		optionColors: Record<string, string>;
	} = $props();

	// Filter options based on selected model
	function formatOptions(options: Tables<'options'>[]): FormattedOption[] {
		if (!model) {
			const allOptions = options.map((opt) => ({
				value: String(opt.id),
				label: `${opt.name} (${opt.cost})`,
				note: opt.note || ''
			}));

			// Sort alphabetically by label
			return allOptions.sort((a, b) => a.label.localeCompare(b.label));
		}

		const filteredOptions = options.filter((opt) => {
			// Include if for_widths is NULL or contains model width (convert to string)
			const widthMatch = opt.for_widths === null || opt.for_widths.includes(model.width);

			// Include if for_lengths is NULL or contains model length
			const lengthMatch = opt.for_lengths === null || opt.for_lengths.includes(model.length);

			// Include if for_axle_value is NULL or matches model axle (convert types as needed)
			const axleMatch = opt.for_axle_value === null || opt.for_axle_value === model.axle_value;

			// Include if for_axle_value is NULL or matches model axle (convert types as needed)
			const axleLoadMatch =
				opt.for_axle_load === null || opt.for_axle_load === model.standard_axle_load;

			// Option is included only if ALL conditions are met
			return widthMatch && lengthMatch && axleMatch && axleLoadMatch;
		});

		// Log only options for specific subcategory
		const targetSubcategoryId = '0af2111f-095f-492d-aa64-6e3f14cacf8c';
		const targetOptions = filteredOptions.filter(
			(opt) => opt.subcategory_id === targetSubcategoryId
		);
		if (targetOptions.length > 0) {
			console.log(`Filtered options for subcategory ${targetSubcategoryId}:`, targetOptions);
		}

		const formattedOptions = filteredOptions.map((opt) => ({
			value: String(opt.id),
			label: `${opt.name} (${opt.cost})`,
			note: opt.note || ''
		}));

		// Sort alphabetically by label
		return formattedOptions.sort((a, b) => a.label.localeCompare(b.label));
	}
</script>

<Accordion.Root type="multiple" class="w-full sm:max-w-[100%]">
	{#each categories as cat}
		<Accordion.Item value={String(cat.id)} class="border-dark-10 group border-b px-1">
			<Accordion.Header>
				<Accordion.Trigger
					class="flex w-full flex-1 items-center justify-between py-2 text-[15px] font-medium transition-all select-none [&[data-state=open]>span>svg]:rotate-180"
				>
					<span>{cat.name}</span>
					<span
						class="hover:bg-dark-10 inline-flex size-8 items-center justify-center rounded-[7px] bg-transparent"
					>
						<CaretDown class="size-[18px] transition-transform duration-200" />
					</span>
				</Accordion.Trigger>
			</Accordion.Header>
			<Accordion.Content
				class="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm tracking-[-0.01em]"
			>
				<div>
					<p class="text-dark-50 mb-2 text-sm">
						{cat.note || ''}
					</p>
				</div>
				<OptionSelect
					subcategories={cat.subcategories}
					{model}
					bind:singleSelections
					bind:multipleSelections
					bind:quantities
					bind:optionDimensions
					bind:optionColors
					{formatOptions}
				/>
			</Accordion.Content>
		</Accordion.Item>
	{/each}
</Accordion.Root>
