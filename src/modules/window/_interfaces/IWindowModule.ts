// ESLint & Imports -->>

//= IMPLEMENTATION TYPES ======================================================================================
import type { IOutputChannelService } from './IOutputChannelService.ts'
import type { ITerminalService } from './ITerminalService.ts'
import type { ITextEditorService } from './ITextEditorService.ts'
import type { IUserInteractionService } from './IUserInteractionService.ts'
import type { IWindowNamespace } from './IWindowNamespace.ts'

//--------------------------------------------------------------------------------------------------------------<<

export interface IWindowModule {

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Properties                                                                                      │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘
    readonly window: IWindowNamespace

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Methods                                                                                         │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘
    reset: () => Promise<void>

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Internal                                                                                        │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘
    readonly _outputChannelService: IOutputChannelService

    readonly _terminalService: ITerminalService

    readonly _textEditorService: ITextEditorService

    readonly _userInteractionService: IUserInteractionService

}
