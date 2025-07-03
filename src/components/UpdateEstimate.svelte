<!-- src/components/UpdateEstimate.svelte -->

<script lang="ts">
	import { Button } from 'bits-ui';
	import { createClient } from '@supabase/supabase-js';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import { goto } from '$app/navigation';
	import type { Tables } from '../lib/types/database.types';

	let {
		estimate,
		model,
		selectedOptions,
		singleSelections,
		multipleSelections,
		quantities,
		optionDimensions,
		optionColors,
		subtotal,
		finalTotal,
		depositAmount,
		salesTax,
		shippingCost,
		dealerMarkup,
		customerName,
		customerEmail,
		customerPhone
	}: {
		estimate: any;
		model: Tables<'models'> | undefined;
		selectedOptions: any[];
		singleSelections: Record<string, string>;
		multipleSelections: Record<string, string[]>;
		quantities: Record<string, number>;
		optionDimensions: Record<string, { width?: number; height?: number; location?: string }>;
		optionColors: Record<string, string>;
		subtotal: number;
		finalTotal: number;
		depositAmount: number;
		salesTax: number;
		shippingCost: number;
		dealerMarkup: number;
		customerName: string;
		customerEmail: string;
		customerPhone: string;
	} = $props();

	let isUpdating = $state(false);
	let updateMessage = $state('');

	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	// Calculate expiration date (30 days from now, in case user wants to extend)
	function getNewExpirationDate(): string {
		const date = new Date();
		date.setDate(date.getDate() + 30);
		return date.toISOString();
	}

	async function updateEstimate() {
		if (!model) {
			updateMessage = 'Please select a model before updating estimate';
			return;
		}

		if (!customerName.trim() || !customerEmail.trim()) {
			updateMessage = 'Please enter customer name and email before updating estimate';
			return;
		}

		isUpdating = true;
		updateMessage = '';

		try {
			// Prepare the updated data
			const updateData = {
				customer_name: customerName.trim(),
				customer_email: customerEmail.trim(),
				customer_phone: customerPhone.trim() || null,
				model_id: model.id,
				model_data: {
					id: model.id,
					width: model.width,
					length: model.length,
					axle: model.axle,
					axle_value: model.axle_value,
					starting_price: model.starting_price,
					mfg_base_cost: model.mfg_base_cost,
					mfg_surcharge: model.mfg_surcharge
				},
				selected_options: {
					single_selections: singleSelections,
					multiple_selections: multipleSelections,
					quantities: quantities,
					option_dimensions: optionDimensions,
					option_colors: optionColors,
					options_list: selectedOptions
				},
				pricing_data: {
					dealer_markup: dealerMarkup,
					unit_cost: subtotal - (finalTotal - subtotal), // Calculate unit cost
					sales_tax_rate: salesTax > 0 ? 0.08 : 0
				},
				subtotal: subtotal,
				sales_tax: salesTax,
				shipping_cost: shippingCost,
				final_total: finalTotal,
				deposit_amount: depositAmount,
				// Optionally extend expiration date
				expires_at: getNewExpirationDate()
			};

			const { data, error } = await supabase
				.from('estimates')
				.update(updateData)
				.eq('id', estimate.id)
				.select()
				.single();

			if (error) {
				console.error('Error updating estimate:', error);
				updateMessage = 'Error updating estimate. Please try again.';
			} else {
				updateMessage = `Estimate updated successfully!`;

				// Redirect to the estimate view page after a short delay
				setTimeout(() => {
					goto(`/estimate/${estimate.estimate_number}`);
				}, 1500);
			}
		} catch (error) {
			console.error('Error updating estimate:', error);
			updateMessage = 'Error updating estimate. Please try again.';
		} finally {
			isUpdating = false;
		}
	}

	// Clear message after 10 seconds
	$effect(() => {
		if (updateMessage && !updateMessage.includes('successfully')) {
			const timer = setTimeout(() => {
				updateMessage = '';
			}, 10000);
			return () => clearTimeout(timer);
		}
	});

	// Check if estimate has been modified
	let hasChanges = $derived(() => {
		// Simple comparison - in production you might want more sophisticated change detection
		const originalData = estimate.selected_options || {};

		return (
			JSON.stringify(singleSelections) !== JSON.stringify(originalData.single_selections || {}) ||
			JSON.stringify(multipleSelections) !==
				JSON.stringify(originalData.multiple_selections || {}) ||
			JSON.stringify(quantities) !== JSON.stringify(originalData.quantities || {}) ||
			JSON.stringify(optionDimensions) !== JSON.stringify(originalData.option_dimensions || {}) ||
			JSON.stringify(optionColors) !== JSON.stringify(originalData.option_colors || {}) ||
			customerName !== (estimate.customer_name || '') ||
			customerEmail !== (estimate.customer_email || '') ||
			customerPhone !== (estimate.customer_phone || '') ||
			dealerMarkup !== (estimate.pricing_data?.dealer_markup || 0) ||
			shippingCost !== (estimate.shipping_cost || 0) ||
			salesTax > 0 !== estimate.sales_tax > 0 ||
			model?.id !== estimate.model_id
		);
	});
</script>

<div class="w-full max-w-[296px] space-y-3">
	<Button.Root
		class="rounded-input shadow-mini inline-flex h-12 w-full items-center justify-center bg-green-600 px-[21px] text-[15px] font-semibold text-white transition-colors hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-400"
		onclick={updateEstimate}
		disabled={isUpdating || !model || !hasChanges()}
	>
		{isUpdating ? 'Updating...' : 'Update Estimate'}
	</Button.Root>

	{#if !hasChanges() && model}
		<div class="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
			No changes detected. Make modifications to enable the update button.
		</div>
	{/if}

	{#if updateMessage}
		<div
			class="rounded border p-3 text-sm {updateMessage.includes('Error')
				? 'border-red-200 bg-red-50 text-red-700'
				: 'border-green-200 bg-green-50 text-green-700'}"
		>
			{updateMessage}
		</div>
	{/if}

	<div class="text-xs text-gray-500">
		Updating will extend the expiration date by 30 days from today.
	</div>
</div>
