// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
// Keep Disposable here as it's used as a type in the interface // WTF 

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Interface defining the contract for the internal CommandsService.
 * Manages the registration and execution of mock commands.
 */
export interface ICommandsService {

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Executes a registered command.
	 * @param command The command ID.
	 * @param rest Optional arguments to pass to the command handler.
	 * @returns A promise that resolves with the result of the command handler.
	 * @throws Error if the command is not found or the handler throws an error.
	 */
	executeCommand: <T = unknown>(command: string, ...rest: any[]) => Promise<T>

	/**
	 * Retrieves a list of registered command IDs.
	 * @param filterInternal Whether to filter out internal commands (ignored in mock).
	 * @returns A promise that resolves with an array of command IDs.
	 */
	getCommands: (filterInternal?: boolean) => Promise<string[]>

	/**
	 * Registers a command handler.
	 * @param command The command ID.
	 * @param callback The function to execute when the command is called.
	 * @param thisArg Optional 'this' context for the callback.
	 * @returns A Disposable to unregister the command.
	 */
	registerCommand: (command: string, callback: (...args: any[]) => any, thisArg?: any) => vt.Disposable

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal                                                                                        │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Clears all registered commands. Used for resetting state in tests.
	 */
	_clearCommands: () => void

	/**
	 * Retrieves the handler function for a registered command. Used for testing.
	 * @param commandId The command ID.
	 * @returns The handler function or undefined if not found.
	 */
	_getCommandHandler: (commandId: string) => ((...args: any[]) => any) | undefined

	/**
	 * Retrieves an array of registered command IDs. Used for testing.
	 * @returns An array of command IDs.
	 */
	_getRegisteredCommandIds: () => string[]

}
