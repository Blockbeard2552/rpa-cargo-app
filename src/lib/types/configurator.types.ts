import type { Tables } from './database.types';

export type Option = Tables<'options'>;
export type Subcategory = Tables<'subcategories'> & { options: Option[] };
export type Category = Tables<'categories'> & { subcategories: Subcategory[] };


export interface ConfiguratorData {
	models: Tables<'models'>[];
	categories: Category[];
}

export interface FormattedOption {
	value: string;
	label: string;
	note?: string;
	color_options?: string[];
}

export interface SelectionState {
	singleSelections: Record<string, string>;
	multipleSelections: Record<string, string[]>;
	quantites: Record<string, number>;
}

export interface SelectedOption {
	id: string;
	name: string;
	cost: number;
	cost_mod: string;
	quantity: number;
	color_options?: string[];
}