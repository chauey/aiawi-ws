-- Compiled with roblox-ts v3.0.0
-- Dragon Legends - Utility Functions (Shared)
-- Roblox-ts compatible helper functions
-- Format number with suffix (K, M)
local function formatNumber(num)
	if num >= 1000000 then
		return `{string.format("%.1f", num / 1000000)}M`
	elseif num >= 1000 then
		return `{string.format("%.1f", num / 1000)}K`
	end
	return tostring(num)
end
-- Format number with comma separators
local function formatWithCommas(num)
	return string.format("%d", math.floor(num))
end
-- Generate random ID
local function generateId(length)
	if length == nil then
		length = 12
	end
	local chars = "abcdefghijklmnopqrstuvwxyz0123456789"
	local result = ""
	do
		local i = 0
		local _shouldIncrement = false
		while true do
			if _shouldIncrement then
				i += 1
			else
				_shouldIncrement = true
			end
			if not (i < length) then
				break
			end
			local idx = math.floor(math.random() * #chars)
			local _arg0 = idx + 1
			local _arg1 = idx + 1
			result ..= string.sub(chars, _arg0, _arg1)
		end
	end
	return result
end
-- Sort array by number (returns new sorted array)
local function sortByNumber(arr, getter, descending)
	if descending == nil then
		descending = false
	end
	local copy = {}
	for _, item in arr do
		table.insert(copy, item)
	end
	for i = 0, #copy - 1 do
		do
			local j = i + 1
			local _shouldIncrement = false
			while true do
				if _shouldIncrement then
					j += 1
				else
					_shouldIncrement = true
				end
				if not (j < #copy) then
					break
				end
				local a = getter(copy[i + 1])
				local b = getter(copy[j + 1])
				local shouldSwap = if descending then a < b else a > b
				if shouldSwap then
					local _index = i + 1
					local _index_1 = j + 1
					copy[_index], copy[_index_1] = copy[j + 1], copy[i + 1]
				end
			end
		end
	end
	return copy
end
-- Get first N items from array
local function take(arr, count)
	local result = {}
	do
		local i = 0
		local _shouldIncrement = false
		while true do
			if _shouldIncrement then
				i += 1
			else
				_shouldIncrement = true
			end
			if not (i < math.min(count, #arr)) then
				break
			end
			local _arg0 = arr[i + 1]
			table.insert(result, _arg0)
		end
	end
	return result
end
-- Sum array of numbers
local function sum(arr)
	local total = 0
	for _, n in arr do
		total += n
	end
	return total
end
-- Get object keys
local function keys(obj)
	local result = {}
	for k in pairs(obj) do
		table.insert(result, k)
	end
	return result
end
-- Get object values
local function values(obj)
	local result = {}
	for _, v in pairs(obj) do
		table.insert(result, v)
	end
	return result
end
-- Get object entries
local function entries(obj)
	local result = {}
	for k, v in pairs(obj) do
		local _arg0 = { k, v }
		table.insert(result, _arg0)
	end
	return result
end
-- Check if array includes value (works with undefined)
local function includes(arr, value)
	for _, item in arr do
		if item == value then
			return true
		end
	end
	return false
end
return {
	formatNumber = formatNumber,
	formatWithCommas = formatWithCommas,
	generateId = generateId,
	sortByNumber = sortByNumber,
	take = take,
	sum = sum,
	keys = keys,
	values = values,
	entries = entries,
	includes = includes,
}
