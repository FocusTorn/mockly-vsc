// ESLint & Imports -->>

//= NODE JS ===================================================================================================
import type * as nodePath from 'node:path'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Simulates the standard Node.js path module for path manipulation
 * within the virtual environment. Handles both POSIX and Windows styles.
 */
export interface IMockNodePathService {

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Properties                                                                                      │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	/**
	 * The platform-specific path segment separator. `\` on Windows, `/` on POSIX.
	 * Determined by the service's current operating mode (POSIX/Windows).
	 */
	readonly sep: '/' | '\\'

	/**
	 * The platform-specific path delimiter. `;` on Windows, `:` on POSIX.
	 * Determined by the service's current operating mode (POSIX/Windows).
	 */
	readonly delimiter: ':' | ';'

	/**
	 * Provides access to the POSIX-specific path methods.
	 */
	readonly posix: nodePath.PlatformPath

	/**
	 * Provides access to the Windows-specific path methods.
	 */
	readonly win32: nodePath.PlatformPath

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Core Methods (delegating to posix or win32 based on current mode)                               │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Normalize a string path, reducing '..' and '.' parts.
	 * @param p The path to normalize.
	 */
	normalize: (p: string) => string

	/**
	 * Join all arguments together and normalize the resulting path.
	 * @param paths Path segments to join.
	 */
	join: (...paths: string[]) => string

	/**
	 * Resolve a sequence of paths or path segments into an absolute path.
	 * Resolves based on the virtual environment's root.
	 * @param pathSegments Sequence of paths or path segments.
	 */
	resolve: (...pathSegments: string[]) => string

	/**
	 * Determines whether path is an absolute path.
	 * @param p The path to check.
	 */
	isAbsolute: (p: string) => boolean

	/**
	 * Solve the relative path from 'from' to 'to'.
	 * @param from The source path.
	 * @param to The destination path.
	 */
	relative: (from: string, to: string) => string

	/**
	 * Return the directory name of a path. Similar to the Unix dirname command.
	 * @param p The path to evaluate.
	 */
	dirname: (p: string) => string

	/**
	 * Return the last portion of a path. Similar to the Unix basename command.
	 * @param p The path to evaluate.
	 * @param ext Optionally, an extension to remove from the result.
	 */
	basename: (p: string, ext?: string) => string

	/**
	 * Return the extension of the path, from the last '.' to end of string.
	 * @param p The path to evaluate.
	 */
	extname: (p: string) => string

	/**
	 * Returns an object whose properties represent significant elements of the path.
	 * @param p The path to evaluate.
	 */
	parse: (p: string) => nodePath.ParsedPath

	/**
	 * Returns a path string from an object - the opposite of parse().
	 * @param pathObject Object containing path elements.
	 */
	format: (pathObject: nodePath.FormatInputPathObject) => string

	/**
	 * Converts a path string to an equivalent `file:` URL object.
	 * (May need careful implementation for the mock environment).
	 * @param p The path string.
	 */
	toNamespacedPath: (p: string) => string // Note: Behavior might differ significantly in mock

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Mockly Specific Helpers (Optional but potentially useful)                                       │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Sets the operating mode ('posix' or 'win32') for the main methods.
	 * @param mode The desired operating mode.
	 */
	setMode: (mode: 'posix' | 'win32') => void

	/**
	 * Gets the current operating mode.
	 */
	getMode: () => 'posix' | 'win32'

}