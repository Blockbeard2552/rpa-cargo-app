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
		formatOptions
	}: {
		subcategories: any[];
		model: Tables<'models'> | undefined;
		singleSelections: Record<string, string>;
		multipleSelections: Record<string, string[]>;
		quantities: Record<string, number>;
		optionDimensions: Record<string, { width?: number; height?: number; location?: string }>;
		formatOptions: (options: Tables<'options'>[]) => FormattedOption[];
	} = $props();

	// Initialize dimension objects when options are selected
	$effect(() => {
		// Initialize for single selections
		Object.values(singleSelections).forEach((selectedId) => {
			if (selectedId && !optionDimensions[selectedId]) {
				optionDimensions[selectedId] = {};
			}
		});

		// Initialize for multiple selections
		Object.values(multipleSelections).forEach((selectedIds) => {
			if (selectedIds?.length > 0) {
				selectedIds.forEach((selectedId) => {
					if (!optionDimensions[selectedId]) {
						optionDimensions[selectedId] = {};
					}
				});
			}
		});
	});

	// Helper function to get effective cost (cost * quantity, cost * model.length, or cost * model.axle_value)
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
</script>

<div class="space-y-3 pt-1 pb-4">
	{#each subcategories as sub}
		{#if sub.multiple}
			<div class="space-y-2">
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
							class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 h-96 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-xl border px-1 py-3 outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
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

				<!-- Pills for multiple selection -->
				{#if multipleSelections[sub.id]?.length > 0}
					<div class="space-y-3">
						{#each multipleSelections[sub.id] as selectedId}
							{@const selectedOption = sub.options.find(
								(opt: Tables<'options'>) => String(opt.id) === selectedId
							)}
							{#if selectedOption}
								<!-- Pill -->
								<div
									class="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-2 py-1 text-xs text-blue-800"
								>
									<span>{selectedOption.name} ({getCostDisplay(selectedOption)})</span>
									<button
										type="button"
										class="ml-1 rounded-full p-0.5 text-blue-600 transition-colors hover:bg-blue-200 hover:text-blue-800"
										onclick={() => {
											multipleSelections[sub.id] = multipleSelections[sub.id].filter(
												(id) => id !== selectedId
											);
											delete quantities[selectedId];
											delete optionDimensions[selectedId];
										}}
										aria-label="Remove option"
									>
										<svg
											class="h-3 w-3"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path d="M18 6L6 18M6 6l12 12" />
										</svg>
									</button>
								</div>

								<!-- Inputs below the pill -->
								<div class="ml-4 space-y-2">
									<!-- Quantity input -->
									{#if selectedOption.cost_mod === 'Each' || selectedOption.cost_mod === 'Per Foot'}
										<div class="flex items-center gap-2">
											<label for="qty-{selectedId}" class="text-xs text-blue-700">Quantity:</label>
											<input
												id="qty-{selectedId}"
												type="number"
												min="1"
												bind:value={quantities[selectedId]}
												oninput={(e) =>
													updateQuantity(selectedId, parseInt(e.currentTarget.value) || 1)}
												class="w-16 rounded border border-blue-300 px-2 py-1 text-xs"
											/>
											<span class="text-xs text-blue-600"
												>{selectedOption.cost_mod.toLowerCase()}</span
											>
										</div>
									{/if}

									<!-- Width input -->
									{#if selectedOption.include_width}
										<div class="flex items-center gap-2">
											<label for="width-{selectedId}" class="text-xs text-blue-700">Width:</label>
											<input
												id="width-{selectedId}"
												type="number"
												min="0"
												step="0.25"
												bind:value={optionDimensions[selectedId].width}
												class="w-20 rounded border border-blue-300 px-2 py-1 text-xs"
												placeholder="Width"
											/>
											<span class="text-xs text-blue-600">inches</span>
										</div>
									{/if}

									<!-- Height input -->
									{#if selectedOption.include_height}
										<div class="flex items-center gap-2">
											<label for="height-{selectedId}" class="text-xs text-blue-700">Height:</label>
											<input
												id="height-{selectedId}"
												type="number"
												min="0"
												step="0.25"
												bind:value={optionDimensions[selectedId].height}
												class="w-20 rounded border border-blue-300 px-2 py-1 text-xs"
												placeholder="Height"
											/>
											<span class="text-xs text-blue-600">inches</span>
										</div>
									{/if}

									<!-- Location input -->
									{#if selectedOption.include_location}
										<div class="flex items-center gap-2">
											<label for="location-{selectedId}" class="text-xs text-blue-700"
												>Location:</label
											>
											<input
												id="location-{selectedId}"
												type="text"
												bind:value={optionDimensions[selectedId].location}
												class="w-32 rounded border border-blue-300 px-2 py-1 text-xs"
												placeholder="Location"
											/>
										</div>
									{/if}
								</div>
							{/if}
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<div class="space-y-2">
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
							class="focus-override border-muted bg-background shadow-popover data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 h-96 max-h-[var(--bits-select-content-available-height)] w-[var(--bits-select-anchor-width)] min-w-[var(--bits-select-anchor-width)] rounded-xl border px-1 py-3 outline-hidden select-none data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
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

				<!-- Pill for single selection -->
				{#if singleSelections[sub.id]}
					{@const selectedOption = sub.options.find(
						(opt: Tables<'options'>) => String(opt.id) === singleSelections[sub.id]
					)}
					{#if selectedOption}
						<div class="space-y-2">
							<!-- Pill -->
							<div
								class="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-2 py-1 text-xs text-green-800"
							>
								<span>{selectedOption.name} ({getCostDisplay(selectedOption)})</span>
								<button
									type="button"
									onclick={() => {
										const optionId = singleSelections[sub.id];
										singleSelections[sub.id] = '';
										delete quantities[optionId];
										delete optionDimensions[optionId];
									}}
									aria-label="Remove option"
								>
									<svg
										class="h-3 w-3"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
									>
										<path d="M18 6L6 18M6 6l12 12" />
									</svg>
								</button>
							</div>

							<!-- Inputs below the pill -->
							<div class="ml-4 space-y-2">
								<!-- Quantity input -->
								{#if selectedOption.cost_mod === 'Each' || selectedOption.cost_mod === 'Per Foot'}
									<div class="flex items-center gap-2">
										<label
											for="qty-single-{singleSelections[sub.id]}"
											class="text-xs text-green-700"
										>
											Quantity:
										</label>
										<input
											id="qty-single-{singleSelections[sub.id]}"
											type="number"
											min="1"
											bind:value={quantities[singleSelections[sub.id]]}
											oninput={(e) =>
												updateQuantity(
													singleSelections[sub.id],
													parseInt(e.currentTarget.value) || 1
												)}
											class="w-16 rounded border border-green-300 px-2 py-1 text-xs"
										/>
										<span class="text-xs text-green-600"
											>{selectedOption.cost_mod.toLowerCase()}</span
										>
									</div>
								{/if}

								<!-- Width input -->
								{#if selectedOption.include_width}
									<div class="flex items-center gap-2">
										<label
											for="width-single-{singleSelections[sub.id]}"
											class="text-xs text-green-700">Width:</label
										>
										<input
											id="width-single-{singleSelections[sub.id]}"
											type="number"
											min="0"
											step="0.25"
											bind:value={optionDimensions[singleSelections[sub.id]].width}
											class="w-20 rounded border border-green-300 px-2 py-1 text-xs"
											placeholder="Width"
										/>
										<span class="text-xs text-green-600">inches</span>
									</div>
								{/if}

								<!-- Height input -->
								{#if selectedOption.include_height}
									<div class="flex items-center gap-2">
										<label
											for="height-single-{singleSelections[sub.id]}"
											class="text-xs text-green-700">Height:</label
										>
										<input
											id="height-single-{singleSelections[sub.id]}"
											type="number"
											min="0"
											step="0.25"
											bind:value={optionDimensions[singleSelections[sub.id]].height}
											class="w-20 rounded border border-green-300 px-2 py-1 text-xs"
											placeholder="Height"
										/>
										<span class="text-xs text-green-600">inches</span>
									</div>
								{/if}

								<!-- Location input -->
								{#if selectedOption.include_location}
									<div class="flex items-center gap-2">
										<label
											for="location-single-{singleSelections[sub.id]}"
											class="text-xs text-green-700">Location:</label
										>
										<input
											id="location-single-{singleSelections[sub.id]}"
											type="text"
											bind:value={optionDimensions[singleSelections[sub.id]].location}
											class="w-32 rounded border border-green-300 px-2 py-1 text-xs"
											placeholder="Location"
										/>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				{/if}
			</div>
		{/if}
	{/each}
</div>
