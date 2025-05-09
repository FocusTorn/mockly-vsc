// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, singleton } from 'tsyringe'

//= NODE JS ===================================================================================================
import * as nodePath from 'node:path'

//= IMPLEMENTATION TYPES ======================================================================================
import type { IMockNodePathService } from '../_interfaces/IMockNodePathService.ts'

//--------------------------------------------------------------------------------------------------------------<<

type PathMode = 'posix' | 'win32'

@injectable()
@singleton()
export class NodePathService implements IMockNodePathService {

	private currentMode: PathMode = 'posix' // Default to POSIX for consistency

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Properties                                                                                      │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	private get activePathModule(): nodePath.PlatformPath { //>
		return this.currentMode === 'win32' ? nodePath.win32 : nodePath.posix
	} //<

	get delimiter(): ':' | ';' { //>
		return this.currentMode === 'win32' ? nodePath.win32.delimiter : nodePath.posix.delimiter
	} //<

	get posix(): nodePath.PlatformPath { //>
		return nodePath.posix
	} //<

	get sep(): '/' | '\\' { //>
		return this.currentMode === 'win32' ? nodePath.win32.sep : nodePath.posix.sep
	} //<

	get win32(): nodePath.PlatformPath { //>
		return nodePath.win32
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	basename(p: string, ext?: string): string { //>
		return this.activePathModule.basename(p, ext)
	} //<

	dirname(p: string): string { //>
		return this.activePathModule.dirname(p)
	} //<

	extname(p: string): string { //>
		return this.activePathModule.extname(p)
	} //<

	getMode(): PathMode { //>
		return this.currentMode
	} //<

	format(pathObject: nodePath.FormatInputPathObject): string { //>
		return this.activePathModule.format(pathObject)
	} //<

	isAbsolute(p: string): boolean { //>
		return this.activePathModule.isAbsolute(p)
	} //<

	join(...paths: string[]): string { //>
		return this.activePathModule.join(...paths)
	} //<

	normalize(p: string): string { //>
		return this.activePathModule.normalize(p)
	} //<

	parse(p: string): nodePath.ParsedPath { //>
		return this.activePathModule.parse(p)
	} //<

	relative(from: string, to: string): string { //>
		return this.activePathModule.relative(from, to)
	} //<

	resolve(...pathSegments: string[]): string { //>
		return this.activePathModule.resolve(...pathSegments)
	} //<

	setMode(mode: PathMode): void { //>
		this.currentMode = mode
	} //<

	toNamespacedPath(p: string): string { //>
		if (this.currentMode === 'win32') {
			return nodePath.win32.toNamespacedPath(p)
		}
		return p // POSIX doesn't have the same concept
	} //<

}