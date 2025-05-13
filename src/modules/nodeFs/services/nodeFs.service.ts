// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, inject, singleton } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import type { URI as Uri } from 'vscode-uri'
import { FileType, LogLevel } from '../../../_vscCore/vscEnums.ts'
import type { FileSystemError as LocalFileSystemError } from '../../../_vscCore/vscFileSystemError.ts'

//= NODE JS ===================================================================================================
import { TextEncoder, TextDecoder } from 'node:util'
import { Buffer } from 'node:buffer'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IFileSystemStateService, IAddNodeOptions } from '../../fileSystem/_interfaces/IFileSystemStateService.ts'
import type { IMockNodePathService } from '../../fileSystem/_interfaces/IMockNodePathService.ts'
import type { IUriService } from '../../fileSystem/_interfaces/IUriService.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { IMockDirent, INodeFsService } from '../_interfaces/INodeFsService.ts'

//--------------------------------------------------------------------------------------------------------------<<


class MockDirent implements IMockDirent { //>

	constructor(public name: string, private fileType: FileType) {}

	isFile(): boolean { //>
		return this.fileType === FileType.File
	
	} //<
	isDirectory(): boolean { //>
		return this.fileType === FileType.Directory
	
	} //<
	isSymbolicLink(): boolean { //>
		return this.fileType === FileType.SymbolicLink
	
	} //<
	isBlockDevice(): boolean { return false }
	isCharacterDevice(): boolean { return false }
	isFIFO(): boolean { return false }
	isSocket(): boolean { return false }

} //<

@injectable()
@singleton()
export class NodeFsService implements INodeFsService {

	private _textEncoder = new TextEncoder() // Default UTF-8
	private _textDecoder = new TextDecoder() // Default UTF-8

	constructor(
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
		@inject('IFileSystemStateService') private vfsStateService: IFileSystemStateService,
		@inject('IMockNodePathService') private pathService: IMockNodePathService,
		@inject('IUriService') private uriService: IUriService,
	) {}

	private _toUri( //>
		path: string | Uri,
	): Uri {
		return typeof path === 'string' ? this.uriService.file(this.pathService.normalize(path)) : path
	
	} //<

	private _handleError( //>
		e: any,
		_uriForError: Uri,
	): never {
		// Try to map VFS error codes to Node.js like error codes if possible
		// Our VFS uses FileSystemError with codes like 'FileNotFound'
		// Node.js uses Error with code like 'ENOENT'
		let nodeJsCode = (e as any).code
		if (e.name === 'FileSystemError') {
			const fsError = e as LocalFileSystemError
			switch (fsError.code) {
				case 'FileNotFound': nodeJsCode = 'ENOENT'; break
				case 'FileExists': nodeJsCode = 'EEXIST'; break
				case 'FileIsADirectory': nodeJsCode = 'EISDIR'; break
				case 'FileNotADirectory': nodeJsCode = 'ENOTDIR'; break
				// No direct VFS code for ENOTEMPTY, but it's thrown as a generic error by VFSStateService
			}
		
		}
		// If it's a generic error from VFSStateService for "Directory not empty"
		if (e.message?.includes('Directory not empty')) {
			nodeJsCode = 'ENOTEMPTY'
		
		}

		throw this.utils.createError((e as Error).message || 'Unknown FS error', nodeJsCode)
	
	} //<

	existsSync( //>
		path: string | Uri,
	): boolean {
		const uri = this._toUri(path)
		return this.vfsStateService.existsSync(uri)
	
	} //<

	statSync( //>
		path: string | Uri,
	): vt.FileStat {
		const uri = this._toUri(path)
		try {
			return this.vfsStateService.statSync(uri)
		
		}
		catch (e) {
			this._handleError(e, uri)
		
		}
	
	} //<

	readFileSync( //>
		path: string | Uri,
		options?: { encoding?: BufferEncoding | null } | BufferEncoding | null,
	): string | Buffer {
		const uri = this._toUri(path)
		try {
			const uint8Array = this.vfsStateService.readFileSync(uri)
			let encoding: BufferEncoding | null | undefined = null // Will hold a valid BufferEncoding or null/undefined

			if (typeof options === 'string') {
				encoding = options // options is a BufferEncoding here
			
			}
			else if (options && typeof options === 'object') {
				encoding = options.encoding // options.encoding is BufferEncoding | null | undefined
			
			}

			// Check if a specific encoding is provided and it's not meant to return a Buffer directly
			if (encoding) { // If encoding is a valid BufferEncoding string (not null or undefined)
				// Use TextDecoder with the specified encoding if provided
				// For simplicity, this mock's TextDecoder is UTF-8 by default.
				// A more complete mock might instantiate TextDecoder with the given encoding.
				if (encoding.toLowerCase().replace('-', '') === 'utf8') {
					return this._textDecoder.decode(uint8Array)
				
				}
				else {
					this.utils.warn(`NodeFsService.readFileSync: Encoding '${encoding}' is not fully supported by this mock's TextDecoder. Returning UTF-8 decoded string or raw Buffer.`)
					// Fallback for simplicity or attempt to decode if possible
					try {
						return new TextDecoder(encoding).decode(uint8Array)
					
					}
                    
					// eslint-disable-next-line unused-imports/no-unused-vars
					catch (_error) {
						this.utils.error(`Failed to decode with encoding: ${encoding}. Returning raw buffer.`)
						return Buffer.from(uint8Array)
					
					}
				
				}
			
			}
			// If no encoding, or if options explicitly wanted a buffer (e.g. options = { encoding: null } or options = null after typical fs patterns)
			// then return as Buffer.
			return Buffer.from(uint8Array)
		
		}
		catch (e) {
			this._handleError(e, uri)
		
		}
	
	} //<
    
	writeFileSync( //>
		path: string | Uri,
		data: string | Uint8Array,
		options?: { encoding?: BufferEncoding | null, mode?: number | string, flag?: string } | BufferEncoding | null,
	): void {
		const uri = this._toUri(path)
		let contentUint8Array: Uint8Array

		let encoding: BufferEncoding | null | undefined = 'utf8' // Default for string data
		if (typeof options === 'string') {
			encoding = options
		
		}
		else if (options && typeof options === 'object') {
			encoding = options.encoding ?? encoding
			if (options.mode !== undefined)
				this.utils.log(LogLevel.Trace, `NodeFsService.writeFileSync: 'mode' option ${options.mode} is ignored by this mock.`)
			if (options.flag !== undefined)
				this.utils.log(LogLevel.Trace, `NodeFsService.writeFileSync: 'flag' option ${options.flag} is ignored by this mock.`)
		
		}

		if (typeof data === 'string') {
			// Similar to readFileSync, this mock's TextEncoder is UTF-8.
			// A more complete mock would use the specified encoding.
			if (encoding && encoding.toLowerCase().replace('-', '') !== 'utf8') {
				this.utils.warn(`NodeFsService.writeFileSync: Encoding '${encoding}' for string data is not fully supported by this mock's TextEncoder. Using UTF-8.`)
			
			}
			contentUint8Array = this._textEncoder.encode(data)
		
		}
		else {
			contentUint8Array = data
		
		}

		const addNodeOptions: IAddNodeOptions = { content: contentUint8Array }

		try {
			this.vfsStateService.writeFileSync(uri, contentUint8Array, addNodeOptions)
		
		}
		catch (e) {
			this._handleError(e, uri)
		
		}
	
	} //<
    
	readdirSync( //>
		path: string | Uri,
		options?: { encoding?: BufferEncoding | null, withFileTypes?: false } | { encoding?: BufferEncoding | null, withFileTypes: true } | BufferEncoding | null,
	): any {
		const uri = this._toUri(path)
		let withFileTypes = false

		if (options && typeof options === 'object' && 'withFileTypes' in options) {
			withFileTypes = !!options.withFileTypes
		
		}
		// Encoding option is ignored for readdirSync in this simplified mock as names are strings.

		try {
			const entries = this.vfsStateService.readDirectorySync(uri) // Returns [string, FileType][]
			if (withFileTypes) {
				return entries.map(([name, type]) => new MockDirent(name, type)) // Returns IMockDirent[]
			
			}
			else {
				return entries.map(([name, _type]) => name) // Returns string[]
			
			}
		
		}
		catch (e) {
			this._handleError(e, uri)
		
		}
	
	} //<
    
	mkdirSync( //>
		path: string | Uri,
		options?: vt.WorkspaceEditEntryMetadata & { recursive?: boolean, mode?: number },
	): void {
		const uri = this._toUri(path)
		const recursive = options?.recursive ?? false

		if (options?.mode !== undefined) {
			this.utils.log(LogLevel.Trace, `NodeFsService.mkdirSync: 'mode' option ${options.mode} is ignored by this mock.`)
		
		}

		try {
			if (recursive) {
				this.vfsStateService.addFolderSync(uri) // addFolderSync with _ensureParentsSync handles recursion
			
			}
			else {
				// Check if parent exists
				const parentPath = this.pathService.dirname(uri.path)
				if (parentPath !== uri.path && !this.vfsStateService.existsSync(this.uriService.file(parentPath))) {
					throw this.utils.createFileSystemError('FileNotFound', uri, `Parent directory does not exist for ${uri.fsPath}`)
				
				}
				// Attempt to add the folder; addFolderSync will throw if it exists as a file,
				// or if it exists as a folder (which is fine for mkdir unless EEXIST is strict for non-recursive)
				// Node.js mkdirSync without recursive throws EEXIST if path itself exists.
				if (this.vfsStateService.existsSync(uri)) {
					throw this.utils.createFileSystemError('FileExists', uri, `Path already exists: ${uri.fsPath}`)
				
				}
				this.vfsStateService.addFolderSync(uri)
			
			}
		
		}
		catch (e) {
			this._handleError(e, uri)
		
		}
	
	} //<

	rmSync( //>
		path: string | Uri,
		options?: { force?: boolean, recursive?: boolean, retryDelay?: number, maxRetries?: number },
	): void {
		const uri = this._toUri(path)
		const force = options?.force ?? false
		const recursive = options?.recursive ?? false

		if (options?.retryDelay !== undefined || options?.maxRetries !== undefined) {
			this.utils.log(LogLevel.Trace, `NodeFsService.rmSync: 'retryDelay' and 'maxRetries' options are ignored by this mock.`)
		
		}

		try {
			const stats = this.vfsStateService.statSync(uri) // Throws if not found (unless force handles it)
			if (stats.type === FileType.Directory) {
				this.vfsStateService.deleteFolderSync(uri, { recursive })
			
			}
			else {
				if (recursive) {
					this.utils.warn(`NodeFsService.rmSync: 'recursive' option has no effect when removing a file: ${uri.fsPath}`)
				
				}
				this.vfsStateService.deleteFileSync(uri)
			
			}
		
		}
		catch (e) {
			if (force && ((e as any).code === 'FileNotFound' /* VFS code */ || (e as any).code === 'ENOENT' /* Mapped code */)) {
				return // Suppress error if force is true and file not found
			
			}
            
			this._handleError(e, uri)
		
		}
	
	} //<

}
