<script lang="ts">
	import { Button } from 'bits-ui';
</script>

<div class="flex h-screen flex-col items-center justify-center space-y-4">
	<Button.Root
		class="rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 inline-flex
	h-12 items-center justify-center px-[21px] text-[15px]
	font-semibold active:scale-[0.98] active:transition-all"
		href="/build"
	>
		Build
	</Button.Root>

	<Button.Root
		class="rounded-input bg-dark text-background shadow-mini hover:bg-dark/95 inline-flex
	h-12 items-center justify-center px-[21px] text-[15px]
	font-semibold active:scale-[0.98] active:transition-all"
		href="/estimates"
	>
		View Estimates
	</Button.Root>
</div>
