// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel } from '../../../_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { IExtensionsModule } from '../_interfaces/IExtensionsModule.ts'
import type { IExtensionsNamespace } from '../_interfaces/IExtensionsNamespace.ts'
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IExtensionsService } from '../_interfaces/IExtensionsService.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Represents the Extensions module in the mocked VS Code API.
 * Encapsulates the ExtensionsService and exposes the `vscode.extensions` namespace.
 */
@injectable()
export class ExtensionsModule implements IExtensionsModule {
	readonly extensions: IExtensionsNamespace

	constructor(
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
		@inject('IExtensionsService')
		private extensionsService: IExtensionsService,
		@inject('IExtensionsNamespace')
		extensionsNamespaceImpl: IExtensionsNamespace,
	) {
		this.utils.log(LogLevel.Debug, 'ExtensionsModule initializing...')
		this.extensions = extensionsNamespaceImpl
		this.utils.log(LogLevel.Debug, 'ExtensionsModule initialized.')
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Resets the state of the service managed by this module.
	 */
	async reset(): Promise<void> {
		//>
		this.utils.log(
			LogLevel.Info,
			'Resetting ExtensionsModule ExtensionsModuleExtensionsModuleExtensionsModulestate...',
		)
		this.extensionsService._reset()
		this.utils.log(LogLevel.Debug, 'ExtensionsModule reset complete.')
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal                                                                                        │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Exposes the internal ExtensionsService for testing and state inspection.
	 */
	get _extensionsService(): IExtensionsService {
		//> Expose ExtensionsService
		return this.extensionsService
	} //<
}