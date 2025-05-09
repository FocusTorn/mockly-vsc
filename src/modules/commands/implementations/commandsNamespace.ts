// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import { LogLevel } from '../../../_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { ICommandsService } from '../_interfaces/ICommandsService.ts' // Import the new interface

//= IMPLEMENTATION TYPES ======================================================================================
import type { ICommandsNamespace } from '../_interfaces/ICommandsNamespace.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Mock implementation of the `vscode.commands` namespace.
 * Delegates state management and core logic to the internal CommandsService.
 */
@injectable()
export class CommandsNamespace implements ICommandsNamespace {

    private commandsService: ICommandsService // Use the interface type
    private utils: ICoreUtilitiesService

    constructor(
        @inject('ICoreUtilitiesService') utils: ICoreUtilitiesService,
        @inject('ICommandsService') commandsService: ICommandsService, // Inject using the interface token
    ) {
        this.utils = utils
        this.commandsService = commandsService
        this.utils.log(LogLevel.Debug, 'CommandsNamespace initialized.')
    }

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Methods                                                                                         │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    executeCommand<T = unknown>( //>
        command: string,
        ...rest: any[]
    ): Promise<T> {
        this.utils.log(LogLevel.Trace, `commands.executeCommand called for: ${command}`)
        return this.commandsService.executeCommand(command, ...rest)
    } //<

    getCommands( //>
        _filterInternal: boolean = false,
    ): Promise<string[]> {
        this.utils.log(LogLevel.Trace, `commands.getCommands called.`)
        return this.commandsService.getCommands(_filterInternal)
    } //<

    registerCommand( //>
        command: string,
        callback: (...args: any[]) => any,
        thisArg?: any,
    ): vt.Disposable {
        this.utils.log(LogLevel.Trace, `commands.registerCommand called for: ${command}`)
        return this.commandsService.registerCommand(command, callback, thisArg)
    } //<

}