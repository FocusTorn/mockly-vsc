// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel } from '../../../_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IEnvNamespace } from '../_interfaces/IEnvNamespace.ts'
import type { IEnvModule } from '../_interfaces/IEnvModule.ts'
import type { IEnvService } from '../_interfaces/IEnvService.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Represents the Env module in the mocked VS Code API.
 * Encapsulates the EnvService and exposes the `vscode.env` namespace.
 */
@injectable()
export class EnvModule implements IEnvModule {

	private envService: IEnvService
	private utils: ICoreUtilitiesService

	constructor(
		@inject('ICoreUtilitiesService') utils: ICoreUtilitiesService,
		@inject('IEnvService') envService: IEnvService,
		@inject('IEnvNamespace') envNamespaceImpl: IEnvNamespace,
	) {
		this.utils = utils
		this.envService = envService
		this.env = envNamespaceImpl
		this.utils.log(LogLevel.Debug, 'EnvModule initializing...')
		this.utils.log(LogLevel.Debug, 'EnvModule initialized.')
	
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Properties                                                                                      │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	public readonly env: IEnvNamespace

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Resets the state of the service managed by this module.
	 */
	async reset(): Promise<void> { //>
		this.utils.log(LogLevel.Info, 'Resetting EnvModule state...')

		// Delegate reset to the encapsulated internal service
		this.envService._reset() // EnvService has a _reset method

		this.utils.log(LogLevel.Debug, 'EnvModule reset complete.')
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal                                                                                        │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Exposes the internal EnvService for testing and state inspection.
	 */
	get _envService(): IEnvService { //> Expose EnvService
		return this.envService
	
	} //<

}
