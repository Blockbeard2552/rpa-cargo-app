<!-- src/components/SaveEstimate.svelte -->

<script lang="ts">
	import { Button } from 'bits-ui';
	import { createClient } from '@supabase/supabase-js';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import type { Tables } from '../lib/types/database.types';

	let {
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

	let isSaving = $state(false);
	let saveMessage = $state('');
	let savedEstimateNumber = $state('');

	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	// Generate estimate number (EST-YYYYMMDD-XXXX format)
	function generateEstimateNumber(): string {
		const date = new Date();
		const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
		const random = Math.floor(Math.random() * 9999)
			.toString()
			.padStart(4, '0');
		return `EST-${dateStr}-${random}`;
	}

	// Calculate expiration date (30 days from now)
	function getExpirationDate(): string {
		const date = new Date();
		date.setDate(date.getDate() + 30);
		return date.toISOString();
	}

	async function saveEstimate() {
		if (!model) {
			saveMessage = 'Please select a model before saving estimate';
			return;
		}

		if (!customerName.trim() || !customerEmail.trim()) {
			saveMessage = 'Please enter customer name and email before saving estimate';
			return;
		}

		isSaving = true;
		saveMessage = '';

		try {
			const estimateNumber = generateEstimateNumber();
			const expiresAt = getExpirationDate();

			// Prepare the data to save
			const estimateData = {
				estimate_number: estimateNumber,
				expires_at: expiresAt,
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
				status: 'active'
			};

			const { data, error } = await supabase
				.from('estimates')
				.insert(estimateData)
				.select()
				.single();

			if (error) {
				console.error('Error saving estimate:', error);
				saveMessage = 'Error saving estimate. Please try again.';
			} else {
				savedEstimateNumber = estimateNumber;
				saveMessage = `Estimate saved successfully! Estimate #${estimateNumber}`;

				// Optional: Copy estimate link to clipboard
				const estimateUrl = `${window.location.origin}/estimate/${estimateNumber}`;
				try {
					await navigator.clipboard.writeText(estimateUrl);
					saveMessage += ' (Link copied to clipboard)';
				} catch (e) {
					// Clipboard API might not be available
				}
			}
		} catch (error) {
			console.error('Error saving estimate:', error);
			saveMessage = 'Error saving estimate. Please try again.';
		} finally {
			isSaving = false;
		}
	}

	// Clear message after 10 seconds
	$effect(() => {
		if (saveMessage) {
			const timer = setTimeout(() => {
				saveMessage = '';
			}, 10000);
			return () => clearTimeout(timer);
		}
	});
</script>

<div class="w-full max-w-[296px] space-y-3">
	<Button.Root
		class="rounded-input shadow-mini inline-flex h-12 w-full items-center justify-center bg-blue-600 px-[21px] text-[15px] font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-400"
		onclick={saveEstimate}
		disabled={isSaving || !model}
	>
		{isSaving ? 'Saving...' : 'Save as Estimate'}
	</Button.Root>

	{#if saveMessage}
		<div
			class="rounded border p-3 text-sm {saveMessage.includes('Error')
				? 'border-red-200 bg-red-50 text-red-700'
				: 'border-green-200 bg-green-50 text-green-700'}"
		>
			{saveMessage}
		</div>
	{/if}

	{#if savedEstimateNumber}
		<div class="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
			<div class="font-semibold">Estimate Details:</div>
			<div>Number: {savedEstimateNumber}</div>
			<div>Expires: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
			<div class="mt-2">
				<a
					href="/estimate/{savedEstimateNumber}"
					class="text-blue-600 underline hover:text-blue-800"
					target="_blank"
				>
					View Estimate
				</a>
			</div>
		</div>
	{/if}

	<div class="text-xs text-gray-500">
		Estimates expire after 30 days and will be automatically deleted.
	</div>
</div>
