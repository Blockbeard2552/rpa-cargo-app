<!-- src/components/OrderSummary.svelte -->

<script lang="ts">
	import type { Tables } from '../lib/types/database.types';

	let {
		model,
		selectedOptions,
		totalPrice,
		unitCost,
		quantities,
		optionDimensions,
		optionColors,
		customerName,
		customerEmail,
		customerPhone
	}: {
		model: Tables<'models'> | undefined;
		selectedOptions: Array<{
			id: string;
			name: string;
			cost: number;
			cost_mod: string;
			note: string;
			category: string;
			subcategory: string;
		}>;
		totalPrice: number;
		unitCost: number;
		quantities: Record<string, number>;
		optionDimensions: Record<string, { width?: number; height?: number; location?: string }>;
		optionColors: Record<string, string>;
		customerName: string;
		customerEmail: string;
		customerPhone: string;
	} = $props();

	// Get current date
	const currentDate = new Date().toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});

	// Helper function to get effective cost for an option
	function getEffectiveCost(option: any): number {
		const quantity = quantities[option.id] || 1;
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

	// Helper function to format option display with quantity/PLF/Per Axle calculation
	function formatOptionWithQuantity(option: any): string {
		const quantity = quantities[option.id] || 1;
		const baseCost = Number(option.cost);

		if (option.cost_mod === 'Each' || option.cost_mod === 'Per Foot') {
			if (quantity > 1) {
				return `${option.name} (${quantity}x)`;
			}
		} else if (option.cost_mod === 'PLF' && model) {
			return `${option.name} (${model.length}' × $${baseCost} PLF)`;
		} else if (option.cost_mod === 'Per Axle' && model) {
			return `${option.name} (${model.axle_value} axles × $${baseCost} per axle)`;
		}
		return option.name;
	}

	// Helper function to format dimensions, color, and other details
	function formatOptionDetails(optionId: string): string {
		const dimensions = optionDimensions[optionId];
		const color = optionColors[optionId];

		const parts = [];

		if (dimensions?.width) {
			parts.push(`${dimensions.width}" W`);
		}

		if (dimensions?.height) {
			parts.push(`${dimensions.height}" H`);
		}

		if (dimensions?.location) {
			parts.push(`Location: ${dimensions.location}`);
		}

		if (color) {
			parts.push(`Color: ${color}`);
		}

		return parts.length > 0 ? parts.join(' × ') : '';
	}

	// Check if option has any custom details (dimensions or color)
	function hasCustomDetails(optionId: string): boolean {
		const dimensions = optionDimensions[optionId];
		const color = optionColors[optionId];

		return !!(dimensions?.width || dimensions?.height || dimensions?.location || color);
	}

	// Group options by category, then by subcategory
	let groupedOptions = $derived(() => {
		const groups: Record<string, Record<string, Array<any>>> = {};
		selectedOptions.forEach((option) => {
			if (!groups[option.category]) {
				groups[option.category] = {};
			}
			if (!groups[option.category][option.subcategory]) {
				groups[option.category][option.subcategory] = [];
			}
			groups[option.category][option.subcategory].push(option);
		});
		return groups;
	});

	// Standard features list - these should come from your model data
	let standardFeatures = $derived(() => {
		if (!model) return [];
		return [
			model.standard_axle,
			model.standard_axle_load,
			model.hitch,
			model.standard_tires,
			model.standard_exterior_walls,
			model.standard_mainframe,
			model.standard_jack
		].filter(Boolean); // Remove any null/undefined values
	});

	// Split standard features into two columns
	let leftFeatures = $derived(() =>
		standardFeatures().slice(0, Math.ceil(standardFeatures().length / 2))
	);
	let rightFeatures = $derived(() =>
		standardFeatures().slice(Math.ceil(standardFeatures().length / 2))
	);
</script>

{#if model}
	<div
		class="mx-auto max-w-2xl rounded-lg border border-gray-300 bg-white p-6 print:border-gray-400 print:shadow-none"
	>
		<!-- Header -->
		<div class="mb-6">
			<h1 class="mb-2 text-2xl font-bold text-gray-900">Order Summary</h1>
			<p class="text-gray-600">Date: {currentDate}</p>
			{#if customerName}
				<p class="text-gray-600">Customer Name: {customerName}</p>
			{/if}
			{#if customerEmail}
				<p class="text-gray-600">Email: {customerEmail}</p>
			{/if}
			{#if customerPhone}
				<p class="text-gray-600">Phone: {customerPhone}</p>
			{/if}
		</div>

		<!-- Selected Model -->
		<div class="mb-6">
			<div class="mb-2 flex items-center justify-between">
				<h2 class="text-lg font-bold text-gray-900">Selected Model</h2>
			</div>
			<div class="flex items-center justify-between">
				<span class="text-lg">{model.width} X {model.length} {model.axle}</span>
				<span class="text-lg font-semibold">${unitCost.toLocaleString()}.00</span>
			</div>
		</div>

		<!-- Standard Features -->
		{#if standardFeatures().length > 0}
			<div class="mb-6">
				<h2 class="mb-2 text-lg font-bold text-gray-900">Standard Features</h2>
				<div class="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
					<!-- Left Column -->
					<div class="space-y-.5">
						{#each leftFeatures() as feature}
							<div class="flex items-start">
								<span class="mr-2 text-sm text-gray-900">•</span>
								<span class="text-sm text-gray-900">{feature}</span>
							</div>
						{/each}
					</div>
					<!-- Right Column -->
					<div class="space-y-.5">
						{#each rightFeatures() as feature}
							<div class="flex items-start">
								<span class="mr-2 text-sm text-gray-900">•</span>
								<span class="text-sm text-gray-900">{feature}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<!-- Selected Options by Category and Subcategory -->
		{#each Object.entries(groupedOptions()) as [categoryName, subcategories]}
			<div class="mb-6">
				<h2 class="mb-2 text-lg font-bold text-gray-900">{categoryName}</h2>
				<div class="space-y-4">
					{#each Object.entries(subcategories) as [subcategoryName, options]}
						<div class="space-y-2">
							<!-- Show subcategory name only once -->
							<div class="text-md font-semibold text-gray-900">
								{subcategoryName}
							</div>

							<!-- Options within this subcategory -->
							<div class="ml-4 space-y-2">
								{#each options as option}
									<div class="flex items-start justify-between">
										<div class="flex-1">
											<span class="text-md text-500 font-medium"
												>{formatOptionWithQuantity(option)}</span
											>

											<!-- Show custom details (dimensions, color, etc.) -->
											{#if hasCustomDetails(option.id)}
												<div class="mt-1 ml-2 text-sm font-medium text-gray-700">
													{formatOptionDetails(option.id)}
												</div>
											{/if}

											<!-- Show calculation details for PLF items -->
											{#if option.cost_mod === 'PLF' && model}
												<div class="mt-1 ml-2 text-sm text-gray-500">
													{model.length} feet × ${Number(option.cost).toLocaleString()} per linear foot
												</div>
											{/if}

											<!-- Show calculation details for Per Axle items -->
											{#if option.cost_mod === 'Per Axle' && model}
												<div class="mt-1 ml-2 text-sm text-gray-500">
													{model.axle_value} axles × ${Number(option.cost).toLocaleString()} per axle
												</div>
											{/if}

											<!-- Show calculation details for quantity items -->
											{#if (option.cost_mod === 'Each' || option.cost_mod === 'Per Foot') && (quantities[option.id] || 1) > 1}
												<div class="mt-1 ml-2 text-sm text-gray-500">
													{quantities[option.id]} × ${Number(option.cost).toLocaleString()}
													{option.cost_mod.toLowerCase()}
												</div>
											{/if}

											<!-- Show option notes -->
											{#if option.note}
												<div class="mt-1 ml-2 text-sm text-gray-500 italic">
													{option.note}
												</div>
											{/if}
										</div>
										<span class="ml-4 text-lg font-semibold"
											>${getEffectiveCost(option).toLocaleString()}.00</span
										>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}

		<!-- Total Cost -->
		<div class="mt-6 border-t border-gray-300 pt-4">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-bold text-gray-900">Total Cost</h2>
				<span class="text-3xl font-bold text-gray-900">${totalPrice.toLocaleString()}.00</span>
			</div>
		</div>
	</div>
{/if}
