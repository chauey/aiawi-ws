// Error Logging - Sentry-style error tracking
// Capture and report errors for debugging

export type ErrorSeverity = "debug" | "info" | "warning" | "error" | "critical";

export interface LoggedError {
	id: string;
	timestamp: number;
	severity: ErrorSeverity;
	
	// Error details
	message: string;
	errorType: string;
	stack?: string;
	
	// Context
	playerId?: number;
	playerName?: string;
	location?: string;
	
	// Additional data
	metadata: Record<string, string | number | boolean>;
	
	// Environment
	gameVersion: string;
	placeId: number;
	serverId: string;
}

const errorLog: LoggedError[] = [];
let gameVersion = "1.0.0";
let serverId = "";

export function initErrorLogging(version: string, server: string) {
	gameVersion = version;
	serverId = server;
}

export function logError(
	severity: ErrorSeverity,
	message: string,
	errorType: string,
	playerId?: number,
	metadata?: Record<string, string | number | boolean>
) {
	const error: LoggedError = {
		id: `err_${os.time()}_${math.random(10000, 99999)}`,
		timestamp: os.time(),
		severity,
		message,
		errorType,
		playerId,
		metadata: metadata ?? {},
		gameVersion,
		placeId: game.PlaceId,
		serverId,
	};
	
	errorLog.push(error);
	
	// Print based on severity
	const prefix = `[${severity.upper()}]`;
	if (severity === "critical" || severity === "error") {
		warn(`${prefix} ${errorType}: ${message}`);
	} else {
		print(`${prefix} ${errorType}: ${message}`);
	}
	
	// Keep log size manageable
	if (errorLog.size() > 1000) {
		errorLog.remove(0);
	}
}

// Convenience methods
export function logDebug(message: string, metadata?: Record<string, string | number | boolean>) {
	logError("debug", message, "Debug", undefined, metadata);
}

export function logInfo(message: string, metadata?: Record<string, string | number | boolean>) {
	logError("info", message, "Info", undefined, metadata);
}

export function logWarning(message: string, playerId?: number, metadata?: Record<string, string | number | boolean>) {
	logError("warning", message, "Warning", playerId, metadata);
}

export function logCritical(message: string, errorType: string, playerId?: number, metadata?: Record<string, string | number | boolean>) {
	logError("critical", message, errorType, playerId, metadata);
}

// Wrap function with error catching
export function wrapWithLogging<T extends (...args: never[]) => unknown>(
	fn: T,
	context: string
): T {
	return ((...args: Parameters<T>) => {
		try {
			return fn(...args);
		} catch (error) {
			logError("error", tostring(error), "RuntimeError", undefined, { context });
			throw error;
		}
	}) as T;
}

// Get recent errors
export function getRecentErrors(count: number = 50, minSeverity?: ErrorSeverity): LoggedError[] {
	let filtered = errorLog;
	
	if (minSeverity) {
		const severityOrder: ErrorSeverity[] = ["debug", "info", "warning", "error", "critical"];
		const minIndex = severityOrder.indexOf(minSeverity);
		filtered = errorLog.filter(e => severityOrder.indexOf(e.severity) >= minIndex);
	}
	
	return filtered.slice(-count);
}

// Get error stats
export function getErrorStats(): Record<ErrorSeverity, number> {
	const stats: Record<ErrorSeverity, number> = {
		debug: 0,
		info: 0,
		warning: 0,
		error: 0,
		critical: 0,
	};
	
	for (const err of errorLog) {
		stats[err.severity]++;
	}
	
	return stats;
}

// Flush errors (for sending to external service)
export function flushErrors(): LoggedError[] {
	const errors = [...errorLog];
	errorLog.clear();
	return errors;
}
