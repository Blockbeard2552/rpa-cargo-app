<script lang="ts">
	import { Select } from 'bits-ui';
	import TruckTrailer from 'phosphor-svelte/lib/TruckTrailer';
	import CaretUpDown from 'phosphor-svelte/lib/CaretUpDown';
	import CaretDoubleUp from 'phosphor-svelte/lib/CaretDoubleUp';
	import type { FormattedOption } from '../lib/types/configurator.types';

	let {
		modelId = $bindable(),
		formattedModels
	}: {
		modelId: string;
		formattedModels: () => FormattedOption[];
	} = $props();

	// Calculate the selected model label
	let selectedModelLabel = $derived(() => {
		return modelId
			? formattedModels().find((m: FormattedOption) => m.value === modelId)?.label
			: 'Select a model';
	});
</script>

<Select.Root type="single" bind:value={modelId} items={formattedModels()}>
	<Select.Trigger
		class="h-input rounded-9px border-border-input bg-background data-placeholder:text-foreground-alt/50 inline-flex w-[296px] items-center border px-[11px] text-sm transition-colors select-none"
		aria-label="Select a model"
	>
		<TruckTrailer class="text-muted-foreground mr-[9px] size-6" />
		{selectedModelLabel()}
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
				{#each formattedModels() as model}
					<Select.Item value={model.value} label={model.label}>
						{model.label}
					</Select.Item>
				{/each}
			</Select.Viewport>
		</Select.Content>
	</Select.Portal>
</Select.Root>
