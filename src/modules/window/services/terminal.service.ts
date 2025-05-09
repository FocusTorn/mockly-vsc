// ESLint & Imports --------->>

import { injectable, inject, singleton } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import { LogLevel } from '../../../_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IEventBusService } from '../../../core/_interfaces/IEventBusService.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { ITerminalService } from '../_interfaces/ITerminalService.ts'

//--------------------------------------------------------------------------------------------------------------<<

@injectable()
@singleton()
export class TerminalService implements ITerminalService {
    private _terminals: vt.Terminal[] = [] // TODO: Implement MockTerminal
    private _activeTerminal: vt.Terminal | undefined = undefined

    // TODO Evaluate the MockTerminal: The _terminals array and the return type of createTerminal use the vt.Terminal type imported from vscode. While import type is used correctly, the comment // TODO: Implement MockTerminal suggests a local implementation is intended but missing. Using the VS Code type directly means the mock doesn't fully control the shape and behavior of the Terminal object beyond the few methods implemented, which could be a limitation or potential source of unexpected behavior if other vt.Terminal properties/methods are accessed.
    
    constructor(
        @inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
        @inject('IEventBusService') private eventBus: IEventBusService,
    ) { }

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Getters                                                                                         │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    get activeTerminal(): vt.Terminal | undefined { return this._activeTerminal }

    get terminals(): readonly vt.Terminal[] { return this._terminals }

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Methods                                                                                         │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    createTerminal( //>
        nameOrOptions?: string | vt.TerminalOptions | vt.ExtensionTerminalOptions,
        shellPath?: string,
        shellArgs?: string | readonly string[] | undefined,
    ): vt.Terminal {

        let options: vt.TerminalOptions | vt.ExtensionTerminalOptions

        // Disambiguate Overloads --------------------------------------------->>

        if (typeof nameOrOptions === 'string' || nameOrOptions === undefined) {
            // Legacy signature (Overload 1)
            this.utils.log(LogLevel.Debug, `TerminalService.createTerminal called with legacy signature (name: ${nameOrOptions})`)

            const legacyOptions: vt.TerminalOptions = {
                name: nameOrOptions,
                shellPath,
                // Cast shellArgs to string | string[] | undefined to match vt.TerminalOptions
                shellArgs: shellArgs as string | string[] | undefined,
                // Add other default TerminalOptions properties if needed/sensible for mock
                // cwd: undefined,
                // env: undefined,
                // strictEnv: undefined,
                // hideFromUser: undefined,
                // message: undefined,
                // iconPath: undefined,
                // color: undefined,
                // location: undefined, // TerminalLocation needs more complex handling
                // isTransient: undefined,
            }
            options = legacyOptions
        }
        else {
            // Modern signature (Overload 2 or 3)
            this.utils.log(LogLevel.Debug, `TerminalService.createTerminal called with options object`)
            options = nameOrOptions // nameOrOptions is already TerminalOptions or ExtensionTerminalOptions
        }

        //----------------------------------------------------------------------------------------<<

        this.utils.log(LogLevel.Info, `TerminalService.createTerminal effective options: ${JSON.stringify(options)}`)

        const name = options.name ?? `Mock Terminal ${this._terminals.length + 1}`

        const terminal: vt.Terminal = { //>
            name,
            processId: Promise.resolve(Math.floor(Math.random() * 10000) + 1),
            creationOptions: options,
            exitStatus: undefined,
            shellIntegration: undefined,
            state: { //>
                isInteractedWith: false,
                shell: (options as vt.TerminalOptions)?.shellPath ?? 'mock-shell-path',
            }, //<
            sendText: (text: string, addNewLine?: boolean) => { //>
                this.utils.log(LogLevel.Info, `[Terminal ${name}] sendText: ${text}${addNewLine ? '\\n' : ''}`)
            }, //<
            show: (preserveFocus?: boolean) => { //>
                this.utils.log(LogLevel.Info, `[Terminal ${name}] show(preserveFocus: ${preserveFocus})`)
                this._setActiveTerminal(terminal) // Showing usually makes it active
            }, //<
            hide: () => { //>
                this.utils.log(LogLevel.Info, `[Terminal ${name}] hide()`)
                if (this._activeTerminal === terminal) {
                    this._setActiveTerminal(undefined)
                }
            }, //<
            dispose: () => { //>
                this.utils.log(LogLevel.Info, `[Terminal ${name}] dispose()`)
                this._removeTerminal(terminal)
            }, //<

        } //<

        this._terminals.push(terminal)
        this.eventBus.fireOnDidOpenTerminal(terminal)

        // Optionally set as active if it's the first one or based on options (e.g., check options.location?)
        if (!this._activeTerminal) { this._setActiveTerminal(terminal) }

        return terminal
    } //<

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Internal                                                                                        │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    _clearTerminals(): void { //>
        this.utils.log(LogLevel.Debug, 'Resetting TerminalService terminals...')
        this._terminals.forEach(t => t.dispose())
        this._terminals = []
        this._activeTerminal = undefined
    } //<

    _removeTerminal( //>
        terminal: vt.Terminal,
    ): void {
        const index = this._terminals.findIndex(t => t === terminal)
        if (index > -1) {
            this._terminals.splice(index, 1)
            if (this._activeTerminal === terminal) {
                // If the removed terminal was active, set active to undefined or the next available
                this._setActiveTerminal(this._terminals[0] ?? undefined)
            }
            this.eventBus.fireOnDidCloseTerminal(terminal)
        }
    } //<

    _reset(): void { //>
        this.utils.log(LogLevel.Debug, 'Resetting TerminalService state...')
        this._clearTerminals()
    } //<

    _setActiveTerminal( //>
        terminal: vt.Terminal | undefined,
    ): void {
        if (this._activeTerminal === terminal)
            return
        this.utils.log(LogLevel.Debug, `TerminalService: Setting active terminal: ${terminal?.name ?? 'undefined'}`)
        this._activeTerminal = terminal
        this.eventBus.fireOnDidChangeActiveTerminal(terminal)
    } //<

}
