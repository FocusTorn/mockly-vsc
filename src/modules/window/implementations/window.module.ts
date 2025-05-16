// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================

//= NODE JS ===================================================================================================

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IWindowNamespace } from '../_interfaces/IWindowNamespace.ts'
import type { ITextEditorService } from '../_interfaces/ITextEditorService.ts'
import type { IUserInteractionService } from '../_interfaces/IUserInteractionService.ts'
import type { ITerminalService } from '../_interfaces/ITerminalService.ts'
import type { IOutputChannelService } from '../_interfaces/IOutputChannelService.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { IWindowModule } from '../_interfaces/IWindowModule.ts'

//= IMPLEMENTATIONS ===========================================================================================

//= MISC ======================================================================================================
import { LogLevel } from '../../../_vscCore/vscEnums.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Represents the Window module in the mocked VS Code API.
 * Encapsulates window-related services and exposes the `vscode.window` namespace.
 */
@injectable()
export class WindowModule implements IWindowModule {

	readonly window: IWindowNamespace

	/**
	 * @param utils - Core utility service for logging and errors.
	 * @param windowNamespaceImpl - The implementation of the vscode.window namespace.
	 * @param textEditorService - Service for managing text editors.
	 * @param userInteractionService - Service for user interaction (messages, quick picks, etc.).
	 * @param terminalService - Service for managing terminals.
	 * @param outputChannelService - Service for managing output channels.
	 */
	constructor(
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
		@inject('IWindowNamespace') windowNamespaceImpl: IWindowNamespace,
		@inject('ITextEditorService') private textEditorService: ITextEditorService,
		@inject('IUserInteractionService') private userInteractionService: IUserInteractionService,
		@inject('ITerminalService') private terminalService: ITerminalService,
		@inject('IOutputChannelService') private outputChannelService: IOutputChannelService,
	) {
		this.utils.log(LogLevel.Debug, 'WindowModule initializing...')
		this.window = windowNamespaceImpl
		this.utils.log(LogLevel.Debug, 'WindowModule initialized.')
	
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/** @inheritdoc */
	async reset(): Promise<void> { //>
		this.utils.log(LogLevel.Info, 'Resetting WindowModule state...')

		this.textEditorService._reset()
		this.userInteractionService._reset()
		this.terminalService._reset()
		this.outputChannelService._clearOutputChannels()

		this.utils.log(LogLevel.Debug, 'WindowModule reset complete.')
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal                                                                                        │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Exposes the internal OutputChannelService for testing and state inspection.
	 */
	get _outputChannelService(): IOutputChannelService { //>
		return this.outputChannelService
	
	} //<

	/**
	 * Exposes the internal TerminalService for testing and state inspection.
	 */
	get _terminalService(): ITerminalService { //>
		return this.terminalService
	
	} //<

	/**
	 * Exposes the internal TextEditorService for testing and state inspection.
	 */
	get _textEditorService(): ITextEditorService { //>
		return this.textEditorService
	
	} //<

	/**
	 * Exposes the internal UserInteractionService for testing and state inspection.
	 */
	get _userInteractionService(): IUserInteractionService { //>
		return this.userInteractionService
	
	} //<

}
