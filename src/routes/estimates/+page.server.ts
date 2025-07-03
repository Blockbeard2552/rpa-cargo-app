import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { PageServerLoad } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

  // Get query parameters for filtering
  const status = url.searchParams.get('status') || 'all';
  const search = url.searchParams.get('search') || '';
  const sortBy = url.searchParams.get('sort') || 'created_at';
  const sortOrder = url.searchParams.get('order') || 'desc';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 20; // Items per page
  const offset = (page - 1) * limit;

  // Build the query
  let query = supabase
    .from('estimates')
    .select('*', { count: 'exact' });

  // Apply status filter
  if (status !== 'all') {
    query = query.eq('status', status);
  }

  // Apply search filter
  if (search) {
    query = query.or(`estimate_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`);
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: estimates, error, count } = await query;

  if (error) {
    console.error('Error fetching estimates:', error);
    return {
      estimates: [],
      totalCount: 0,
      currentPage: page,
      totalPages: 1,
      filters: { status, search, sortBy, sortOrder }
    };
  }

  const totalPages = Math.ceil((count || 0) / limit);

  // Update expired estimates
  if (estimates) {
    const now = new Date();
    const expiredEstimates = estimates.filter(est => 
      new Date(est.expires_at) < now && est.status === 'active'
    );

    if (expiredEstimates.length > 0) {
      // Update expired estimates in background
      const expiredIds = expiredEstimates.map(est => est.id);
      supabase
        .from('estimates')
        .update({ status: 'expired' })
        .in('id', expiredIds)
        .then(() => {
          // Update local data
          expiredEstimates.forEach(est => est.status = 'expired');
        });
    }
  }

  return {
    estimates: estimates || [],
    totalCount: count || 0,
    currentPage: page,
    totalPages,
    filters: { status, search, sortBy, sortOrder }
  };
};