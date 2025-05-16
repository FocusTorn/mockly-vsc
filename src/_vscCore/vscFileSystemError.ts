// ESLint & Imports --------->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type { URI as Uri } from 'vscode-uri'

//--------------------------------------------------------------------------------------------------------------<<

export class FileSystemError extends Error {

	readonly code: string
	readonly uri?: Uri

	constructor(code: string, messageOrUri?: string | Uri) {
		const message = typeof messageOrUri === 'string'
			? messageOrUri
			: `${code}: ${messageOrUri?.toString() ?? 'unknown path'}`
		super(message)
		this.code = code
		// Store the internal Uri type if provided
		this.uri = typeof messageOrUri !== 'string' ? messageOrUri : undefined
		this.name = 'FileSystemError'

		Object.setPrototypeOf(this, FileSystemError.prototype)
	
	}

	static FileExists(messageOrUri?: string | Uri): FileSystemError {
		return new FileSystemError('FileExists', messageOrUri)
	
	}
	static FileNotFound(messageOrUri?: string | Uri): FileSystemError {
		return new FileSystemError('FileNotFound', messageOrUri)
	
	}
	static FileNotADirectory(messageOrUri?: string | Uri): FileSystemError {
		return new FileSystemError('FileNotADirectory', messageOrUri)
	
	}
	static FileIsADirectory(messageOrUri?: string | Uri): FileSystemError {
		return new FileSystemError('FileIsADirectory', messageOrUri)
	
	}
	static NoPermissions(messageOrUri?: string | Uri): FileSystemError {
		return new FileSystemError('NoPermissions', messageOrUri)
	
	}
	static Unavailable(messageOrUri?: string | Uri): FileSystemError {
		return new FileSystemError('Unavailable', messageOrUri)
	
	}

}
