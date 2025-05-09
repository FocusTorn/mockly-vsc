// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'

//--------------------------------------------------------------------------------------------------------------<<

export interface ITerminalService {

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Properties                                                                                      │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘
    readonly activeTerminal: vt.Terminal | undefined

    readonly terminals: readonly vt.Terminal[]

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Methods                                                                                         │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘
    createTerminal: //>
    ((name?: string, shellPath?: string, shellArgs?: string | readonly string[]) => vt.Terminal) &
    ((options: vt.TerminalOptions) => vt.Terminal) &
    ((options: vt.ExtensionTerminalOptions) => vt.Terminal) //<

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Internal                                                                                        │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘
    _clearTerminals: () => void

    _removeTerminal: (terminal: vt.Terminal) => void

    _reset: () => void

    _setActiveTerminal: (terminal: vt.Terminal | undefined) => void

}
