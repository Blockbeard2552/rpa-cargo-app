<!-- components/OrderSummary.svelte -->
<script lang="ts">
	import { calculateOptionPrice, formatPriceDisplay } from '../utils/price-calculator';

	// Add this to your existing props
	type Language = 'en' | 'es';

	let {
		model,
		selectedOptions,
		subtotal,
		finalTotal,
		depositAmount,
		salesTax,
		unitCost,
		quantities,
		optionDimensions,
		optionColors,
		customerName,
		customerEmail,
		customerPhone,
		shippingCost,
		language = 'en'
	}: {
		model: any;
		selectedOptions: any[];
		subtotal: number;
		finalTotal: number;
		depositAmount: number;
		salesTax: number;
		unitCost: number;
		quantities: Record<string, number>;
		optionDimensions: Record<string, any>;
		optionColors: Record<string, any>;
		customerName: string;
		customerEmail: string;
		customerPhone: string;
		shippingCost: number;
		language?: Language;
	} = $props();

	// Translations for OrderSummary
	const translations: Record<Language, Record<string, string>> = {
		en: {
			orderSummary: 'Order Summary',
			customerInformation: 'Customer Information',
			name: 'Name',
			email: 'Email',
			phone: 'Phone',
			model: 'Model',
			selectedOptions: 'Selected Options',
			quantity: 'Quantity',
			dimensions: 'Dimensions',
			color: 'Color',
			pricing: 'Pricing',
			unitCost: 'Unit Cost',
			subtotal: 'Subtotal',
			salesTax: 'Sales Tax',
			shipping: 'Shipping',
			total: 'Total',
			depositRequired: 'Deposit Required',
			balanceDue: 'Balance Due',
			option: 'Option',
			price: 'Price',
			each: 'each',
			specifications: 'Specifications',
			summary: 'Summary',
			perFoot: 'per foot',
			perAxle: 'per axle',
			optionsTotal: 'Options Total'
		},
		es: {
			orderSummary: 'Resumen del Pedido',
			customerInformation: 'Información del Cliente',
			name: 'Nombre',
			email: 'Correo Electrónico',
			phone: 'Teléfono',
			model: 'Modelo',
			selectedOptions: 'Opciones Seleccionadas',
			quantity: 'Cantidad',
			dimensions: 'Dimensiones',
			color: 'Color',
			pricing: 'Precios',
			unitCost: 'Costo Unitario',
			subtotal: 'Subtotal',
			salesTax: 'Impuesto de Ventas',
			shipping: 'Envío',
			total: 'Total',
			depositRequired: 'Depósito Requerido',
			balanceDue: 'Saldo Pendiente',
			option: 'Opción',
			price: 'Precio',
			each: 'cada uno',
			specifications: 'Especificaciones',
			summary: 'Resumen',
			perFoot: 'por pie',
			perAxle: 'por eje',
			optionsTotal: 'Total de Opciones'
		}
	};

	// Option name translations - map option names or IDs to Spanish
	const optionTranslations: Record<Language, Record<string, string>> = {
		en: {
			// English names stay the same
		},
		es: {
			// Map option names to Spanish
			'36" SD UPGRADED TO RV-TYPE 36" X 78" W/ WINDOW & FULL SCREEN DOOR':
				'Puerta lateral de 36" mejorada a tipo RV de 36" X 78" con ventana y mosquitera completa',
			PORCH: 'Porche',
			'SIDE DOOR': 'Puerta lateral',
			WINDOW: 'Ventana',
			ELECTRICAL: 'Eléctrico',
			INSULATION: 'Aislamiento',
			FLOORING: 'Piso',
			ROOF: 'Techo',
			WALLS: 'Paredes',
			AXLE: 'Eje',
			HITCH: 'Enganche',
			LIGHTS: 'Luces',
			VENTS: 'Ventilaciones',
			UPGRADES: 'Mejoras'
			// Add more translations as needed
		}
	};

	function t(key: string): string {
		return translations[language]?.[key] || key;
	}

	// Function to translate option names
	function translateOptionName(optionName: string): string {
		if (language === 'en') return optionName;
		return optionTranslations[language]?.[optionName] || optionName;
	}

	// Format currency based on language
	function formatCurrency(amount: number): string {
		if (language === 'es') {
			return new Intl.NumberFormat('es-ES', {
				style: 'currency',
				currency: 'USD' // You might want to make this configurable
			}).format(amount);
		} else {
			return new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD'
			}).format(amount);
		}
	}

	// Use the price calculator functions
	function getOptionPrice(option: any): number {
		return calculateOptionPrice(option, model, quantities);
	}

	function getOptionPriceDisplay(option: any): string {
		return formatPriceDisplay(option, model, quantities, formatCurrency, {
			each: t('each'),
			perFoot: t('perFoot'),
			perAxle: t('perAxle')
		});
	}

	// Calculate total cost of all selected options
	let optionsTotal = $derived(() => {
		if (!selectedOptions || selectedOptions.length === 0) return 0;
		return selectedOptions.reduce((total, option) => {
			return total + getOptionPrice(option);
		}, 0);
	});
</script>

<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
	<!-- Logo -->
	<div class="mb-4 flex justify-center">
		<img
			src="https://res.cloudinary.com/dz6c3v3tr/image/upload/v1735773584/navLogo_119x48_mbb5db.png"
			alt="Company Logo"
			class="h-12 w-auto"
		/>
	</div>

	<h2 class="mb-6 text-xl font-semibold text-gray-900">{t('orderSummary')}</h2>

	<!-- Customer Information -->
	<div class="mb-6">
		<h3 class="mb-3 text-lg font-medium text-gray-800">{t('customerInformation')}</h3>
		<div class="grid grid-cols-1 gap-2 text-sm">
			<div><span class="font-medium">{t('name')}:</span> {customerName}</div>
			<div><span class="font-medium">{t('email')}:</span> {customerEmail}</div>
			{#if customerPhone}
				<div><span class="font-medium">{t('phone')}:</span> {customerPhone}</div>
			{/if}
		</div>
	</div>

	<!-- Model Information -->
	<div class="mb-6">
		<h3 class="mb-3 text-lg font-medium text-gray-800">{t('model')}</h3>
		<div class="text-sm">
			<div class="font-medium">
				{#if model?.width && model?.length && model?.axle}
					{model.width}x{model.length} {model.axle}
				{:else}
					Custom Model
				{/if}
			</div>
			{#if model?.starting_price}
				<div class="text-gray-600">Starting Price: {formatCurrency(model.starting_price)}</div>
			{/if}
		</div>
	</div>

	<!-- Selected Options -->
	{#if selectedOptions && selectedOptions.length > 0}
		<div class="mb-6">
			<h3 class="mb-3 text-lg font-medium text-gray-800">{t('selectedOptions')}</h3>
			<div class="space-y-2">
				{#each selectedOptions as option}
					<div class="flex items-start justify-between text-sm">
						<div class="flex-1">
							<div class="font-medium">{translateOptionName(option.name)}</div>
							{#if quantities[option.id]}
								<div class="text-gray-600">{t('quantity')}: {quantities[option.id]}</div>
							{/if}
							{#if optionDimensions[option.id]}
								<div class="text-gray-600">{t('dimensions')}: {optionDimensions[option.id]}</div>
							{/if}
							{#if optionColors[option.id]}
								<div class="text-gray-600">{t('color')}: {optionColors[option.id]}</div>
							{/if}
							{#if option.note}
								<div class="text-gray-600 italic">{option.note}</div>
							{/if}
						</div>
						<div class="text-right font-medium">{getOptionPriceDisplay(option)}</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Pricing Summary -->
	<div class="border-t border-gray-200 pt-4">
		<h3 class="mb-3 text-lg font-medium text-gray-800">{t('pricing')}</h3>
		<div class="space-y-2 text-sm">
			<div class="flex justify-between">
				<span>{t('unitCost')}</span>
				<span>{formatCurrency(unitCost)}</span>
			</div>
			{#if optionsTotal() > 0}
				<div class="flex justify-between">
					<span>{t('optionsTotal')}</span>
					<span>{formatCurrency(optionsTotal())}</span>
				</div>
			{/if}
			<div class="flex justify-between">
				<span>{t('subtotal')}</span>
				<span>{formatCurrency(subtotal)}</span>
			</div>
			{#if salesTax > 0}
				<div class="flex justify-between">
					<span>{t('salesTax')}</span>
					<span>{formatCurrency(salesTax)}</span>
				</div>
			{/if}
			{#if shippingCost > 0}
				<div class="flex justify-between">
					<span>{t('shipping')}</span>
					<span>{formatCurrency(shippingCost)}</span>
				</div>
			{/if}
			<div class="flex justify-between border-t border-gray-200 pt-2 font-semibold">
				<span>{t('total')}</span>
				<span>{formatCurrency(finalTotal)}</span>
			</div>
			{#if depositAmount > 0}
				<div class="flex justify-between text-blue-600">
					<span>{t('depositRequired')}</span>
					<span>{formatCurrency(depositAmount)}</span>
				</div>
				<div class="flex justify-between text-gray-600">
					<span>{t('balanceDue')}</span>
					<span>{formatCurrency(finalTotal - depositAmount)}</span>
				</div>
			{/if}
		</div>
	</div>
</div>
