// ESLint & Imports --------->>

//= TSYRINGE ==================================================================================================
import { injectable, inject, singleton } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import { LogLevel } from '../../../_vscCore/vscEnums.ts'
import { EventEmitter } from '../../../_vscCore/vscClasses.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { IOutputChannelService } from '../_interfaces/IOutputChannelService.ts'

//--------------------------------------------------------------------------------------------------------------<<

@injectable()
@singleton()
export class OutputChannelService implements IOutputChannelService {

	private _outputChannels = new Map<string, vt.OutputChannel | vt.LogOutputChannel>()

	constructor(
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
	) { }

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Creates or returns an existing output channel.
	 * @param name The name of the output channel.
	 * @param optionsOrLanguageId Optional. Either a language identifier or an options object.
	 * @returns The created or existing output channel.
	 */
	createOutputChannel: IOutputChannelService['createOutputChannel'] = ( //>
		name: string,
		optionsOrLanguageId?: string | { log: true },
	): any => { // Use 'any' here to satisfy the interface overloads from vscode.d.ts
		this.utils.log(LogLevel.Info, `OutputChannelService.createOutputChannel called for: ${name}`)

		if (this._outputChannels.has(name)) {
			this.utils.log(LogLevel.Debug, `Returning existing OutputChannel: ${name}`)
			return this._outputChannels.get(name)!
		
		}

		let channel: vt.OutputChannel | vt.LogOutputChannel

		if (typeof optionsOrLanguageId === 'object' && optionsOrLanguageId?.log === true) {
			// --- Create LogOutputChannel ---
			this.utils.log(LogLevel.Debug, `Creating LogOutputChannel: ${name}`)
			let currentLogLevel: vt.LogLevel = LogLevel.Info // Default log level
			const _onDidChangeLogLevel = new EventEmitter<vt.LogLevel>()

			// Helper to format additional arguments for log messages
			const formatArgs = (args: any[]): string => {
				return args.length ? ` ${args.map(a => JSON.stringify(a)).join(' ')}` : ''
			
			}

			// Helper to log message if its level is sufficient
			const logWithLevel = (level: vt.LogLevel, message: string) => {
				if (level >= currentLogLevel) {
					const levelString = LogLevel[level]?.toUpperCase() ?? 'LOG'
					console.log(`[LogOutput ${name} - ${levelString}] ${message}`)
				
				}
			
			}

			const logChannel: vt.LogOutputChannel = {
				name,
				get logLevel(): vt.LogLevel { return currentLogLevel },
				onDidChangeLogLevel: _onDidChangeLogLevel.event,

				trace: (message: string, ...args: any[]) => logWithLevel(LogLevel.Trace, this.utils.formatLogMessage(message) + formatArgs(args)),
				debug: (message: string, ...args: any[]) => logWithLevel(LogLevel.Debug, this.utils.formatLogMessage(message) + formatArgs(args)),
				info: (message: string, ...args: any[]) => logWithLevel(LogLevel.Info, this.utils.formatLogMessage(message) + formatArgs(args)),
				warn: (message: string, ...args: any[]) => logWithLevel(LogLevel.Warning, this.utils.formatLogMessage(message) + formatArgs(args)),
				error: (message: string | Error, ...args: any[]) => logWithLevel(LogLevel.Error, this.utils.formatLogMessage(message) + formatArgs(args)),

				append: (value: string) => logWithLevel(LogLevel.Info, value.trimEnd()), // vscode's append doesn't add newline
				appendLine: (value: string) => logWithLevel(LogLevel.Info, value), // vscode's appendLine adds newline
				replace: (value: string) => {
					console.log(`[LogOutput ${name}] REPLACE (clearing...)`) // Simulate clear before replace
					logWithLevel(LogLevel.Info, value)
				
				},
				clear: () => { console.log(`[LogOutput ${name}] CLEAR`) },
				show: (_preserveFocusOrColumn?: boolean | vt.ViewColumn, _preserveFocus?: boolean) => { console.log(`[LogOutput ${name}] SHOW`) },
				hide: () => { console.log(`[LogOutput ${name}] HIDE`) },
				dispose: () => {
					this.utils.log(LogLevel.Debug, `Disposing LogOutputChannel: ${name}`)
					_onDidChangeLogLevel.dispose()
					this._outputChannels.delete(name)
				
				},
			};

			// Internal method for testing/mocking log level changes
			(logChannel as any)._setLogLevel = (level: vt.LogLevel) => {
				if (currentLogLevel !== level) {
					currentLogLevel = level
					_onDidChangeLogLevel.fire(level)
				
				}
			
			}
			channel = logChannel
		
		}
		else {
			// --- Create Standard OutputChannel ---
			const languageId = typeof optionsOrLanguageId === 'string' ? optionsOrLanguageId : undefined
			this.utils.log(LogLevel.Debug, `Creating standard OutputChannel: ${name} (Lang: ${languageId ?? 'None'})`)
			channel = {
				name,
				append: (value: string) => console.log(`[Output ${name}] ${value.trimEnd()}`), // Simulate vscode append
				appendLine: (value: string) => console.log(`[Output ${name}] ${value}`), // Simulate vscode appendLine
				replace: (value: string) => {
					console.log(`[Output ${name}] REPLACE (clearing...)`) // Simulate clear before replace
					console.log(`[Output ${name}] ${value}`)
				
				},
				clear: () => { console.log(`[Output ${name}] CLEAR`) },
				show: (_preserveFocusOrColumn?: boolean | vt.ViewColumn, _preserveFocus?: boolean) => { console.log(`[Output ${name}] SHOW`) },
				hide: () => { console.log(`[Output ${name}] HIDE`) },
				dispose: () => {
					this.utils.log(LogLevel.Debug, `Disposing OutputChannel: ${name}`)
					this._outputChannels.delete(name)
				
				},
			}
		
		}

		this._outputChannels.set(name, channel)
		return channel
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal                                                                                        │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	_clearOutputChannels(): void { //>
		this.utils.log(LogLevel.Debug, 'Resetting OutputChannelService output channels...')
		this._outputChannels.forEach(channel => channel.dispose())
		this._outputChannels.clear()
	
	} //<

	_reset(): void { //>
		this.utils.log(LogLevel.Debug, 'Resetting OutputChannelService state...')
		this._clearOutputChannels()
	
	} //<

}
