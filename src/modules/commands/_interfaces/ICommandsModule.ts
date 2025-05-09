// ESLint & Imports -->>

//= IMPLEMENTATION TYPES ======================================================================================
import type { ICommandsNamespace } from './ICommandsNamespace.ts'
import type { ICommandsService } from './ICommandsService.ts'

//--------------------------------------------------------------------------------------------------------------<<

export interface ICommandsModule {
	readonly commands: ICommandsNamespace

	reset: () => Promise<void>

	// Added for internal testing access
	readonly _commandsService: ICommandsService
}