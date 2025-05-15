// ESLint & Imports -->>

//--------------------------------------------------------------------------------------------------------------<<

export interface IMockNodePathService { //>
	// ... existing properties and methods like join, normalize, etc. ...

	sep: '/' | '\\';
	delimiter: ':' | ';';

	basename: (p: string, ext?: string) => string;
	dirname: (p: string) => string;
	extname: (p: string) => string;
	format: (pathObject: Partial<IPathObject>) => string;
	isAbsolute: (p: string) => boolean;
	join: (...paths: string[]) => string;
	normalize: (p: string) => string;
	parse: (p: string) => IPathObject;
	relative: (from: string, to: string) => string;
	resolve: (...pathSegments: string[]) => string;
	toNamespacedPath: (p: string) => string;

	/**
	 * Sets the mode for path operations.
	 * @param mode 'posix' or 'win32'
	 */
	setMode: (mode: 'posix' | 'win32') => void;

	/**
	 * Gets the current operational mode.
	 * @returns 'posix' | 'win32'
	 */
	getMode: () => 'posix' | 'win32';

	/**
	 * Checks if a path matches a glob pattern.
	 * @param pattern The glob pattern.
	 * @param path The path to test.
	 * @returns True if the path matches the pattern, false otherwise.
	 * @note This is a stub implementation in the mock. For actual glob matching,
	 *       a more comprehensive implementation or a third-party library would be needed
	 *       if the tested code relies on its true behavior.
	 */
	matchesGlob: (pattern: string, path: string) => boolean;

	readonly posix: IMockNodePathService;
	readonly win32: IMockNodePathService;
} //<

export interface IPathObject { //>
	root: string;
	dir: string;
	base: string;
	ext: string;
	name: string;
} //<