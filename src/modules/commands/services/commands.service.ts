// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, singleton, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { Disposable } from '../../../_vscCore/vscClasses.ts'
import { LogLevel } from '../../../_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { ICommandsService } from '../_interfaces/ICommandsService.ts' // Import the new interface

//--------------------------------------------------------------------------------------------------------------<<

@injectable()
@singleton()
export class CommandsService implements ICommandsService { // Implement the new interface

	private registeredCommands = new Map<string, (...args: any[]) => any>()

	constructor(
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
	) {
		this.utils.log(LogLevel.Debug, 'CommandsService initialized.')
	
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	async executeCommand<T = unknown>( //>
		command: string,
		...rest: any[]
	): Promise<T> {
		this.utils.log(
			LogLevel.Info,
			`CommandsService: Executing command: ${command} with args: ${JSON.stringify(rest)}`,
		)

		const handler = this.registeredCommands.get(command)
		if (handler) {
			try {
				const result = await Promise.resolve(handler(...rest))
				return result as T
			
			}
			catch (e) {
				this.utils.error(`CommandsService: Error executing command '${command}':`, e)
				throw e
			
			}
		
		}
		else {
			const errorMsg = `CommandsService: Command '${command}' not found.`
			this.utils.warn(errorMsg)
			throw this.utils.createError(errorMsg, 'CommandNotFound')
		
		}
	
	} //<

	async getCommands( //>
		_filterInternal: boolean = false,
	): Promise<string[]> {
		// TODO: Implement filtering if internal commands are ever added
		return Array.from(this.registeredCommands.keys())
	
	} //<

	registerCommand( //>
		command: string,
		callback: (...args: any[]) => any,
		thisArg?: any,
	): Disposable {
		if (this.registeredCommands.has(command)) {
			this.utils.log(LogLevel.Warning, `CommandsService: Command '${command}' is already registered. Overwriting.`)
		
		}
		this.utils.log(LogLevel.Info, `CommandsService: Command registered: ${command}`)
		const boundCallback = thisArg ? callback.bind(thisArg) : callback
		this.registeredCommands.set(command, boundCallback)
		return new Disposable(() => {
			if (this.registeredCommands.get(command) === boundCallback) {
				this.utils.log(LogLevel.Debug, `CommandsService: Disposing command registration: ${command}`)
				this.registeredCommands.delete(command)
			
			}
		
		})
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal                                                                                        │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	_clearCommands(): void { //>
		this.utils.log(LogLevel.Debug, 'CommandsService: Clearing all registered commands.')
		this.registeredCommands.clear()
	
	} //<

	_getCommandHandler( //>
		commandId: string,
	): ((...args: any[]) => any) | undefined {
		return this.registeredCommands.get(commandId)
	
	} //<

	_getRegisteredCommandIds(): string[] { //>
		return Array.from(this.registeredCommands.keys())
	
	} //<

}
