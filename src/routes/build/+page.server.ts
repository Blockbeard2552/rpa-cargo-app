import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Category } from '$lib/types/configurator.types'


export const load = async () => {
  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

  const { data: models, error: modelError } = await supabase
    .from('models')
    .select('*');

  const { data: categories, error: categoryError } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      note,
      subcategories (
        id,
        name,
        multiple,
        category_id,
        options (
          id,
          name,
          cost,
          note,
          cost_mod,
          color_options,
          for_lengths,
          for_widths,
          for_axle_value,
          for_axle_load,
          for_mainframe,
          subcategory_id,
          include_height,
          include_location,
          include_width
        )
      )
    `);

  if (modelError || categoryError || !models || !categories) {
    console.error('Error fetching data:', modelError || categoryError);
    return {
      models: models || [],
      categories: categories || []
    };
  }

  // 👇 Explicitly cast categories to match your derived store type
  return {
    models,
    categories: categories as Category[]
  };
};
