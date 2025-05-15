// ESLint & Imports --------->>

/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable unused-imports/no-unused-vars */

import { inject, injectable, singleton } from 'tsyringe'

import type * as vt from 'vscode'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { FileSystemError } from '../../_vscCore/vscFileSystemError.ts'

//= INJECTED TYPES ============================================================================================
import type { IEventBusService } from '../_interfaces/IEventBusService.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { ICoreUtilitiesService } from '../_interfaces/ICoreUtilitiesService.ts'
import { LogLevel } from '../../_vscCore/vscEnums.ts'
import type { IMockNodePathService } from 'src/modules/nodePath/_interfaces/IMockNodePathService.ts'
import type { IUriService } from 'src/modules/fileSystem/_interfaces/IUriService.ts'

//--------------------------------------------------------------------------------------------------------------<<

// Custom Error for NotImplemented
class NotImplementedError extends Error {

	constructor(message = 'Functionality not implemented') {
		super(message)
		this.name = 'NotImplementedError'
	
	}

}

/**
 * Provides core utility functions like logging and error creation.
 * This service centralizes common helper functionalities used across other services.
 * Implements ICoreUtilitiesService.
 */
@injectable()
@singleton()
export class CoreUtilitiesService implements ICoreUtilitiesService {

	private currentLogLevel: LogLevel = LogLevel.Info

	constructor(
		@inject('IEventBusService') private eventBus: IEventBusService,
		@inject('IMockNodePathService') private pathService: IMockNodePathService,
		@inject('IUriService') private uriService: IUriService,

	) {}
    
	// ┌────────────────────────────────────────────────────────────────────────────┐
	// │                                                                            │
	// │                                  LOGGING                                   │
	// │                                                                            │
	// └────────────────────────────────────────────────────────────────────────────┘        
    
	formatLogMessage( //>
		message: string | object | Error,
	): string {
		if (message instanceof Error) {
			return message.stack || message.message
		
		}
		if (typeof message === 'object') {
			try {
				return JSON.stringify(message)
			
			}
			catch (e) { //>
				return '[Object (serialization failed)]'
			
			} //<
		
		}
		return message
	
	} //<

	private shouldLog( //>
		level: LogLevel,
	): boolean {
		// Log if the current level is not Off AND the message level is >= the current level
		return this.currentLogLevel !== LogLevel.Off && level >= this.currentLogLevel
	
	} //<

	log( //>
		level: LogLevel,
		message: string | object | Error,
		...optionalParams: any[]
	): void {
		if (!this.shouldLog(level)) { return }

		const formattedMessage = this.formatLogMessage(message)

		switch (level) {
			case LogLevel.Trace:
				console.trace(`[TRACE] ${formattedMessage}`, ...optionalParams)
				break
			case LogLevel.Debug:
				console.debug(`[DEBUG] ${formattedMessage}`, ...optionalParams)
				break
			case LogLevel.Info:
				console.info(`[INFO] ${formattedMessage}`, ...optionalParams)
				break
			case LogLevel.Warning:
				console.warn(`[WARN] ${formattedMessage}`, ...optionalParams)
				break
			case LogLevel.Error:
				console.error(`[ERROR] ${formattedMessage}`, ...optionalParams)
				break
            // LogLevel.Off is handled by shouldLog, no default needed
		}

	} //<

	info( //>
		message: string | object,
		...optionalParams: any[]
	): void {
		this.log(LogLevel.Info, message, ...optionalParams)
	
	} //<

	warn( //>
		message: string | object,
		...optionalParams: any[]
	): void {
		this.log(LogLevel.Warning, message, ...optionalParams)
	
	} //<

	error( //>
		message: string | Error,
		...optionalParams: any[]
	): void {
		this.log(LogLevel.Error, message, ...optionalParams)
	
	} //<

	debug( //>
		message: string | object,
		...optionalParams: any[]
	): void {
		this.log(LogLevel.Debug, message, ...optionalParams)
	
	} //<

	trace( //>
		message: string | object,
		...optionalParams: any[]
	): void {
		this.log(LogLevel.Trace, message, ...optionalParams)
	
	} //<

	setLogLevel( //>
		level: LogLevel,
	): void {
		if (this.currentLogLevel !== level) {
			this.currentLogLevel = level
			this.eventBus.fireOnDidChangeLogLevel(level)
			this.log(LogLevel.Debug, `Log level set to: ${LogLevel[level]}`)
		
		}
	
	} //<

	getLogLevel( //>
	): LogLevel {
		return this.currentLogLevel
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────┐
	// │                                                                          │
	// │                              ERROR HANDLING                              │
	// │                                                                          │
	// └──────────────────────────────────────────────────────────────────────────┘        
    
	createError( //>
		message: string,
		code?: string,
	): Error {
		const error = new Error(message)
		if (code) {
			(error as any).code = code
		
		}
		return error
	
	} //<

	createFileSystemError( //>
		code: string,
		path: string | vt.Uri,
		message?: string,
	): Error {
		const uri = typeof path === 'string' ? this.uriService.file(this.pathService.normalize(path)) : path
		const errorMessage = message || `${code}: ${uri.toString()}`

		switch (code) {
			case 'FileNotFound':
				return FileSystemError.FileNotFound(uri)
			case 'FileExists':
				return FileSystemError.FileExists(uri)
			case 'FileNotADirectory':
				return FileSystemError.FileNotADirectory(uri)
			case 'FileIsADirectory':
				return FileSystemError.FileIsADirectory(uri)
			case 'NoPermissions':
				return FileSystemError.NoPermissions(uri)
			case 'Unavailable':
				return FileSystemError.Unavailable(uri)
			default:
			{
				const error = new Error(errorMessage)
                ;(error as any).code = code
				return error
			
			}
		}
	
	} //<

	createNotImplementedError( //>
		featureName?: string,
	): Error {
		const message = featureName
			? `Feature not implemented: ${featureName}`
			: 'Feature not implemented'
		return new NotImplementedError(message)
	
	} //<

}
