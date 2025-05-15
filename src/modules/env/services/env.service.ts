// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, singleton, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type { URI as vUri } from 'vscode-uri'
import { LogLevel, UIKind } from '../../../_vscCore/vscEnums.ts'
import type * as vt from 'vscode'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IEventBusService } from '../../../core/_interfaces/IEventBusService.ts'
import type { IEnvService } from '../_interfaces/IEnvService.ts'
import type { IMockNodePathService } from 'src/modules/nodePath/_interfaces/IMockNodePathService.ts'

//--------------------------------------------------------------------------------------------------------------<<

@injectable()
@singleton()
export class EnvService implements IEnvService {

	private envState: { //>
		logLevel: LogLevel
		clipboardContent: string
	} //<

	constructor(
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
		@inject('IEventBusService') private eventBus: IEventBusService,
		@inject('IMockNodePathService') private pathService: IMockNodePathService,
	) {
		this.envState = { //>
			logLevel: this.utils.getLogLevel(),
			clipboardContent: '',
		} //<
		this.utils.log(LogLevel.Debug, 'EnvService initialized.')
	
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Properties                                                                                      │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	isNewAppInstall: boolean = false
	clipboard: vt.Clipboard = { //>
		readText: async () => {
			this.utils.log(LogLevel.Trace, 'EnvService.clipboard.readText called.')
			return this.envState.clipboardContent
		
		},
		writeText: async (text: string) => {
			this.utils.log(LogLevel.Info, `[UI MOCK] EnvService.clipboard.writeText called.`)
			this.envState.clipboardContent = text
		
		},
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Getters                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	get appHost(): string { return 'desktop' }
	get appName(): string { return 'Mock VS Code' }
	get appRoot(): string { return this.pathService.normalize('/mock/app/root') }
	get language(): string { return 'en' }
	get logLevel(): vt.LogLevel { return this.envState.logLevel }
	get machineId(): string { return 'mock-machine-id' }
	get onDidChangeLogLevel(): vt.Event<vt.LogLevel> { return this.eventBus.getOnDidChangeLogLevelEvent() }
	get remoteName(): string | undefined { return undefined }
	get sessionId(): string { return `mock-session-id-${Date.now()}` }
	get uiKind(): vt.UIKind { return UIKind.Desktop }
	get uriScheme(): string { return 'vscode' }

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	async asExternalUri( //>
		target: vUri,
	): Promise<vUri> {
		this.utils.log(LogLevel.Info, `[UI MOCK] EnvService.asExternalUri called for: ${target.toString()}`)
		return target
	
	} //<

	async openExternal( //>
		target: vUri,
	): Promise<boolean> {
		this.utils.log(LogLevel.Info, `[UI MOCK] EnvService.openExternal called for: ${target.toString()}`)
		return true
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal                                                                                        │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	_reset(): void { //>
		this.utils.log(LogLevel.Debug, 'EnvService state reset...')
		this.envState.clipboardContent = ''
	
	} //<

}
