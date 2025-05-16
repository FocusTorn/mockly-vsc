// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, singleton, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import { LogLevel } from '../../../_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IEventBusService } from '../../../core/_interfaces/IEventBusService.ts'
import type { IExtensionsService } from '../_interfaces/IExtensionsService.ts'

//--------------------------------------------------------------------------------------------------------------<<

@injectable()
@singleton()
export class ExtensionsService implements IExtensionsService {

	private _extensionsMap = new Map<string, vt.Extension<any>>()

	constructor(
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
		@inject('IEventBusService') private eventBus: IEventBusService,
	) {
		this.utils.log(LogLevel.Debug, 'ExtensionsService initialized.')
	
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Getters                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	get all(): readonly vt.Extension<any>[] { //>
		return Array.from(this._extensionsMap.values())
	
	} //<

	get onDidChange(): vt.Event<void> { //>
		return this.eventBus.getOnDidChangeExtensionsEvent()
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	getExtension<T>( //>
		extensionId: string,
	): vt.Extension<T> | undefined {
		this.utils.log(LogLevel.Trace, `ExtensionsService.getExtension called for: ${extensionId}`)
		return this._extensionsMap.get(extensionId) as vt.Extension<T> | undefined
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal                                                                                        │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	_addExtension(ext: vt.Extension<any>): void { //>
		this.utils.log(LogLevel.Debug, `ExtensionsService: Adding mock extension: ${ext.id}`)
		this._extensionsMap.set(ext.id, ext)
		this.eventBus.fireOnDidChangeExtensions()
	
	} //<

	_clearExtensions(): void { //>
		if (this._extensionsMap.size > 0) {
			this.utils.log(LogLevel.Debug, `ExtensionsService: Clearing all mock extensions.`)
			this._extensionsMap.clear()
			this.eventBus.fireOnDidChangeExtensions()
		
		}
	
	} //<

	_removeExtension(extensionId: string): void { //>
		if (this._extensionsMap.delete(extensionId)) {
			this.utils.log(LogLevel.Debug, `ExtensionsService: Removing mock extension: ${extensionId}`)
			this.eventBus.fireOnDidChangeExtensions()
		
		}
	
	} //<

	_reset(): void { //>
		this.utils.log(LogLevel.Debug, 'ExtensionsService state reset...')
		this._clearExtensions()
	
	} //<

}
