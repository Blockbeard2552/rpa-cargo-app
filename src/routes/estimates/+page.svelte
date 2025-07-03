<!-- src/routes/estimates/+page.svelte -->

<script lang="ts">
	import { Button } from 'bits-ui';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import MagnifyingGlass from 'phosphor-svelte/lib/MagnifyingGlass';
	import Eye from 'phosphor-svelte/lib/Eye';
	import Printer from 'phosphor-svelte/lib/Printer';
	import Trash from 'phosphor-svelte/lib/Trash';
	import Plus from 'phosphor-svelte/lib/Plus';

	const { data } = $props<{ data: any }>();

	let searchInput = $state(data.filters.search);
	let statusFilter = $state(data.filters.status);

	// Handle search
	function handleSearch() {
		const params = new URLSearchParams($page.url.searchParams);
		if (searchInput.trim()) {
			params.set('search', searchInput.trim());
		} else {
			params.delete('search');
		}
		params.delete('page'); // Reset to page 1
		goto(`?${params.toString()}`);
	}

	// Handle status filter change
	function handleStatusFilter() {
		const params = new URLSearchParams($page.url.searchParams);
		if (statusFilter !== 'all') {
			params.set('status', statusFilter);
		} else {
			params.delete('status');
		}
		params.delete('page'); // Reset to page 1
		goto(`?${params.toString()}`);
	}

	// Handle sorting
	function handleSort(column: string) {
		const params = new URLSearchParams($page.url.searchParams);
		const currentSort = params.get('sort');
		const currentOrder = params.get('order');

		if (currentSort === column) {
			// Toggle order
			params.set('order', currentOrder === 'asc' ? 'desc' : 'asc');
		} else {
			// New column
			params.set('sort', column);
			params.set('order', 'desc');
		}

		goto(`?${params.toString()}`);
	}

	// Handle pagination
	function goToPage(pageNum: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', pageNum.toString());
		goto(`?${params.toString()}`);
	}

	// Calculate days until expiration
	function getDaysUntilExpiration(expiresAt: string): number {
		const now = new Date();
		const expDate = new Date(expiresAt);
		const diffTime = expDate.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return Math.max(0, diffDays);
	}

	// Check if estimate is expired
	function isExpired(expiresAt: string): boolean {
		return new Date(expiresAt) < new Date();
	}

	// Delete estimate
	async function deleteEstimate(estimateId: number) {
		if (!confirm('Are you sure you want to delete this estimate? This action cannot be undone.')) {
			return;
		}

		try {
			const response = await fetch(`/api/estimates/${estimateId}`, {
				method: 'DELETE'
			});

			const result = await response.json();

			if (result.success) {
				// Refresh the page to show updated list
				window.location.reload();
			} else {
				alert('Failed to delete estimate: ' + (result.error || 'Unknown error'));
			}
		} catch (error) {
			console.error('Error deleting estimate:', error);
			alert('Failed to delete estimate. Please try again.');
		}
	}

	// Get status badge classes
	function getStatusBadgeClass(status: string, expiresAt: string): string {
		if (status === 'expired' || isExpired(expiresAt)) {
			return 'bg-red-100 text-red-700';
		}
		if (status === 'converted_to_order') {
			return 'bg-green-100 text-green-700';
		}
		if (getDaysUntilExpiration(expiresAt) <= 7) {
			return 'bg-orange-100 text-orange-700';
		}
		return 'bg-blue-100 text-blue-700';
	}

	function getStatusText(status: string, expiresAt: string): string {
		if (status === 'expired' || isExpired(expiresAt)) {
			return 'Expired';
		}
		if (status === 'converted_to_order') {
			return 'Converted';
		}
		if (getDaysUntilExpiration(expiresAt) <= 7) {
			return 'Expiring Soon';
		}
		return 'Active';
	}
</script>

<svelte:head>
	<title>All Estimates</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-4">
	<!-- Header -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">All Estimates</h1>
			<p class="mt-1 text-gray-600">
				{data.totalCount} total estimates
			</p>
		</div>
		<Button.Root
			class="rounded-input shadow-mini inline-flex h-10 items-center justify-center bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
			href="/build"
		>
			<Plus class="mr-2 size-4" />
			New Estimate
		</Button.Root>
	</div>

	<!-- Filters -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row">
		<!-- Search -->
		<div class="flex-1">
			<div class="relative">
				<input
					type="text"
					placeholder="Search by estimate number, customer name, or email..."
					bind:value={searchInput}
					onkeydown={(e) => e.key === 'Enter' && handleSearch()}
					class="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
				<MagnifyingGlass class="absolute top-2.5 left-3 size-4 text-gray-400" />
			</div>
		</div>

		<!-- Status Filter -->
		<select
			bind:value={statusFilter}
			onchange={handleStatusFilter}
			class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
		>
			<option value="all">All Status</option>
			<option value="active">Active</option>
			<option value="expired">Expired</option>
			<option value="converted_to_order">Converted</option>
		</select>

		<!-- Search Button -->
		<Button.Root
			class="rounded-input shadow-mini inline-flex h-10 items-center justify-center bg-gray-600 px-4 text-sm font-semibold text-white hover:bg-gray-700"
			onclick={handleSearch}
		>
			Search
		</Button.Root>
	</div>

	<!-- Estimates Table -->
	<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							<button
								class="transition-colors hover:text-gray-700"
								onclick={() => handleSort('estimate_number')}
							>
								Estimate #
							</button>
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							<button
								class="transition-colors hover:text-gray-700"
								onclick={() => handleSort('customer_name')}
							>
								Customer
							</button>
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Model
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							<button
								class="transition-colors hover:text-gray-700"
								onclick={() => handleSort('final_total')}
							>
								Total
							</button>
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							<button
								class="transition-colors hover:text-gray-700"
								onclick={() => handleSort('created_at')}
							>
								Created
							</button>
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							<button
								class="transition-colors hover:text-gray-700"
								onclick={() => handleSort('expires_at')}
							>
								Expires
							</button>
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Status
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase"
						>
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each data.estimates as estimate}
						<tr class="transition-colors hover:bg-gray-50">
							<td class="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
								<a
									href="/estimate/{estimate.estimate_number}"
									class="text-blue-600 underline hover:text-blue-800"
								>
									{estimate.estimate_number}
								</a>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-900">{estimate.customer_name || 'N/A'}</div>
								<div class="text-sm text-gray-500">{estimate.customer_email || ''}</div>
							</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
								{estimate.model_data?.width}x{estimate.model_data?.length}
								{estimate.model_data?.axle}
							</td>
							<td class="px-6 py-4 text-sm font-semibold whitespace-nowrap text-gray-900">
								${estimate.final_total.toLocaleString()}
							</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
								{new Date(estimate.created_at).toLocaleDateString()}
							</td>
							<td class="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
								{new Date(estimate.expires_at).toLocaleDateString()}
								{#if !isExpired(estimate.expires_at) && estimate.status === 'active'}
									<div class="text-xs text-gray-400">
										({getDaysUntilExpiration(estimate.expires_at)} days left)
									</div>
								{/if}
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<span
									class="inline-flex rounded-full px-2 py-1 text-xs font-semibold {getStatusBadgeClass(
										estimate.status,
										estimate.expires_at
									)}"
								>
									{getStatusText(estimate.status, estimate.expires_at)}
								</span>
							</td>
							<td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
								<div class="flex items-center justify-end gap-2">
									<a
										href="/estimate/{estimate.estimate_number}"
										class="rounded p-1 text-blue-600 hover:text-blue-800"
										title="View Estimate"
									>
										<Eye class="size-4" />
									</a>
									{#if estimate.status === 'active' && !isExpired(estimate.expires_at)}
										<a
											href="/estimate/{estimate.estimate_number}/edit"
											class="rounded p-1 text-green-600 hover:text-green-800"
											title="Edit Estimate"
											aria-label="Edit Estimate"
										>
											<svg class="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
												/>
											</svg>
										</a>
									{/if}
									<button
										type="button"
										class="rounded p-1 text-gray-600 hover:text-gray-800"
										onclick={() => window.open(`/estimate/${estimate.estimate_number}`, '_blank')}
										title="Print Estimate"
									>
										<Printer class="size-4" />
									</button>
									<button
										type="button"
										class="rounded p-1 text-red-600 hover:text-red-800"
										onclick={() => deleteEstimate(estimate.id)}
										title="Delete Estimate"
									>
										<Trash class="size-4" />
									</button>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="8" class="px-6 py-12 text-center text-gray-500">
								No estimates found.
								<a href="/build" class="text-blue-600 hover:text-blue-800 underline ml-1">
									Create your first estimate
								</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Pagination -->
	{#if data.totalPages > 1}
		<div class="mt-6 flex items-center justify-between">
			<div class="text-sm text-gray-700">
				Showing page {data.currentPage} of {data.totalPages}
				({data.totalCount} total estimates)
			</div>
			<div class="flex items-center gap-2">
				<Button.Root
					class="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					onclick={() => goToPage(data.currentPage - 1)}
					disabled={data.currentPage <= 1}
				>
					Previous
				</Button.Root>

				{#each Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
					const start = Math.max(1, data.currentPage - 2);
					return start + i;
				}).filter((p) => p <= data.totalPages) as pageNum}
					<Button.Root
						class="rounded border px-3 py-2 text-sm transition-colors {pageNum === data.currentPage
							? 'border-blue-500 bg-blue-500 text-white'
							: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}"
						onclick={() => goToPage(pageNum)}
					>
						{pageNum}
					</Button.Root>
				{/each}

				<Button.Root
					class="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					onclick={() => goToPage(data.currentPage + 1)}
					disabled={data.currentPage >= data.totalPages}
				>
					Next
				</Button.Root>
			</div>
		</div>
	{/if}
</div>
