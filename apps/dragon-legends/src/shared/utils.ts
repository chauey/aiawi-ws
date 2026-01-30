// Dragon Legends - Utility Functions (Shared)
// Roblox-ts compatible helper functions

// Format number with suffix (K, M)
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${string.format('%.1f', num / 1000000)}M`;
  } else if (num >= 1000) {
    return `${string.format('%.1f', num / 1000)}K`;
  }
  return tostring(num);
}

// Format number with comma separators
export function formatWithCommas(num: number): string {
  return string.format('%d', math.floor(num));
}

// Generate random ID
export function generateId(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const idx = math.floor(math.random() * chars.size());
    result += chars.sub(idx + 1, idx + 1);
  }
  return result;
}

// Sort array by number (returns new sorted array)
export function sortByNumber<T extends defined>(
  arr: readonly T[],
  getter: (item: T) => number,
  descending = false,
): T[] {
  const copy: T[] = [];
  for (const item of arr) {
    copy.push(item);
  }
  for (let i = 0; i < copy.size(); i++) {
    for (let j = i + 1; j < copy.size(); j++) {
      const a = getter(copy[i]);
      const b = getter(copy[j]);
      const shouldSwap = descending ? a < b : a > b;
      if (shouldSwap) {
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
    }
  }
  return copy;
}

// Get first N items from array
export function take<T extends defined>(arr: readonly T[], count: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < math.min(count, arr.size()); i++) {
    result.push(arr[i]);
  }
  return result;
}

// Sum array of numbers
export function sum(arr: readonly number[]): number {
  let total = 0;
  for (const n of arr) {
    total += n;
  }
  return total;
}

// Get object keys
export function keys<T extends object>(obj: T): (keyof T)[] {
  const result: (keyof T)[] = [];
  for (const [k] of pairs(obj)) {
    result.push(k as keyof T);
  }
  return result;
}

// Get object values
export function values<T extends object, V extends defined>(obj: T): V[] {
  const result: V[] = [];
  for (const [, v] of pairs(obj)) {
    result.push(v as V);
  }
  return result;
}

// Get object entries
export function entries<T extends object, V extends defined>(
  obj: T,
): [keyof T, V][] {
  const result: [keyof T, V][] = [];
  for (const [k, v] of pairs(obj)) {
    result.push([k as keyof T, v as V]);
  }
  return result;
}

// Check if array includes value (works with undefined)
export function includes<T>(
  arr: readonly (T | undefined)[],
  value: T,
): boolean {
  for (const item of arr) {
    if (item === value) return true;
  }
  return false;
}
