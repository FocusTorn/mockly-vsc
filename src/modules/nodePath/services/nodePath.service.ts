// ESLint & Imports -->>

//= NODE JS ===================================================================================================
import { posix as nodePathPosix, win32 as nodePathWin32 } from 'node:path'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type { IPathObject, IMockNodePathService } from '../_interfaces/IMockNodePathService.ts'

//--------------------------------------------------------------------------------------------------------------<<

export class NodePathService implements IMockNodePathService {
	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │ Properties                                                                                       │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	private currentMode: 'posix' | 'win32'
	private pathModule: typeof nodePathPosix | typeof nodePathWin32

	// Keep a static reference to the actual node path modules
	private static readonly _nodePosixPath: typeof nodePathPosix = nodePathPosix
	private static readonly _nodeWin32Path: typeof nodePathWin32 = nodePathWin32

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │ Constructor                                                                                      │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	constructor(initialMode: 'posix' | 'win32' = 'posix') { //>
		this.currentMode = initialMode
		this.pathModule = this.currentMode === 'win32' ? NodePathService._nodeWin32Path : NodePathService._nodePosixPath
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │ Getter/Setter                                                                                    │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	get sep(): '/' | '\\' { //>
		return this.pathModule.sep
	} //<

	get delimiter(): ':' | ';' { //>
		return this.pathModule.delimiter
	} //<

	get posix(): IMockNodePathService { //>
		// Return a new instance or a shared instance configured for POSIX
		// For simplicity and to ensure mode integrity, returning a new instance is safer.
		const posixService = new NodePathService('posix')
		// To make it truly like Node's path.posix, this instance should always use posix behavior
		// and its setMode should ideally be a no-op or throw if attempted to change from posix.
		// However, for this mock, simply returning an instance set to 'posix' is sufficient
		// to satisfy the type, and its methods will use nodePathPosix.
		return posixService
	} //<

	get win32(): IMockNodePathService { //>
		const win32Service = new NodePathService('win32')
		// Similar to posix, this instance should always use win32 behavior.
		return win32Service
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │ Methods                                                                                          │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	setMode(mode: 'posix' | 'win32'): void { //>
		// Prevent mode change if this instance is supposed to be a fixed posix or win32 version
		// This check is more conceptual for the instances returned by .posix and .win32 getters.
		// The main instance (e.g., vscodeSimulator.path) should be mutable.
		// For now, allow changing mode on any instance for flexibility in the mock.
		this.currentMode = mode
		this.pathModule = mode === 'win32' ? NodePathService._nodeWin32Path : NodePathService._nodePosixPath
	} //<

	getMode(): 'posix' | 'win32' { //>
		return this.currentMode
	} //<

	basename(p: string, ext?: string): string { //>
		return this.pathModule.basename(p, ext)
	} //<

	dirname(p: string): string { //>
		return this.pathModule.dirname(p)
	} //<

	extname(p: string): string { //>
		return this.pathModule.extname(p)
	} //<

	format(pathObject: Partial<IPathObject>): string { //>
		return this.pathModule.format(pathObject as any)
	} //<

	isAbsolute(p: string): boolean { //>
		return this.pathModule.isAbsolute(p)
	} //<

	join(...paths: string[]): string { //>
		return this.pathModule.join(...paths)
	} //<

	normalize(p: string): string { //>
		return this.pathModule.normalize(p)
	} //<

	parse(p: string): IPathObject { //>
		const parsed = this.pathModule.parse(p)
		return {
			root: parsed.root,
			dir: parsed.dir,
			base: parsed.base,
			ext: parsed.ext,
			name: parsed.name,
		}
	} //<

	relative(from: string, to: string): string { //>
		return this.pathModule.relative(from, to)
	} //<

	resolve(...pathSegments: string[]): string { //>
		return this.pathModule.resolve(...pathSegments)
	} //<

	toNamespacedPath(p: string): string { //>
		if (this.pathModule.toNamespacedPath) { //>
			return this.pathModule.toNamespacedPath(p)
		} //<
		return p
	} //<

	matchesGlob(_pattern: string, _path: string): boolean { //>
		if (_pattern === '**/*.*' && _path.includes('.')) return true
		if (_pattern === '**/foo' && _path.endsWith('/foo')) return true
		return false
	} //<
}