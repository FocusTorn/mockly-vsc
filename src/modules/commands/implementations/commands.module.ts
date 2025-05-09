// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel } from '../../../_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { ICommandsModule } from '../_interfaces/ICommandsModule.ts'
import type { ICommandsNamespace } from '../_interfaces/ICommandsNamespace.ts'
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { ICommandsService } from '../_interfaces/ICommandsService.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Represents the Commands module in the mocked VS Code API.
 * Encapsulates the CommandsService and exposes the `vscode.commands` namespace.
 * Implements the ICommandsModule interface.
 */
@injectable()
export class CommandsModule implements ICommandsModule { // Implement the interface

    readonly commands: ICommandsNamespace

    constructor(
        @inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
        @inject('ICommandsService') private commandsService: ICommandsService,
        @inject('ICommandsNamespace') commandsNamespaceImpl: ICommandsNamespace,
    ) {
        this.utils.log(LogLevel.Debug, 'CommandsModule initializing...')
        this.commands = commandsNamespaceImpl
        this.utils.log(LogLevel.Debug, 'CommandsModule initialized.')
    }

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Methods                                                                                         │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    /**
     * Resets the state of the service managed by this module.
     */
    async reset(): Promise<void> { //>
        this.utils.log(LogLevel.Info, 'Resetting CommandsModule state...')

        this.commandsService._clearCommands()

        this.utils.log(LogLevel.Debug, 'CommandsModule reset complete.')
    } //<

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Internal                                                                                        │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    /**
     * Exposes the internal CommandsService for testing and state inspection.
     */
    get _commandsService(): ICommandsService { //> Expose FileSystemStateService
        return this.commandsService
    } //<

}