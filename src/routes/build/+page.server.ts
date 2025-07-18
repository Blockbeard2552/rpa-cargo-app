import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Category } from '$lib/types/configurator.types'


export const load = async ({ url }) => {
  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

  // Check if we're loading from an estimate
  const estimateNumber = url.searchParams.get('estimate');
  let estimateData = null;

  if (estimateNumber) {
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .select('*')
      .eq('estimate_number', estimateNumber)
      .single();

    if (!estimateError && estimate) {
      estimateData = estimate;
    }
  }

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
      categories: categories || [],
      estimateData: null
    };
  }

  return {
    models,
    categories: categories as Category[],
    estimateData
  };
};