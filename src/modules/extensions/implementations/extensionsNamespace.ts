// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import { LogLevel } from '../../../_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IExtensionsService } from './../_interfaces/IExtensionsService.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { IExtensionsNamespace } from './../_interfaces/IExtensionsNamespace.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Mock implementation of the `vscode.extensions` namespace.
 * Delegates state management and core logic to the internal ExtensionsService.
 */
@injectable()
export class ExtensionsNamespace implements IExtensionsNamespace {

	private extensionsService: IExtensionsService
	private utils: ICoreUtilitiesService

	constructor(
		@inject('ICoreUtilitiesService') utils: ICoreUtilitiesService,
		@inject('IExtensionsService') extensionsService: IExtensionsService,
	) {
		this.utils = utils
		this.extensionsService = extensionsService
		this.utils.log(LogLevel.Debug, 'ExtensionsNamespace initialized.')
	
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Getters                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	get onDidChange(): vt.Event<void> { //>
		return this.extensionsService.onDidChange
	
	} //<

	get all(): readonly vt.Extension<any>[] { //>
		return this.extensionsService.all
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	getExtension<T>( //>
		extensionId: string,
	): vt.Extension<T> | undefined {
		this.utils.log(LogLevel.Trace, `extensions.getExtension called for: ${extensionId}`)
		return this.extensionsService.getExtension(extensionId)
	
	} //<

}
