// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type { URI as Uri } from 'vscode-uri'
import type * as vt from 'vscode'

//= NODE JS ===================================================================================================
import type { Buffer } from 'node:buffer'

//--------------------------------------------------------------------------------------------------------------<<

export interface IMockDirent {
	name: string
	isFile: () => boolean
	isDirectory: () => boolean
	isSymbolicLink: () => boolean
	isBlockDevice: () => boolean
	isCharacterDevice: () => boolean
	isFIFO: () => boolean
	isSocket: () => boolean
}

// Added IMockStats interface here for INodeFsService to use
export interface IMockStats extends vt.FileStat { //>
	isFile: () => boolean
	isDirectory: () => boolean
	isSymbolicLink: () => boolean
	isBlockDevice: () => boolean
	isCharacterDevice: () => boolean
	isFIFO: () => boolean
	isSocket: () => boolean
} //<

export interface INodeFsService {
	existsSync: (path: string | Uri) => boolean
	statSync: (path: string | Uri) => IMockStats // MODIFIED: Return type
	readFileSync: (path: string | Uri, options?: { encoding?: BufferEncoding | null } | BufferEncoding | null) => string | Buffer
	writeFileSync: (path: string | Uri, data: string | Uint8Array, options?: {
		encoding?: BufferEncoding | null
		mode?: number | string
		flag?: string
	} | BufferEncoding | null) => void

	readdirSync: {
		(path: string | Uri, options?: { encoding?: BufferEncoding | null, withFileTypes?: false } | BufferEncoding | null): string[]
		(path: string | Uri, options: { encoding?: BufferEncoding | null, withFileTypes: true }): IMockDirent[]
	}

	mkdirSync: (path: string | Uri, options?: { recursive?: boolean, mode?: number }) => void
	rmSync: (path: string | Uri, options?: { force?: boolean, recursive?: boolean, retryDelay?: number, maxRetries?: number }) => void
}
