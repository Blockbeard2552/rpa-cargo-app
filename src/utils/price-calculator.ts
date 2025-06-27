import type { Category } from '$lib/types/configurator.types';
import type { Tables } from '../lib/types/database.types';

export function calculateTotalPrice(
	model: Tables<'models'> | undefined,
	singleSelections: Record<string, string>,
	multipleSelections: Record<string, string[]>,
	categories: Category[]
): number {
	if (!model) return 0;

	let total = Number(model.starting_price) || 0;

	// Add costs from single selections
	Object.values(singleSelections).forEach((selectedId) => {
		if (selectedId) {
			const option = findOptionById(selectedId, categories);
			if (option) {
				total += Number(option.cost) || 0;
			}
		}
	});

	// Add costs from multiple selections
	Object.values(multipleSelections).forEach((selectedIds) => {
		if (selectedIds?.length > 0) {
			selectedIds.forEach((selectedId) => {
				const option = findOptionById(selectedId, categories);
				if (option) {
					total += Number(option.cost) || 0;
				}
			});
		}
	});

	return total;
}

function findOptionById(id: string, categories: Category[]): Tables<'options'> | undefined {
	for (const cat of categories) {
		for (const sub of cat.subcategories) {
			const option = sub.options.find(
				(opt: Tables<'options'>) => String(opt.id) === id
			);
			if (option) return option;
		}
	}
	return undefined;
}