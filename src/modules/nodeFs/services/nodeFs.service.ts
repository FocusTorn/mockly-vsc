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
import type { IMockNodePathService } from '../../nodePath/_interfaces/IMockNodePathService.ts'
import type { IUriService } from '../../fileSystem/_interfaces/IUriService.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { IMockDirent, INodeFsService, IMockStats } from '../_interfaces/INodeFsService.ts' // IMockStats imported

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

	private _textEncoder = new TextEncoder()
	private _textDecoder = new TextDecoder()

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
		let nodeJsCode = (e as any).code
		if (e.name === 'FileSystemError') {
			const fsError = e as LocalFileSystemError
			switch (fsError.code) {
				case 'FileNotFound': nodeJsCode = 'ENOENT'; break
				case 'FileExists': nodeJsCode = 'EEXIST'; break
				case 'FileIsADirectory': nodeJsCode = 'EISDIR'; break
				case 'FileNotADirectory': nodeJsCode = 'ENOTDIR'; break
			}
		
		}
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
	): IMockStats {
		const uri = this._toUri(path)
		try {
			const vfsStat = this.vfsStateService.statSync(uri)
			
			const result: IMockStats = {
				type: vfsStat.type,
				ctime: vfsStat.ctime,
				mtime: vfsStat.mtime,
				size: vfsStat.size,
				isFile: () => vfsStat.type === FileType.File,
				isDirectory() { return this.type === FileType.Directory }, // Explicit function
				isSymbolicLink: () => vfsStat.type === FileType.SymbolicLink,
				isBlockDevice: () => false,
				isCharacterDevice: () => false,
				isFIFO: () => false,
				isSocket: () => false,
			}
			return result
		
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
			let encoding: BufferEncoding | null | undefined = null

			if (typeof options === 'string') {
				encoding = options
			
			}
			else if (options && typeof options === 'object') {
				encoding = options.encoding
			
			}

			if (encoding) {
				if (encoding.toLowerCase().replace('-', '') === 'utf8') {
					return this._textDecoder.decode(uint8Array)
				
				}
				else {
					this.utils.warn(`NodeFsService.readFileSync: Encoding '${encoding}' is not fully supported by this mock's TextDecoder. Returning UTF-8 decoded string or raw Buffer.`)
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

		let encoding: BufferEncoding | null | undefined = 'utf8'
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

		try {
			const entries = this.vfsStateService.readDirectorySync(uri)
			if (withFileTypes) {
				return entries.map(([name, type]) => new MockDirent(name, type))
			
			}
			else {
				return entries.map(([name, _type]) => name)
			
			}
		
		}
		catch (e) {
			this._handleError(e, uri)
		
		}
	
	} //<
    
	mkdirSync( //>
		path: string | Uri,
		options?: { recursive?: boolean, mode?: number },
	): void {
		const uri = this._toUri(path)
		const recursive = options?.recursive ?? false

		if (options?.mode !== undefined) {
			this.utils.log(LogLevel.Trace, `NodeFsService.mkdirSync: 'mode' option ${options.mode} is ignored by this mock.`)
		
		}

		try {
			if (recursive) {
				this.vfsStateService.addFolderSync(uri)
			
			}
			else {
				const parentPath = this.pathService.dirname(uri.path)
				if (parentPath !== uri.path && !this.vfsStateService.existsSync(this.uriService.file(parentPath))) {
					throw this.utils.createFileSystemError('FileNotFound', uri, `Parent directory does not exist for ${uri.fsPath}`)
				
				}
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
			const stats = this.statSync(uri)
			if (stats.isDirectory()) {
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
			if (force && ((e as any).code === 'FileNotFound' || (e as any).code === 'ENOENT')) {
				return
			
			}
            
			this._handleError(e, uri)
		
		}
	
	} //<

}
