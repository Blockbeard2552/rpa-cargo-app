import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }: { params: { number: string } }) => {
  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

  const { data: estimate, error: estimateError } = await supabase
    .from('estimates')
    .select('*')
    .eq('estimate_number', params.number)
    .single();

  if (estimateError || !estimate) {
    return {
      estimate: null
    };
  }

  // Check if estimate is expired and mark it
  const now = new Date();
  const expirationDate = new Date(estimate.expires_at);
  
  if (now > expirationDate && estimate.status === 'active') {
    // Mark as expired in database
    await supabase
      .from('estimates')
      .update({ status: 'expired' })
      .eq('id', estimate.id);
    
    estimate.status = 'expired';
  }

  return {
    estimate
  };
};