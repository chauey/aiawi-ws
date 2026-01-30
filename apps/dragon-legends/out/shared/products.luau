-- Compiled with roblox-ts v3.0.0
local TS = require(game:GetService("ReplicatedStorage"):WaitForChild("rbxts_include"):WaitForChild("RuntimeLib"))
-- Dragon Legends - Robux Product Definitions
-- These need to be created in the Roblox Developer Portal
local MarketplaceService = TS.import(script, game:GetService("ReplicatedStorage"), "rbxts_include", "node_modules", "@rbxts", "services").MarketplaceService
-- ==================== DEVELOPER PRODUCTS (Consumables) ====================
-- Create these in Roblox.com > Create > [Your Game] > Monetization > Developer Products
local DEVELOPER_PRODUCTS = {
	BASIC_EGG = {
		id = 0,
		name = "Basic Dragon Egg",
		robux = 75,
		description = "Hatch a random dragon (Common-Rare)",
	},
	RARE_EGG = {
		id = 0,
		name = "Rare Dragon Egg",
		robux = 150,
		description = "Hatch a random dragon (Uncommon-Epic)",
	},
	LEGENDARY_EGG = {
		id = 0,
		name = "Legendary Dragon Egg",
		robux = 400,
		description = "Hatch a random dragon (Rare-Legendary)",
	},
	MYTHIC_EGG = {
		id = 0,
		name = "Mythic Dragon Egg",
		robux = 800,
		description = "Guaranteed Epic+ dragon with Mythic chance",
	},
	COINS_SMALL = {
		id = 0,
		name = "1,000 Coins",
		robux = 50,
		description = "Quick coin boost",
	},
	COINS_MEDIUM = {
		id = 0,
		name = "5,000 Coins",
		robux = 200,
		description = "Great value pack",
	},
	COINS_LARGE = {
		id = 0,
		name = "15,000 Coins",
		robux = 500,
		description = "Mega coin bundle",
	},
	GEMS_SMALL = {
		id = 0,
		name = "100 Gems",
		robux = 100,
		description = "Premium currency",
	},
	GEMS_MEDIUM = {
		id = 0,
		name = "500 Gems",
		robux = 400,
		description = "Great gem value",
	},
	GEMS_LARGE = {
		id = 0,
		name = "1,500 Gems",
		robux = 1000,
		description = "Best gem value",
	},
	XP_BOOST_1H = {
		id = 0,
		name = "1 Hour XP Boost",
		robux = 50,
		description = "2x XP for 1 hour",
	},
	XP_BOOST_24H = {
		id = 0,
		name = "24 Hour XP Boost",
		robux = 200,
		description = "2x XP for 24 hours",
	},
	BREEDING_BOOST = {
		id = 0,
		name = "Instant Breed",
		robux = 75,
		description = "Skip breeding timer",
	},
	SHINY_BOOST = {
		id = 0,
		name = "Shiny Charm",
		robux = 150,
		description = "2x shiny chance for next 10 hatches",
	},
	EXTRA_DRAGON_SLOT = {
		id = 0,
		name = "Extra Dragon Slot",
		robux = 250,
		description = "Carry one more dragon in your team",
	},
}
-- ==================== GAME PASSES (Permanent) ====================
-- Create these in Roblox.com > Create > [Your Game] > Monetization > Passes
local GAME_PASSES = {
	VIP = {
		id = 0,
		name = "VIP Pass",
		robux = 499,
		benefits = { "2x coins from all sources", "VIP badge and chat tag", "Access to VIP-only dragons", "Exclusive VIP region", "Priority matchmaking" },
	},
	BREEDING_MASTER = {
		id = 0,
		name = "Breeding Master",
		robux = 299,
		benefits = { "50% faster breeding", "2x mutation chance", "See breeding outcome preview", "2 extra breeding slots" },
	},
	ARENA_CHAMPION = {
		id = 0,
		name = "Arena Champion Pass",
		robux = 199,
		benefits = { "1.5x arena rating gains", "No rating loss on first 3 daily losses", "Exclusive arena dragon skin", "Champion chat badge" },
	},
	AUTO_COLLECT = {
		id = 0,
		name = "Auto Collector",
		robux = 149,
		benefits = { "Auto-collect coins while AFK", "Auto-feed dragons", "Auto-claim daily rewards" },
	},
	DRAGON_STORAGE = {
		id = 0,
		name = "Dragon Vault",
		robux = 249,
		benefits = { "+50 dragon storage slots", "Sort and filter dragons", "Quick team swap" },
	},
}
-- ==================== HELPER FUNCTIONS ====================
-- Check if player owns a game pass
local function hasGamePass(player, passName)
	local pass = GAME_PASSES[passName]
	if pass.id == 0 then
		return false
	end
	local _exitType, _returns = TS.try(function()
		return TS.TRY_RETURN, { MarketplaceService:UserOwnsGamePassAsync(player.UserId, pass.id) }
	end, function()
		return TS.TRY_RETURN, { false }
	end)
	if _exitType then
		return unpack(_returns)
	end
end
-- Prompt purchase of a developer product
local function promptPurchase(player, productName)
	local product = DEVELOPER_PRODUCTS[productName]
	if product.id == 0 then
		warn(`Product {productName} not configured with Roblox ID`)
		return nil
	end
	MarketplaceService:PromptProductPurchase(player, product.id)
end
-- Prompt purchase of a game pass
local function promptGamePass(player, passName)
	local pass = GAME_PASSES[passName]
	if pass.id == 0 then
		warn(`Game Pass {passName} not configured with Roblox ID`)
		return nil
	end
	MarketplaceService:PromptGamePassPurchase(player, pass.id)
end
-- Get all VIP benefits for display
local function getVIPBenefits()
	local _array = {}
	local _length = #_array
	local _array_1 = GAME_PASSES.VIP.benefits
	table.move(_array_1, 1, #_array_1, _length + 1, _array)
	return _array
end
-- Calculate price with potential discounts
local function getDiscountedPrice(baseRobux, discountPercent)
	return math.floor(baseRobux * (1 - discountPercent / 100))
end
return {
	hasGamePass = hasGamePass,
	promptPurchase = promptPurchase,
	promptGamePass = promptGamePass,
	getVIPBenefits = getVIPBenefits,
	getDiscountedPrice = getDiscountedPrice,
	DEVELOPER_PRODUCTS = DEVELOPER_PRODUCTS,
	GAME_PASSES = GAME_PASSES,
}
