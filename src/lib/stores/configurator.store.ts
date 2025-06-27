import { writable, derived } from 'svelte/store';
import type { Tables } from '../types/database.types';
import type { SelectionState, Category } from '../types/configurator.types';

export const modelId = writable<string>('');
export const singleSelections = writable<Record<string, string>>({});
export const multipleSelections = writable<Record<string, string[]>>({});

export function createConfiguratorStore(models: Tables<'models'>[], categories: Category[]) {
	const selectedModel = derived(modelId, ($modelId) => 
		models.find((m: Tables<'models'>) => m.id === $modelId)
	);

	const formattedModels = $derived(() => 
		models.map((m: Tables<'models'>) => ({
			value: m.id,
			label: `${m.width}x${m.length} ${m.axle} $${m.starting_price}`
		}))
	);

	return {
		modelId,
		selectedModel,
		formattedModels,
		singleSelections,
		multipleSelections
	};
}