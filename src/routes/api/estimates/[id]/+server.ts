import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params }) => {
  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
  
  const estimateId = parseInt(params.id || '');
  
  if (isNaN(estimateId)) {
    return json({ error: 'Invalid estimate ID' }, { status: 400 });
  }

  const { error } = await supabase
    .from('estimates')
    .delete()
    .eq('id', estimateId);

  if (error) {
    console.error('Error deleting estimate:', error);
    return json({ error: 'Failed to delete estimate' }, { status: 500 });
  }

  return json({ success: true });
};