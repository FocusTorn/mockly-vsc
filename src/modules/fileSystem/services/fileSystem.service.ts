// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { inject, injectable, singleton } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import { URI as Uri } from 'vscode-uri'
import { FileType, LogLevel, TextDocumentSaveReason } from '../../../_vscCore/vscEnums.ts'
import { CancellationTokenSource } from '../../../_vscCore/vscClasses.ts'
import type { FileSystemError } from '../../../_vscCore/vscFileSystemError.ts'

//= NODE JS ===================================================================================================
import { TextDecoder, TextEncoder } from 'node:util'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IEventBusService } from '../../../core/_interfaces/IEventBusService.ts'
import type { IFileSystemService } from '../_interfaces/IFileSystemService.ts'
import type { IMockNodePathService } from '../../nodePath/_interfaces/IMockNodePathService.ts'
import type { ITextDocumentService } from '../../workspace/_interfaces/ITextDocumentService.ts'
import type { IUriService } from '../_interfaces/IUriService.ts'
import type { IFileSystemStateService } from '../_interfaces/IFileSystemStateService.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { TextEdit } from '../../../_vscCore/vscClasses.ts'

//= IMPLEMENTATIONS ===========================================================================================
import { TextDocument } from '../../workspace/implementations/textDocument.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Manages an in-memory virtual file system, simulating VS Code's workspace file operations,
 * including state management, CRUD operations, event firing, and implementing the public
 * vscode.FileSystem API.
 * This service now directly uses IFileSystemStateService for VFS state management.
 */
@injectable()
@singleton()
export class FileSystemService implements IFileSystemService {

	private _textEncoder = new TextEncoder()
	private _textDecoder = new TextDecoder()

	constructor(
		@inject('IMockNodePathService') private pathService: IMockNodePathService,
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
		@inject('IEventBusService') private eventBus: IEventBusService,
		@inject('ITextDocumentService') private docService: ITextDocumentService,
		@inject('IUriService') private uriService: IUriService,
		@inject('IFileSystemStateService') private vfsStateService: IFileSystemStateService,
	) {
		this.utils.log(LogLevel.Debug, 'FileSystemService (new) initialized.')
	
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  PUBLIC API (Implements vscode.FileSystem)                                                       │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	async stat(uri: vt.Uri): Promise<vt.FileStat> { //>
		this.utils.log(LogLevel.Info, `FileSystemService.stat called for: ${uri.toString()}`)
		try {
			return await this.vfsStateService.stat(uri)
		
		}
		catch (e) {
			throw this.utils.createFileSystemError((e as any).code || 'Unknown', uri, (e as any).message)
		
		}
	
	} //<

	async readDirectory(uri: vt.Uri): Promise<[string, vt.FileType][]> { //>
		this.utils.log(LogLevel.Info, `FileSystemService.readDirectory called for: ${uri.toString()}`)
		try {
			return await this.vfsStateService.readDirectory(uri)
		
		}
		catch (e) {
			throw this.utils.createFileSystemError((e as any).code || 'Unknown', uri, (e as any).message)
		
		}
	
	} //<

	async readFile(uri: vt.Uri): Promise<Uint8Array> { //>
		this.utils.log(LogLevel.Info, `FileSystemService.readFile called for: ${uri.toString()}`)
		try {
			return await this.vfsStateService.readFile(uri)
		
		}
		catch (e) {
			throw this.utils.createFileSystemError((e as any).code || 'Unknown', uri, (e as any).message)
		
		}
	
	} //<
	
	async writeFile(uri: vt.Uri, content: Uint8Array, options?: { create?: boolean, overwrite?: boolean }): Promise<void> { //>
		this.utils.log(LogLevel.Info, `FileSystemService.writeFile called for: ${uri.toString()}`)

		const fileExists = await this.vfsStateService.exists(uri)

		// Adjust default behavior for create and overwrite when options are not fully specified
		const effectiveCreate = options?.create ?? true // Default to true if options.create is undefined or options itself is undefined
		const effectiveOverwrite = options?.overwrite ?? true // Default to true if options.overwrite is undefined or options itself is undefined

		if (!fileExists && !effectiveCreate) {
			throw this.utils.createFileSystemError('FileNotFound', uri, `File not found and create option is false: ${uri.toString()}`)
		
		}
		if (fileExists && !effectiveOverwrite) {
			const stat = await this.vfsStateService.stat(uri) // stat can be called here as we know fileExists
			if (stat.type === FileType.Directory) {
				throw this.utils.createFileSystemError('FileIsADirectory', uri)
			
			}
			// If not overwriting an existing file, it's an error (or a no-op depending on strictness)
			// VS Code's fs.writeFile typically overwrites, so if overwrite is explicitly false, we might throw.
			// For now, let's assume if overwrite is false and file exists, it's like FileExists.
			throw this.utils.createFileSystemError('FileExists', uri, `File exists and overwrite option is false: ${uri.toString()}`)
		
		}
		// If it's a directory and we are trying to write, it's always an error.
		if (fileExists) {
			const stat = await this.vfsStateService.stat(uri)
			if (stat.type === FileType.Directory) {
				throw this.utils.createFileSystemError('FileIsADirectory', uri)
			
			}
		
		}

		const willCreateEvent: vt.FileWillCreateEvent = {
			files: [uri],
			waitUntil: (_thenable: Thenable<any>) => Promise.resolve({} as vt.WorkspaceEdit),
			token: new CancellationTokenSource().token,
		}
		this.eventBus.fireOnWillCreateFiles(willCreateEvent)

		const docForEvent = this.docService.getTextDocument(uri)
		if (docForEvent) {
			const willSaveEvent: vt.TextDocumentWillSaveEvent = {
				document: docForEvent,
				reason: TextDocumentSaveReason.Manual as vt.TextDocumentSaveReason,
				waitUntil: (_thenable: Thenable<TextEdit[]>) => Promise.resolve([]),
			}
			this.eventBus.fireOnWillSaveTextDocument(willSaveEvent)
		
		}

		try {
			// Pass undefined for the IAddNodeOptions parameter to vfsStateService.writeFile,
			// as the create/overwrite logic is handled by FileSystemService itself.
			// vfsStateService.writeFile will use default metadata if options are undefined.
			await this.vfsStateService.writeFile(uri, content, undefined)
		
		}
		catch (e) {
			throw this.utils.createFileSystemError((e as any).code || 'Unknown', uri, (e as any).message)
		
		}

		this.eventBus.fireOnDidCreateFiles({ files: [uri] })

		if (docForEvent) {
			const newContentString = this._textDecoder.decode(content)
			this.docService._setContentAfterSave(docForEvent, newContentString)
		
		}

	} //<

	async delete(uri: vt.Uri, options?: { recursive?: boolean, useTrash?: boolean }): Promise<void> { //>
		this.utils.log(LogLevel.Info, `FileSystemService.delete called for: ${uri.toString()}`)

		const willEvent: vt.FileWillDeleteEvent = {
			files: [uri],
			waitUntil: (_thenable: Thenable<any>) => Promise.resolve({} as vt.WorkspaceEdit),
			token: new CancellationTokenSource().token,
		}
		this.eventBus.fireOnWillDeleteFiles(willEvent)

		let stats: vt.FileStat | null = null
		try {
			stats = await this.vfsStateService.stat(uri)
		
		}
		catch (e) {
			if ((e as any).code !== 'FileNotFound') {
				throw this.utils.createFileSystemError((e as any).code || 'Unknown', uri, (e as any).message)
			
			}
		
		}

		try {
			if (stats) {
				if (stats.type === FileType.Directory) {
					await this.vfsStateService.deleteFolder(uri, { recursive: options?.recursive ?? false, useTrash: options?.useTrash })
				
				}
				else {
					await this.vfsStateService.deleteFile(uri, { useTrash: options?.useTrash })
				
				}
			
			}
		
		}
		catch (e) {
			if ((e as any).code !== 'FileNotFound') {
				throw this.utils.createFileSystemError((e as any).code || 'Unknown', uri, (e as any).message)
			
			}
		
		}

		await this.docService.closeTextDocument(uri, true)
		this.eventBus.fireOnDidDeleteFiles({ files: [uri] })
	
	} //<

	async rename(oldUri: vt.Uri, newUri: vt.Uri, options?: { overwrite?: boolean }): Promise<void> { //>
		this.utils.log(LogLevel.Info, `FileSystemService.rename from ${oldUri.toString()} to ${newUri.toString()}`)

		const willEvent: vt.FileWillRenameEvent = {
			files: [{ oldUri, newUri }],
			waitUntil: (_thenable: Thenable<any>) => Promise.resolve({} as vt.WorkspaceEdit),
			token: new CancellationTokenSource().token,
		}
		this.eventBus.fireOnWillRenameFiles(willEvent)

		try {
			await this.vfsStateService.rename(oldUri, newUri, options)
		
		}
		catch (e) {
			throw this.utils.createFileSystemError((e as any).code || 'Unknown', newUri, (e as any).message)
		
		}

		const doc = this.docService.getTextDocument(oldUri)
		if (doc) {
			this.docService.renameTextDocument(oldUri, newUri)
		
		}

		this.eventBus.fireOnDidRenameFiles({ files: [{ oldUri, newUri }] })
	
	} //<

	async copy(source: vt.Uri, target: vt.Uri, options?: { overwrite?: boolean }): Promise<void> { //>
		this.utils.log(LogLevel.Info, `FileSystemService.copy from ${source.toString()} to ${target.toString()}`)
		const overwrite = options?.overwrite ?? false

		try {
			const sourceStat = await this.vfsStateService.stat(source)
			let targetStat: vt.FileStat | null = null
			try {
				targetStat = await this.vfsStateService.stat(target)
			
			}
			catch (e) {
				if ((e as any).code !== 'FileNotFound') {
					throw e
				
				}
			
			}

			if (targetStat && !overwrite) {
				throw this.utils.createFileSystemError('FileExists', target)
			
			}
			if (targetStat && overwrite && targetStat.type !== sourceStat.type) {
				throw this.utils.createError(`Cannot overwrite ${targetStat.type === FileType.Directory ? 'directory' : 'file'} with ${sourceStat.type === FileType.Directory ? 'directory' : 'file'}`)
			
			}

			const willCreateEvent: vt.FileWillCreateEvent = {
				files: [target],
				waitUntil: (_thenable: Thenable<any>) => Promise.resolve({} as vt.WorkspaceEdit),
				token: new CancellationTokenSource().token,
			}
			this.eventBus.fireOnWillCreateFiles(willCreateEvent)

			if (sourceStat.type === FileType.File) {
				const content = await this.vfsStateService.readFile(source)
				await this.vfsStateService.writeFile(target, content, { isRemote: (await this.vfsStateService.getNode(source))?.isRemote })
			
			}
			else if (sourceStat.type === FileType.Directory) {
				await this._copyDirectoryRecursiveVFS(source, target, overwrite)
			
			}
			else {
				throw this.utils.createError(`Unsupported file type for copy: ${sourceStat.type}`)
			
			}

			this.eventBus.fireOnDidCreateFiles({ files: [target] })
		
		}
		catch (e) {
			if ((e as FileSystemError)?.code === 'FileNotFound' && (e as any).uri?.toString() === source.toString()) {
				// MODIFIED: Use the default message format which includes the code "FileNotFound"
				throw this.utils.createFileSystemError('FileNotFound', source)
			
			}
			if ((e as any).code && !(e instanceof (await import('../../../_vscCore/vscFileSystemError.ts')).FileSystemError)) {
				throw this.utils.createFileSystemError((e as any).code, target, (e as any).message)
			
			}
			throw e
		
		}
	
	} //<
    
	async createDirectory(uri: vt.Uri): Promise<void> { //>
		this.utils.log(LogLevel.Info, `FileSystemService.createDirectory called for: ${uri.toString()}`)
		let stats: vt.FileStat | null = null
		try {
			stats = await this.vfsStateService.stat(uri)
		
		}
		catch (e) {
			if ((e as any).code !== 'FileNotFound') {
				throw this.utils.createFileSystemError((e as any).code || 'Unknown', uri, (e as any).message)
			
			}
		
		}

		if (stats) {
			if (stats.type === FileType.Directory) {
				this.utils.log(LogLevel.Debug, `createDirectory: Directory already exists, doing nothing: ${uri.toString()}`)
				// MODIFIED: Return if directory already exists (VS Code behavior)
			
			}
			else {
				// Path exists but is a file, this is an error as per VS Code docs
				throw this.utils.createFileSystemError('FileExists', uri) // MODIFIED: Throw FileExists
			
			}
		
		}
		else {
			const willEvent: vt.FileWillCreateEvent = {
				files: [uri],
				waitUntil: (_thenable: Thenable<any>) => Promise.resolve({} as vt.WorkspaceEdit),
				token: new CancellationTokenSource().token,
			}
			this.eventBus.fireOnWillCreateFiles(willEvent)

			try {
				await this.vfsStateService.addFolder(uri)
			
			}
			catch (e) {
				throw this.utils.createFileSystemError((e as any).code || 'Unknown', uri, (e as any).message)
			
			}

			this.eventBus.fireOnDidCreateFiles({ files: [uri] })
		
		}
	
	} //<
    
	isWritableFileSystem(scheme: string): boolean | undefined { //>
		if (scheme === 'file' || scheme === 'untitled') {
			return true
		
		}
		return undefined
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal Methods                                                                                │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * @inheritdoc
	 */
	async _clear(): Promise<void> { //>
		this.utils.log(LogLevel.Info, 'Clearing FileSystemService (VFS state)...')
		await this.vfsStateService.clear()
		this.utils.log(LogLevel.Debug, 'FileSystemService (VFS state) clear complete.')
	
	} //<

	private async _copyDirectoryRecursiveVFS(sourceDir: vt.Uri, targetDir: vt.Uri, overwrite: boolean): Promise<void> { //>
		let targetDirStat: vt.FileStat | null = null
		try {
			targetDirStat = await this.vfsStateService.stat(targetDir)
		
		}
		catch (e) {
			if ((e as any).code !== 'FileNotFound')
				throw e
		
		}

		if (targetDirStat && targetDirStat.type !== FileType.Directory) {
			throw this.utils.createError(`Cannot overwrite file with directory: ${targetDir.toString()}`)
		
		}
		if (!targetDirStat) {
			await this.vfsStateService.addFolder(targetDir)
		
		}

		const entries = await this.vfsStateService.readDirectory(sourceDir)
		for (const [name, type] of entries) {
			const sourcePath = this.uriService.joinPath(sourceDir, name)
			const targetPath = this.uriService.joinPath(targetDir, name)

			if (type === FileType.File) {
				const content = await this.vfsStateService.readFile(sourcePath)
				await this.vfsStateService.writeFile(targetPath, content, { isRemote: (await this.vfsStateService.getNode(sourcePath))?.isRemote })
			
			}
			else if (type === FileType.Directory) {
				await this._copyDirectoryRecursiveVFS(sourcePath, targetPath, overwrite)
			
			}
		
		}
	
	} //<

}
