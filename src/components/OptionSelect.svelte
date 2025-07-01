<!-- src/components/OptionSelect.svelte -->

<script lang="ts">
	import CaretUpDown from 'phosphor-svelte/lib/CaretUpDown';
	import CaretDoubleUp from 'phosphor-svelte/lib/CaretDoubleUp';
	import CaretDoubleDown from 'phosphor-svelte/lib/CaretDoubleDown';
	import { Select } from 'bits-ui';
	import type { Tables } from '../lib/types/database.types';
	import type { FormattedOption } from '../lib/types/configurator.types';

	let {
		subcategories,
		model,
		singleSelections = $bindable(),
		multipleSelections = $bindable(),
		quantities = $bindable(),
		optionDimensions = $bindable(),
		optionColors = $bindable(),
		formatOptions
	}: {
		subcategories: any[];
		model: Tables<'models'> | undefined;
		singleSelections: Record<string, string>;
		multipleSelections: Record<string, string[]>;
		quantities: Record<string, number>;
		optionDimensions: Record<string, { width?: number; height?: number; location?: string }>;
		optionColors: Record<string, string>;
		formatOptions: (options: Tables<'options'>[]) => FormattedOption[];
	} = $props();

	// Derive selected options for each subcategory
	let selectedOptionsForSub = $derived.by(() => {
		const result: Record<string, Array<{ id: string; option: Tables<'options'> }>> = {};

		// Access the reactive variables to ensure proper reactivity
		const currentSingleSelections = singleSelections;
		const currentMultipleSelections = multipleSelections;

		subcategories.forEach((sub: any) => {
			result[sub.id] = [];

			if (
				sub.multiple &&
				currentMultipleSelections[sub.id] &&
				Array.isArray(currentMultipleSelections[sub.id])
			) {
				currentMultipleSelections[sub.id].forEach((selectedId: string) => {
					const option = sub.options.find(
						(opt: Tables<'options'>) => String(opt.id) === String(selectedId)
					);
					if (option) {
						result[sub.id].push({ id: String(selectedId), option });
					}
				});
			} else if (!sub.multiple && currentSingleSelections[sub.id]) {
				const selectedId = currentSingleSelections[sub.id];
				const option = sub.options.find(
					(opt: Tables<'options'>) => String(opt.id) === String(selectedId)
				);
				if (option) {
					result[sub.id].push({ id: String(selectedId), option });
				}
			}
		});

		return result;
	});

	// Helper function to get effective cost
	function getEffectiveCost(option: Tables<'options'>): number {
		const quantity = quantities[String(option.id)] || 1;
		const baseCost = Number(option.cost);

		if (option.cost_mod === 'Each' || option.cost_mod === 'Per Foot') {
			return baseCost * quantity;
		} else if (option.cost_mod === 'PLF' && model) {
			return baseCost * model.length;
		} else if (option.cost_mod === 'Per Axle' && model) {
			return baseCost * model.axle_value;
		}
		return baseCost;
	}

	// Helper function to get cost display text
	function getCostDisplay(option: Tables<'options'>): string {
		const quantity = quantities[String(option.id)] || 1;
		const baseCost = Number(option.cost);

		if (option.cost_mod === 'Each' || option.cost_mod === 'Per Foot') {
			const totalCost = baseCost * quantity;
			return `$${totalCost} (${quantity} × $${baseCost} ${option.cost_mod.toLowerCase()})`;
		} else if (option.cost_mod === 'PLF' && model) {
			const totalCost = baseCost * model.length;
			return `$${totalCost} (${model.length}' × $${baseCost} PLF)`;
		} else if (option.cost_mod === 'Per Axle' && model) {
			const totalCost = baseCost * model.axle_value;
			return `$${totalCost} (${model.axle_value} axles × $${baseCost} per axle)`;
		}
		return `$${baseCost}`;
	}

	// Function to update quantity and ensure minimum of 1
	function updateQuantity(optionId: string, newQuantity: number) {
		quantities[optionId] = Math.max(1, newQuantity);
	}

	// Helper to get dimension value (safe for reactive contexts)
	function getDimensionValue(optionId: string, field: 'width' | 'height' | 'location'): any {
		return optionDimensions[optionId]?.[field] || (field === 'location' ? '' : '');
	}

	// Helper to set dimension value
	function setDimensionValue(optionId: string, field: 'width' | 'height' | 'location', value: any) {
		if (!optionDimensions[optionId]) {
			optionDimensions[optionId] = {};
		}
		optionDimensions[optionId][field] = value || undefined;
	}

	// Helper to ensure dimension object exists (for inputs)
	function ensureDimensionObject(optionId: string) {
		if (!optionDimensions[optionId]) {
			optionDimensions[optionId] = {};
		}
	}

	// Helper to format color options for select
	function formatColorOptions(colorOptions: string[]): FormattedOption[] {
		return colorOptions.map((color) => ({
			value: color,
			label: color
		}));
	}
</script>

<div class="space-y-3 pt-1 pb-4">
	{#each subcategories as sub}
		<div class="space-y-2">
			{#if sub.multiple}
				<Select.Root
					type="multiple"
					bind:value={multipleSelections[sub.id]}
					items={formatOptions(sub.options)}
				>
					<Select.Trigger
						class="h-input rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-[296px] items-center border px-[11px] text-sm transition-colors select-none"
						aria-label={`Select ${sub.name}`}
					>
						{sub.name}
						<CaretUpDown class="text-muted-foreground ml-auto size-6" />
					</Select.Trigger>
					<Select.Portal>
						<Select.Content
							class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state-closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 h-96 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-xl border px-1 py-3 outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
							sideOffset={10}
						>
							<Select.ScrollUpButton class="flex w-full items-center justify-center">
								<CaretDoubleUp class="size-3" />
							</Select.ScrollUpButton>
							<Select.Viewport>
								{#each formatOptions(sub.options) as opt}
									<Select.Item value={opt.value} label={opt.label}>
										<div>
											{opt.label}
											{#if opt.note}
												<span class="text-xs text-gray-500"> - {opt.note}</span>
											{/if}
										</div>
									</Select.Item>
								{/each}
							</Select.Viewport>
							<Select.ScrollDownButton class="flex w-full items-center justify-center">
								<CaretDoubleDown class="size-3" />
							</Select.ScrollDownButton>
						</Select.Content>
					</Select.Portal>
				</Select.Root>
			{:else}
				<Select.Root
					type="single"
					bind:value={singleSelections[sub.id]}
					items={formatOptions(sub.options)}
				>
					<Select.Trigger
						class="h-input rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-[296px] items-center border px-[11px] text-sm transition-colors select-none"
						aria-label={`Select ${sub.name}`}
					>
						{sub.name}
						<CaretUpDown class="text-muted-foreground ml-auto size-6" />
					</Select.Trigger>
					<Select.Portal>
						<Select.Content
							class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state-closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 h-96 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-xl border px-1 py-3 outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
							sideOffset={10}
						>
							<Select.ScrollUpButton class="flex w-full items-center justify-center">
								<CaretDoubleUp class="size-3" />
							</Select.ScrollUpButton>
							<Select.Viewport>
								{#each formatOptions(sub.options) as opt}
									<Select.Item value={opt.value} label={opt.label}>
										{opt.label}
										{#if opt.note}
											<span class="text-xs text-gray-500"> - {opt.note}</span>
										{/if}
									</Select.Item>
								{/each}
							</Select.Viewport>
							<Select.ScrollDownButton class="flex w-full items-center justify-center">
								<CaretDoubleDown class="size-3" />
							</Select.ScrollDownButton>
						</Select.Content>
					</Select.Portal>
				</Select.Root>
			{/if}

			<!-- Pills for selected options -->
			{#if selectedOptionsForSub[sub.id] && selectedOptionsForSub[sub.id].length > 0}
				<div class="space-y-3">
					{#each selectedOptionsForSub[sub.id] as { id: selectedId, option }}
						<div class="w-full space-y-2">
							<!-- Pill -->
							<div
								class="inline-flex items-center gap-1 rounded-full border border-{sub.multiple
									? 'blue'
									: 'green'}-200 bg-{sub.multiple
									? 'blue'
									: 'green'}-100 px-2 py-1 text-xs text-{sub.multiple ? 'blue' : 'green'}-800"
							>
								<span>{option.name} ({getCostDisplay(option)})</span>
								<button
									type="button"
									class="ml-1 rounded-full p-0.5 text-{sub.multiple
										? 'blue'
										: 'green'}-600 transition-colors hover:bg-{sub.multiple
										? 'blue'
										: 'green'}-200 hover:text-{sub.multiple ? 'blue' : 'green'}-800"
									onclick={() => {
										if (sub.multiple) {
											multipleSelections[sub.id] = multipleSelections[sub.id].filter(
												(id) => id !== selectedId
											);
										} else {
											singleSelections[sub.id] = '';
										}
										delete quantities[selectedId];
										delete optionDimensions[selectedId];
										delete optionColors[selectedId];
									}}
									aria-label="Remove option"
								>
									×
								</button>
							</div>

							<!-- Inputs below the pill -->
							<div class="ml-4 space-y-2">
								<!-- Quantity input -->
								{#if option.cost_mod === 'Each' || option.cost_mod === 'Per Foot'}
									<div class="flex items-center gap-2">
										<label
											for="qty-{selectedId}"
											class="text-xs text-{sub.multiple ? 'blue' : 'green'}-700">Quantity:</label
										>
										<input
											id="qty-{selectedId}"
											type="number"
											min="1"
											value={quantities[selectedId] || 1}
											oninput={(e) =>
												updateQuantity(selectedId, parseInt(e.currentTarget.value) || 1)}
											class="w-16 rounded border border-{sub.multiple
												? 'blue'
												: 'green'}-300 px-2 py-1 text-xs"
										/>
										<span class="text-xs text-{sub.multiple ? 'blue' : 'green'}-600"
											>{option.cost_mod.toLowerCase()}</span
										>
									</div>
								{/if}

								<!-- Width input -->
								{#if option.include_width}
									<div class="flex items-center gap-2">
										<label
											for="width-{selectedId}"
											class="text-xs text-{sub.multiple ? 'blue' : 'green'}-700">Width:</label
										>
										<input
											id="width-{selectedId}"
											type="number"
											min="0"
											step="0.25"
											value={getDimensionValue(selectedId, 'width')}
											oninput={(e) => {
												ensureDimensionObject(selectedId);
												setDimensionValue(selectedId, 'width', parseFloat(e.currentTarget.value));
											}}
											class="w-20 rounded border border-{sub.multiple
												? 'blue'
												: 'green'}-300 px-2 py-1 text-xs"
											placeholder="Width"
										/>
										<span class="text-xs text-{sub.multiple ? 'blue' : 'green'}-600">inches</span>
									</div>
								{/if}

								<!-- Height input -->
								{#if option.include_height}
									<div class="flex items-center gap-2">
										<label
											for="height-{selectedId}"
											class="text-xs text-{sub.multiple ? 'blue' : 'green'}-700">Height:</label
										>
										<input
											id="height-{selectedId}"
											type="number"
											min="0"
											step="0.25"
											value={getDimensionValue(selectedId, 'height')}
											oninput={(e) => {
												ensureDimensionObject(selectedId);
												setDimensionValue(selectedId, 'height', parseFloat(e.currentTarget.value));
											}}
											class="w-20 rounded border border-{sub.multiple
												? 'blue'
												: 'green'}-300 px-2 py-1 text-xs"
											placeholder="Height"
										/>
										<span class="text-xs text-{sub.multiple ? 'blue' : 'green'}-600">inches</span>
									</div>
								{/if}

								<!-- Location input -->
								{#if option.include_location}
									<div class="flex items-center gap-2">
										<label
											for="location-{selectedId}"
											class="text-xs text-{sub.multiple ? 'blue' : 'green'}-700">Location:</label
										>
										<input
											id="location-{selectedId}"
											type="text"
											value={getDimensionValue(selectedId, 'location')}
											oninput={(e) => {
												ensureDimensionObject(selectedId);
												setDimensionValue(selectedId, 'location', e.currentTarget.value);
											}}
											class="w-32 rounded border border-{sub.multiple
												? 'blue'
												: 'green'}-300 px-2 py-1 text-xs"
											placeholder="Location"
										/>
									</div>
								{/if}

								<!-- Color selection -->
								{#if option.color_options && option.color_options.length > 0}
									<div class="flex items-center gap-2">
										<label
											for="color-{selectedId}"
											class="text-xs text-{sub.multiple ? 'blue' : 'green'}-700">Color:</label
										>
										<Select.Root
											type="single"
											bind:value={optionColors[selectedId]}
											items={formatColorOptions(option.color_options)}
										>
											<Select.Trigger
												class="h-input rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-32 items-center border px-[8px] text-xs transition-colors select-none"
												aria-label="Select color"
											>
												{optionColors[selectedId] || 'Select color'}
												<CaretUpDown class="text-muted-foreground ml-auto size-4" />
											</Select.Trigger>
											<Select.Portal>
												<Select.Content
													class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state-closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-[200px] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-xl border px-1 py-3 outline-hidden select-none"
													sideOffset={5}
												>
													<Select.ScrollUpButton class="flex w-full items-center justify-center">
														<CaretDoubleUp class="size-3" />
													</Select.ScrollUpButton>
													<Select.Viewport>
														{#each formatColorOptions(option.color_options) as colorOpt}
															<Select.Item value={colorOpt.value} label={colorOpt.label}>
																{colorOpt.label}
															</Select.Item>
														{/each}
													</Select.Viewport>
													<Select.ScrollDownButton class="flex w-full items-center justify-center">
														<CaretDoubleDown class="size-3" />
													</Select.ScrollDownButton>
												</Select.Content>
											</Select.Portal>
										</Select.Root>
									</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>
