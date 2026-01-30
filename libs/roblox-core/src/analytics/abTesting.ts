// A/B Testing Framework - Test features, prices, UI per player
// Essential for optimization

export interface ABTest {
	id: string;
	name: string;
	description: string;
	
	// Variants
	variants: ABVariant[];
	
	// Targeting
	targetPercent: number; // % of players in test
	startDate: number;
	endDate?: number;
	
	// Status
	active: boolean;
}

export interface ABVariant {
	id: string;
	name: string;
	weight: number; // Relative weight for distribution
	config: Record<string, string | number | boolean>;
}

export interface PlayerTestAssignments {
	playerId: number;
	assignments: Record<string, string>; // testId -> variantId
	assignedAt: Record<string, number>; // testId -> timestamp
}

// Deterministic assignment based on player ID
export function assignVariant(playerId: number, test: ABTest): ABVariant {
	// Use player ID to get consistent assignment
	const hash = (playerId * 31 + test.id.size()) % 100;
	
	// Check if player is in target percent
	if (hash >= test.targetPercent) {
		// Return control (first variant)
		return test.variants[0];
	}
	
	// Calculate total weight
	let totalWeight = 0;
	for (const variant of test.variants) {
		totalWeight += variant.weight;
	}
	
	// Assign based on weights
	const variantHash = (playerId * 17 + test.id.size() * 13) % totalWeight;
	let cumulative = 0;
	
	for (const variant of test.variants) {
		cumulative += variant.weight;
		if (variantHash < cumulative) {
			return variant;
		}
	}
	
	return test.variants[0];
}

// Get config value for player
export function getTestValue<T>(
	playerId: number,
	test: ABTest,
	key: string,
	defaultValue: T
): T {
	const variant = assignVariant(playerId, test);
	const value = variant.config[key];
	return (value as T) ?? defaultValue;
}

// Sample A/B tests
export const SAMPLE_TESTS: ABTest[] = [
	{
		id: "price_test_gems",
		name: "Gem Pack Pricing",
		description: "Test different gem pack prices",
		variants: [
			{ id: "control", name: "Control ($4.99)", weight: 50, config: { price: 499 } },
			{ id: "higher", name: "Higher ($5.99)", weight: 25, config: { price: 599 } },
			{ id: "lower", name: "Lower ($3.99)", weight: 25, config: { price: 399 } },
		],
		targetPercent: 100,
		startDate: os.time(),
		active: true,
	},
	{
		id: "ui_shop_layout",
		name: "Shop Layout Test",
		description: "Test different shop UI layouts",
		variants: [
			{ id: "grid", name: "Grid Layout", weight: 50, config: { layout: "grid", columns: 3 } },
			{ id: "list", name: "List Layout", weight: 50, config: { layout: "list", columns: 1 } },
		],
		targetPercent: 50,
		startDate: os.time(),
		active: true,
	},
	{
		id: "onboarding_flow",
		name: "Onboarding Flow",
		description: "Test tutorial variations",
		variants: [
			{ id: "short", name: "Short Tutorial", weight: 33, config: { steps: 3, skipable: true } },
			{ id: "medium", name: "Medium Tutorial", weight: 34, config: { steps: 5, skipable: true } },
			{ id: "long", name: "Long Tutorial", weight: 33, config: { steps: 8, skipable: false } },
		],
		targetPercent: 100,
		startDate: os.time(),
		active: true,
	},
];

export function getActiveTests(): ABTest[] {
	return SAMPLE_TESTS.filter(test => test.active);
}
