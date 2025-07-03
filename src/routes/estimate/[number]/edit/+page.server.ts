import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

  // Get the estimate data
  const { data: estimate, error: estimateError } = await supabase
    .from('estimates')
    .select('*')
    .eq('estimate_number', params.number)
    .single();

  if (estimateError || !estimate) {
    throw error(404, 'Estimate not found');
  }

  // Check if estimate is expired
  const now = new Date();
  const expirationDate = new Date(estimate.expires_at);
  
  if (now > expirationDate) {
    throw error(410, 'Cannot edit expired estimate');
  }

  if (estimate.status === 'converted_to_order') {
    throw error(403, 'Cannot edit estimate that has been converted to an order');
  }

  // Get all models and categories for the configurator
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
    console.error('Error fetching configurator data:', modelError || categoryError);
    throw error(500, 'Failed to load configurator data');
  }

  return {
    estimate,
    models,
    categories,
    isEditing: true
  };
};