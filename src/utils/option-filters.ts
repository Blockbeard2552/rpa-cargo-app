import type { FormattedOption } from '$lib/types/configurator.types';
import type { Tables } from '../lib/types/database.types';

export function filterOptionsForModel(
	options: Tables<'options'>[],
	model: Tables<'models'> | undefined
): Tables<'options'>[] {
	if (!model) return options;

	return options.filter((opt) => {
		const widthMatch = opt.for_widths === null || opt.for_widths.includes(model.width);
		const lengthMatch = opt.for_lengths === null || opt.for_lengths.includes(model.length);
		const axleMatch = opt.for_axle_value === null || opt.for_axle_value === model.axle_value;
		
		return widthMatch && lengthMatch && axleMatch;
	});
}

export function formatOptions(options: Tables<'options'>[]): FormattedOption[] {
	return options.map((opt) => ({
		value: String(opt.id),
		label: `${opt.name} (${opt.cost})`
	}));
}