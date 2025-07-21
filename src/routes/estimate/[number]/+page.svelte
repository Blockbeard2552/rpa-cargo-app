<!-- src/routes/estimate/[number]/+page.svelte -->

<script lang="ts">
	import OrderSummary from '../../../components/OrderSummary.svelte';
	import { Button } from 'bits-ui';

	const { data }: { data: any } = $props();

	let estimate = data.estimate;
	type Language = 'en' | 'es';
	let currentLanguage: Language = $state('en');

	// Translation object
	const translations: Record<Language, Record<string, string>> = {
		en: {
			estimateNotFound: 'Estimate Not Found',
			estimateNotFoundDesc: 'This estimate may have expired or the link is invalid.',
			estimateExpired: 'Estimate Expired',
			estimateExpiredDesc: 'expired on',
			createNewEstimate: 'Create New Estimate',
			estimate: 'Estimate',
			created: 'Created',
			expiresIn: 'Expires in',
			days: 'days',
			expiringSoon: 'Expiring Soon',
			active: 'Active',
			printEstimate: 'Print Estimate',
			editEstimate: 'Edit Estimate',
			convertToOrder: 'Convert to Order',
			importantNotes: 'Important Notes:',
			validUntil: 'This estimate is valid until',
			pricesSubject: 'Prices are subject to change based on material costs and availability',
			depositRequired: 'deposit is required to begin production',
			leadTimes: 'Lead times will be confirmed upon order placement',
			language: 'Language',
			english: 'English',
			spanish: 'Español'
		},
		es: {
			estimateNotFound: 'Estimación No Encontrada',
			estimateNotFoundDesc: 'Esta estimación puede haber expirado o el enlace no es válido.',
			estimateExpired: 'Estimación Expirada',
			estimateExpiredDesc: 'expiró el',
			createNewEstimate: 'Crear Nueva Estimación',
			estimate: 'Estimación',
			created: 'Creado',
			expiresIn: 'Expira en',
			days: 'días',
			expiringSoon: 'Expira Pronto',
			active: 'Activo',
			printEstimate: 'Imprimir Estimación',
			editEstimate: 'Editar Estimación',
			convertToOrder: 'Convertir a Pedido',
			importantNotes: 'Notas Importantes:',
			validUntil: 'Esta estimación es válida hasta',
			pricesSubject:
				'Los precios están sujetos a cambios según los costos de materiales y disponibilidad',
			depositRequired: 'se requiere depósito para comenzar la producción',
			leadTimes: 'Los tiempos de entrega se confirmarán al realizar el pedido',
			language: 'Idioma',
			english: 'English',
			spanish: 'Español'
		}
	};

	// Helper function to get translation
	function t(key: string): string {
		return translations[currentLanguage]?.[key] || key;
	}

	// Toggle language function
	function toggleLanguage() {
		currentLanguage = currentLanguage === 'en' ? 'es' : 'en';
	}

	let isExpired = $derived(() => {
		if (!estimate) return true;
		return new Date(estimate.expires_at) < new Date();
	});

	let daysUntilExpiration = $derived(() => {
		if (!estimate) return 0;
		const now = new Date();
		const expirationDate = new Date(estimate.expires_at);
		const diffTime = expirationDate.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return Math.max(0, diffDays);
	});

	function printEstimate() {
		window.print();
	}

	function convertToOrder() {
		// Redirect to configurator with pre-filled data
		const params = new URLSearchParams({
			estimate: estimate.estimate_number
		});
		window.location.href = `/build?${params.toString()}`;
	}
</script>

<svelte:head>
	<title>{t('estimate')} {estimate?.estimate_number || t('estimateNotFound')}</title>
</svelte:head>

<div class="mx-auto max-w-4xl p-4">
	<!-- Language Toggle Button -->
	<div class="mb-4 flex justify-end print:hidden">
		<Button.Root
			class="rounded-input shadow-mini inline-flex h-8 items-center justify-center bg-gray-100 px-3 text-sm font-medium text-gray-700 hover:bg-gray-200"
			onclick={toggleLanguage}
		>
			🌐 {currentLanguage === 'en' ? t('spanish') : t('english')}
		</Button.Root>
	</div>

	{#if !estimate}
		<div class="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
			<h1 class="mb-2 text-2xl font-bold text-red-800">{t('estimateNotFound')}</h1>
			<p class="text-red-600">{t('estimateNotFoundDesc')}</p>
			<Button.Root
				class="rounded-input shadow-mini mt-4 inline-flex h-12 items-center justify-center bg-blue-600 px-[21px] text-[15px] font-semibold text-white hover:bg-blue-700"
				href="/build"
			>
				{t('createNewEstimate')}
			</Button.Root>
		</div>
	{:else if isExpired()}
		<div class="rounded-lg border border-orange-200 bg-orange-50 p-6 text-center">
			<h1 class="mb-2 text-2xl font-bold text-orange-800">{t('estimateExpired')}</h1>
			<p class="mb-4 text-orange-600">
				{t('estimate')}
				{estimate.estimate_number}
				{t('estimateExpiredDesc')}
				{new Date(estimate.expires_at).toLocaleDateString(
					currentLanguage === 'es' ? 'es-ES' : 'en-US'
				)}.
			</p>
			<Button.Root
				class="rounded-input shadow-mini inline-flex h-12 items-center justify-center bg-blue-600 px-[21px] text-[15px] font-semibold text-white hover:bg-blue-700"
				href="/build"
			>
				{t('createNewEstimate')}
			</Button.Root>
		</div>
	{:else}
		<!-- Header with estimate info and actions -->
		<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">{t('estimate')} {estimate.estimate_number}</h1>
				<div class="mt-2 space-y-1 text-sm text-gray-600">
					<div>
						{t('created')}: {new Date(estimate.created_at).toLocaleDateString(
							currentLanguage === 'es' ? 'es-ES' : 'en-US'
						)}
					</div>
					<div class="flex items-center gap-2">
						<span>{t('expiresIn')} {daysUntilExpiration()} {t('days')}</span>
						<span
							class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {daysUntilExpiration() <=
							7
								? 'bg-red-100 text-red-700'
								: 'bg-green-100 text-green-700'}"
						>
							{daysUntilExpiration() <= 7 ? t('expiringSoon') : t('active')}
						</span>
					</div>
				</div>
			</div>

			<div class="flex gap-3 print:hidden">
				<Button.Root
					class="rounded-input shadow-mini inline-flex h-10 items-center justify-center bg-gray-600 px-4 text-sm font-semibold text-white hover:bg-gray-700"
					onclick={printEstimate}
				>
					{t('printEstimate')}
				</Button.Root>
				<Button.Root
					class="rounded-input shadow-mini inline-flex h-10 items-center justify-center bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
					href="/estimate/{estimate.estimate_number}/edit"
				>
					{t('editEstimate')}
				</Button.Root>
				<Button.Root
					class="rounded-input shadow-mini inline-flex h-10 items-center justify-center bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700"
					onclick={convertToOrder}
				>
					{t('convertToOrder')}
				</Button.Root>
			</div>
		</div>

		<!-- Estimate content -->
		<div class="grid grid-cols-1 gap-8">
			<OrderSummary
				model={estimate.model_data}
				selectedOptions={estimate.selected_options.options_list || []}
				subtotal={estimate.subtotal}
				finalTotal={estimate.final_total}
				depositAmount={estimate.deposit_amount}
				salesTax={estimate.sales_tax}
				unitCost={estimate.pricing_data.unit_cost}
				quantities={estimate.selected_options.quantities || {}}
				optionDimensions={estimate.selected_options.option_dimensions || {}}
				optionColors={estimate.selected_options.option_colors || {}}
				customerName={estimate.customer_name}
				customerEmail={estimate.customer_email}
				customerPhone={estimate.customer_phone || ''}
				shippingCost={estimate.shipping_cost}
				language={currentLanguage}
			/>
		</div>

		<!-- Footer note -->
		<div
			class="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 print:hidden"
		>
			<div class="mb-2 font-semibold">{t('importantNotes')}</div>
			<ul class="list-inside list-disc space-y-1">
				<li>
					{t('validUntil')}
					{new Date(estimate.expires_at).toLocaleDateString(
						currentLanguage === 'es' ? 'es-ES' : 'en-US'
					)}
				</li>
				<li>{t('pricesSubject')}</li>
				<li>
					{((estimate.deposit_amount / estimate.final_total) * 100).toFixed(0)}% {t(
						'depositRequired'
					)}
				</li>
				<li>{t('leadTimes')}</li>
			</ul>
		</div>
	{/if}
</div>

<style>
	@media print {
		.print\:hidden {
			display: none !important;
		}
	}
</style>
