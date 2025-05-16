// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import type { URI as vUri } from 'vscode-uri'
import { LogLevel } from '../../../_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IEnvService } from '../_interfaces/IEnvService.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { IEnvNamespace } from './../_interfaces/IEnvNamespace.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Mock implementation of the `vscode.env` namespace.
 * Delegates state management and core logic to the internal EnvService.
 */
@injectable()
export class EnvNamespace implements IEnvNamespace {

	private envService: IEnvService
	private utils: ICoreUtilitiesService

	constructor(
		@inject('ICoreUtilitiesService') utils: ICoreUtilitiesService,
		@inject('IEnvService') envService: IEnvService,
	) {
		this.utils = utils
		this.envService = envService
		this.utils.log(LogLevel.Debug, 'EnvNamespace initialized.')
	
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Getters                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	get appHost(): string { return this.envService.appHost }
	get appName(): string { return this.envService.appName }
	get appRoot(): string { return this.envService.appRoot }
	get clipboard(): vt.Clipboard { return this.envService.clipboard }
	get isNewAppInstall(): boolean { return this.envService.isNewAppInstall }
	get language(): string { return this.envService.language }
	get logLevel(): vt.LogLevel { return this.envService.logLevel }
	get machineId(): string { return this.envService.machineId }
	get onDidChangeLogLevel(): vt.Event<vt.LogLevel> { return this.envService.onDidChangeLogLevel }
	get remoteName(): string | undefined { return this.envService.remoteName }
	get sessionId(): string { return this.envService.sessionId }
	get uiKind(): vt.UIKind { return this.envService.uiKind }
	get uriScheme(): string { return this.envService.uriScheme }

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	async asExternalUri( //>
		target: vUri,
	): Promise<vUri> {
		this.utils.log(LogLevel.Trace, `env.asExternalUri called for: ${target.toString()}`)
		return this.envService.asExternalUri(target)
	
	} //<

	async openExternal( //>
		target: vUri,
	): Promise<boolean> {
		this.utils.log(LogLevel.Trace, `env.openExternal called for: ${target.toString()}`)
		return this.envService.openExternal(target)
	
	} //<

}
