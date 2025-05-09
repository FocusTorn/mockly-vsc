// ESLint & Imports --------->> 

import type { LogLevel, Uri } from 'vscode' // Or a custom log level enum

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Provides shared utility functions like logging, error handling,
 * and potentially decorator support or configuration.
 */
export interface ICoreUtilitiesService {
    
    // ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │                                                      Logging                                                       │
    // └────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘        
    
    /**
     * Logs a message at the specified level.
     * @param level The severity level (e.g., Info, Warn, Error, Debug, Trace).
     * @param message The message string or object to log.
     * @param optionalParams Additional parameters to include in the log entry.
     */
    log: (level: LogLevel, message: string | object, ...optionalParams: any[]) => void
    /**
     * Logs an informational message.
     * @param message The message string or object to log.
     * @param optionalParams Additional parameters to include in the log entry.
     */
    info: (message: string | object, ...optionalParams: any[]) => void
    /**
     * Logs a warning message.
     * @param message The message string or object to log.
     * @param optionalParams Additional parameters to include in the log entry.
     */
    warn: (message: string | object, ...optionalParams: any[]) => void
    /**
     * Logs an error message.
     * @param message The message string or Error object to log.
     * @param optionalParams Additional parameters to include in the log entry.
     */
    error: (message: string | Error, ...optionalParams: any[]) => void
    /**
     * Logs a debug message (typically only shown in development/debug modes).
     * @param message The message string or object to log.
     * @param optionalParams Additional parameters to include in the log entry.
     */
    debug: (message: string | object, ...optionalParams: any[]) => void
    /**
     * Logs a trace message (most verbose level).
     * @param message The message string or object to log.
     * @param optionalParams Additional parameters to include in the log entry.
     */
    trace: (message: string | object, ...optionalParams: any[]) => void
    /**
     * Sets the minimum log level to output.
     * @param level The minimum level to log.
     */
    setLogLevel: (level: LogLevel) => void
    /**
     * Gets the current minimum log level.
     */
    getLogLevel: () => LogLevel
    /**
     * Formats a log message (string, object, or Error) into a string representation.
     * @param message The message to format.
     * @returns A string representation suitable for logging.
     */
    formatLogMessage: (message: string | object | Error) => string
    
    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │                                                  Error Handling                                                  │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘        

    /**
     * Creates a standard Error object, potentially adding context.
     * @param message The error message.
     * @param code Optional error code (e.g., 'ENOENT').
     * @returns A standard Error object.
     */
    createError: (message: string, code?: string) => Error
    /**
     * Creates a specific FileSystemError (or similar custom error type).
     * @param code The error code (e.g., 'FileNotFound', 'FileExists').
     * @param path The path associated with the error.
     * @param message Optional custom message.
     * @returns A FileSystemError object.
     */
    createFileSystemError: (code: string, path: string | Uri, message?: string) => Error // Return type might be a specific error class
    /**
     * Creates a "Not Implemented" error, potentially identifying the caller.
     * @param featureName Optional name of the feature/method not implemented.
     * @returns A NotImplementedError object.
     */
    createNotImplementedError: (featureName?: string) => Error // Return type might be a specific error class
    
    // --- Decorator Support / Configuration (Conceptual) ---
    // If decorators need runtime config, it could go here.
    // Example:
    // setVerbosityForClass(className: string, verbose: boolean): void;
    // isVerbose(className: string, methodName: string): boolean;

    // --- Other Utilities ---
    // Add any other widely shared helper functions here.
    // Example:
    // generateUUID(): string;
    // deepClone<T>(obj: T): T;

}
