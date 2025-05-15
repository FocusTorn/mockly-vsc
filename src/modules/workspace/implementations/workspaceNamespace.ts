// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { inject, injectable } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import { URI as nUri } from 'vscode-uri'
import { FileType, LogLevel } from '../../../_vscCore/vscEnums.ts'
import { Disposable, EventEmitter } from '../../../_vscCore/vscClasses.ts'
import type { ThemeColor } from '../../../_vscCore/vscClasses.ts'

//= NODE JS ===================================================================================================
import { TextDecoder, TextEncoder } from 'node:util'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IEventBusService } from '../../../core/_interfaces/IEventBusService.ts'
import type { IFileSystemService } from '../../fileSystem/_interfaces/IFileSystemService.ts'
import type { IMockNodePathService } from '../../nodePath/_interfaces/IMockNodePathService.ts'
import type { IUriService } from '../../fileSystem/_interfaces/IUriService.ts'
import type { ITextDocumentService } from '../_interfaces/ITextDocumentService.ts'
import type { IWorkspaceStateService } from '../_interfaces/IWorkspaceStateService.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { IWorkspaceNamespace } from '../_interfaces/IWorkspaceNamespace.ts'

//= IMPLEMENTATIONS ===========================================================================================
import { TextDocument } from './textDocument.ts'
import micromatch from 'micromatch'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Mock implementation of the `vscode.workspace` namespace.
 * Delegates state management and core logic to internal services.
 */
@injectable()
export class WorkspaceNamespace implements IWorkspaceNamespace { //>

	constructor(
		@inject('IWorkspaceStateService') private wsService: IWorkspaceStateService,
		@inject('ITextDocumentService') private docService: ITextDocumentService,
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
		@inject('IEventBusService') private eventBus: IEventBusService,
		// @inject('IFileSystemModule') private fileSystemModule: IFileSystemModule, // REMOVED
		@inject('IFileSystemService') private fileSystemService: IFileSystemService, // ADDED
		@inject('IMockNodePathService') private pathService: IMockNodePathService, // ADDED
		@inject('IUriService') private uriService: IUriService, // ADDED
	) {
		this.utils.log(LogLevel.Debug, 'WorkspaceNamespaceImpl initialized.')
	
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Properties (Accessors)                                                                          │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * @inheritdoc
	 */
	get fs(): IFileSystemService { //>
		return this.fileSystemService // MODIFIED
	
	} //<

	/**
	 * @inheritdoc
	 */
	get name(): string | undefined { return this.wsService.name }

	/**
	 * @inheritdoc
	 */
	get onDidChangeConfiguration(): vt.Event<vt.ConfigurationChangeEvent> { return this.eventBus.getOnDidChangeConfigurationEvent() }

	/**
	 * @inheritdoc
	 */
	get onDidChangeTextDocument(): vt.Event<vt.TextDocumentChangeEvent> { return this.eventBus.getOnDidChangeTextDocumentEvent() }

	/**
	 * @inheritdoc
	 */
	get onDidChangeWorkspaceFolders(): vt.Event<vt.WorkspaceFoldersChangeEvent> { return this.eventBus.getOnDidChangeWorkspaceFoldersEvent() }

	/**
	 * @inheritdoc
	 */
	get onDidCloseTextDocument(): vt.Event<vt.TextDocument> { return this.eventBus.getOnDidCloseTextDocumentEvent() }

	/**
	 * @inheritdoc
	 */
	get onDidCreateFiles(): vt.Event<vt.FileCreateEvent> { return this.eventBus.getOnDidCreateFilesEvent() }

	/**
	 * @inheritdoc
	 */
	get onDidDeleteFiles(): vt.Event<vt.FileDeleteEvent> { return this.eventBus.getOnDidDeleteFilesEvent() }

	/**
	 * @inheritdoc
	 */
	get onDidOpenTextDocument(): vt.Event<vt.TextDocument> { return this.eventBus.getOnDidOpenTextDocumentEvent() }

	/**
	 * @inheritdoc
	 */
	get onDidRenameFiles(): vt.Event<vt.FileRenameEvent> { return this.eventBus.getOnDidRenameFilesEvent() }

	/**
	 * @inheritdoc
	 */
	get onDidSaveTextDocument(): vt.Event<vt.TextDocument> { return this.eventBus.getOnDidSaveTextDocumentEvent() }

	/**
	 * @inheritdoc
	 */
	get onWillDeleteFiles(): vt.Event<vt.FileWillDeleteEvent> { return this.eventBus.getOnWillDeleteFilesEvent() }

	/**
	 * @inheritdoc
	 */
	get onWillRenameFiles(): vt.Event<vt.FileWillRenameEvent> { return this.eventBus.getOnWillRenameFilesEvent() }

	/**
	 * @inheritdoc
	 */
	get onWillSaveTextDocument(): vt.Event<vt.TextDocumentWillSaveEvent> { return this.eventBus.getOnWillSaveTextDocumentEvent() }

	/**
	 * @inheritdoc
	 */
	get textDocuments(): readonly TextDocument[] { //>
		const docs = [...this.docService.getTextDocuments()]
		this.utils.log(
			LogLevel.Trace,
			`WorkspaceNamespace.textDocuments getter. Returning: ${docs.map(d => d.uri.toString())}`,
		)
		return docs
	
	} //<

	/**
	 * @inheritdoc
	 */
	get workspaceFile(): vt.Uri | undefined { return this.wsService.workspaceFile }

	/**
	 * @inheritdoc
	 */
	get workspaceFolders(): readonly vt.WorkspaceFolder[] | undefined { return this.wsService.workspaceFolders }

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * @inheritdoc
	 */
	async applyEdit(edit: vt.WorkspaceEdit): Promise<boolean> { //>
		this.utils.log(LogLevel.Info, 'WorkspaceNamespace.applyEdit called')

		if (!edit) {
			this.utils.warn('WorkspaceNamespace.applyEdit: No edit provided.')
			return Promise.resolve(false)
		
		}

		let hasMeaningfulEdits = false
		if (edit.size > 0) {
			hasMeaningfulEdits = true
		
		}

		if (!hasMeaningfulEdits) {
			for (const [, editsForUri] of edit.entries()) {
				if (editsForUri && editsForUri.length > 0) {
					hasMeaningfulEdits = true
					break
				
				}
			
			}
		
		}

		if (!hasMeaningfulEdits) {
			this.utils.log(LogLevel.Debug, 'WorkspaceNamespace.applyEdit: Edit contains no operations to apply.')
			return Promise.resolve(true)
		
		}

		for (const [uri, textEdits] of edit.entries()) {
			if (!textEdits || textEdits.length === 0) {
				continue
			
			}
			try {
				const textDocument = this.docService.getTextDocument(uri)

				if (textDocument && textDocument.isClosed) {
					this.utils.warn(`WorkspaceNamespace.applyEdit: Document ${uri.toString()} is closed. Edits for this URI will be skipped.`)
					continue
				
				}

				let currentContent = ''
				if (!textDocument) {
					try {
						const contentBuffer = await this.fileSystemService.readFile(uri) // MODIFIED
						currentContent = new TextDecoder().decode(contentBuffer)
					
					}
					catch (e) {
						if ((e as any).code === 'FileNotFound') {
							this.utils.log(LogLevel.Debug, `WorkspaceNamespace.applyEdit: File not found: ${uri.toString()}. Will create with edit content.`)
							currentContent = ''
						
						}
						else {
							this.utils.error(`WorkspaceNamespace.applyEdit: Error reading file ${uri.toString()} during initial check:`, e)
							return Promise.resolve(false)
						
						}
					
					}
				
				}
				else {
					currentContent = textDocument.getText()
				
				}

				let updatedContent = currentContent
				const sortedEdits = [...textEdits].sort((a, b) => {
					const startA = a.range.start
					const startB = b.range.start
					return startB.line - startA.line || startB.character - startA.character
				
				})

				for (const singleTextEdit of sortedEdits) {
					const tempDocForOffset = textDocument ?? new TextDocument(uri, updatedContent, 'plaintext', this.utils, this.eventBus)
					const startOffset = tempDocForOffset.offsetAt(singleTextEdit.range.start)
					const endOffset = tempDocForOffset.offsetAt(singleTextEdit.range.end)
					updatedContent = updatedContent.substring(0, startOffset)
					  + singleTextEdit.newText
					  + updatedContent.substring(endOffset)
				
				}

				await this.fileSystemService.writeFile( // MODIFIED
					uri,
					new TextEncoder().encode(updatedContent),
					{ create: true, overwrite: true },
				)
			
			}
			catch (e) {
				this.utils.error(`WorkspaceNamespace.applyEdit: Error applying edits to ${uri.toString()}:`, e)
				return Promise.resolve(false)
			
			}
		
		}
		return Promise.resolve(true)
	
	} //<

	/**
	 * @inheritdoc
	 */
	async delete(uri: vt.Uri, options?: { recursive?: boolean, useTrash?: boolean }): Promise<void> { //>
		this.utils.log(LogLevel.Info, `WorkspaceNamespace.delete called for: ${uri.toString()}`)
		try {
			await this.fileSystemService.delete(uri, options) // MODIFIED
		
		}
		catch (e) {
			if (!((e as any).name === 'FileSystemError')) {
				throw this.utils.createFileSystemError((e as any).code || 'Unknown', uri, (e as any).message)
			
			}
			throw e
		
		}
	
	} //<

	/**
	 * @inheritdoc
	 */
	async findFiles( //>
		include: vt.GlobPattern,
		exclude?: vt.GlobPattern | null,
		maxResults?: number,
		token?: vt.CancellationToken,
	): Promise<vt.Uri[]> {
		this.utils.log(LogLevel.Info, `WorkspaceNamespace.findFiles: include=${typeof include === 'string' ? include : include.pattern}, exclude=${exclude ?? 'none'}`)

		const results: nUri[] = []
		const workspaceFolders = this.wsService.workspaceFolders ?? []

		if (workspaceFolders.length === 0) {
			this.utils.warn('WorkspaceNamespace.findFiles: No workspace folders open.')
			return []
		
		}

		// const pathService = this.fileSystemModule.path // REMOVED
		// const uriService = this.fileSystemModule.Uri // REMOVED
		// const fs = this.fileSystemModule.fs // REMOVED
		// Use directly injected services:
		const pathService = this.pathService
		const uriService = this.uriService
		const fs = this.fileSystemService


		const includePatternString = typeof include === 'string' ? include : include.pattern
		const includeBaseUri = typeof include === 'object' && 'baseUri' in include ? include.baseUri : undefined

		let excludePatternString: string | undefined
		let excludeBaseUri: nUri | undefined

		if (typeof exclude === 'string' || exclude === null || exclude === undefined) {
			excludePatternString = exclude ?? undefined
		
		}
		else if (typeof exclude === 'object' && 'pattern' in exclude) {
			excludePatternString = exclude.pattern
			excludeBaseUri = exclude.baseUri
		
		}

		for (const folder of workspaceFolders) {
			if (token?.isCancellationRequested)
				break

			const folderUri = folder.uri
			const filesToSearch: { uri: nUri, relativePath: string }[] = []

			try {
				const entries = await fs.readDirectory(folderUri)
				for (const [name] of entries) {
					filesToSearch.push({ uri: uriService.joinPath(folderUri, name), relativePath: name })
				
				}
			
			}
			catch (e) {
				this.utils.warn(`WorkspaceNamespace.findFiles: Error reading initial directory ${folderUri.fsPath}`, e)
				continue
			
			}

			while (filesToSearch.length > 0) {
				if (token?.isCancellationRequested)
					break
				if (results.length >= (maxResults ?? Number.POSITIVE_INFINITY))
					break

				const { uri: currentUri, relativePath } = filesToSearch.pop()!
				let nodeType: FileType

				try {
					const stat = await fs.stat(currentUri)
					nodeType = stat.type
				
				}
				catch (e) {
					this.utils.log(LogLevel.Trace, `WorkspaceNamespace.findFiles: Stat failed for ${currentUri.fsPath}, skipping.`, e)
					continue
				
				}

				let pathToTestForExclusion = relativePath
				if (excludeBaseUri) {
					const normalizedExcludeBase = pathService.normalize(excludeBaseUri.path)
					const normalizedAbsolutePath = pathService.normalize(currentUri.path)
					if (normalizedAbsolutePath.startsWith(normalizedExcludeBase + pathService.sep) || normalizedAbsolutePath === normalizedExcludeBase) {
						pathToTestForExclusion = pathService.relative(normalizedExcludeBase, normalizedAbsolutePath)
					
					}
				
				}
				if (excludePatternString && micromatch.isMatch(pathToTestForExclusion, excludePatternString, { dot: true })) {
					this.utils.log(LogLevel.Trace, `Excluding '${relativePath}' (tested as '${pathToTestForExclusion}') due to pattern '${excludePatternString}'`)
					continue
				
				}

				if (nodeType === FileType.File) {
					let pathToTestForInclusion = relativePath
					if (includeBaseUri) {
						const normalizedIncludeBase = pathService.normalize(includeBaseUri.path)
						const normalizedAbsolutePath = pathService.normalize(currentUri.path)
						if (normalizedAbsolutePath.startsWith(normalizedIncludeBase + pathService.sep) || normalizedAbsolutePath === normalizedIncludeBase) {
							pathToTestForInclusion = pathService.relative(normalizedIncludeBase, normalizedAbsolutePath)
						
						}
						else {
							this.utils.log(LogLevel.Trace, `Skipping '${relativePath}' for include pattern with base '${includeBaseUri.fsPath}' as it's not contained.`)
							continue
						
						}
					
					}
					if (micromatch.isMatch(pathToTestForInclusion, includePatternString, { dot: true })) {
						results.push(currentUri)
					
					}
				
				}
				else if (nodeType === FileType.Directory) {
					try {
						const entries = await fs.readDirectory(currentUri)
						for (const [name] of entries) {
							filesToSearch.push({
								uri: uriService.joinPath(currentUri, name),
								relativePath: pathService.join(relativePath, name),
							})
						
						}
					
					}
					catch (e) {
						this.utils.log(LogLevel.Trace, `WorkspaceNamespace.findFiles: Error reading subdirectory ${currentUri.fsPath}, skipping.`, e)
					
					}
				
				}
			
			}
		
		}
		this.utils.log(LogLevel.Debug, `WorkspaceNamespace.findFiles found ${results.length} files.`)
		return results.slice(0, maxResults)
	
	} //<

	/**
	 * @inheritdoc
	 */
	async openTextDocument(uriOrOptions?: vt.Uri | string | { language?: string, content?: string }): Promise<vt.TextDocument> { //>
		this.utils.log(LogLevel.Trace, 'WorkspaceNamespace.openTextDocument called')

		// const uriService = this.fileSystemModule.Uri // REMOVED
		// const pathService = this.fileSystemModule.path // REMOVED
		// const fs = this.fileSystemModule.fs // REMOVED
		// Use directly injected services:
		const uriService = this.uriService
		const pathService = this.pathService
		const fs = this.fileSystemService

		let uri: nUri
		let language: string | undefined
		let content: string | undefined

		if (!uriOrOptions) {
			uri = uriService.parse(`untitled:Untitled-${Math.random().toString(36).substring(2, 9)}`)
			content = ''
			language = 'plaintext'
		
		}
		else if (uriOrOptions instanceof nUri) {
			uri = uriOrOptions
		
		}
		else if (typeof uriOrOptions === 'string') {
			uri = uriService.file(uriOrOptions)
		
		}
		else if (typeof uriOrOptions === 'object' && uriOrOptions !== null && ('content' in uriOrOptions || 'language' in uriOrOptions)) {
			uri = uriService.parse(`untitled:Untitled-${Math.random().toString(36).substring(2, 9)}`)
			language = uriOrOptions.language
			content = uriOrOptions.content
		
		}
		else {
			throw this.utils.createError(`Invalid arguments provided to openTextDocument: ${JSON.stringify(uriOrOptions)}`)
		
		}

		const uriString = uri.toString()
		this.utils.log(LogLevel.Info, `WorkspaceNamespace.openTextDocument called for: ${uriString}`)

		let doc = this.docService.getTextDocument(uri)
		this.utils.log(LogLevel.Debug, `WorkspaceNamespace.openTextDocument: After getTextDocument check, doc = ${doc ? doc.uri.toString() : 'undefined'}`)

		if (doc) {
			if (!doc.isClosed) {
				this.utils.log(LogLevel.Debug, `Returning already open document: ${uriString}`)
				if (language && doc.languageId !== language) {
					doc._setLanguageId(language)
				
				}
			
			}
			else {
				this.utils.log(LogLevel.Debug, `Re-opening closed document: ${uriString}.`)
				let reopenContent = doc.getText()
				if (uri.scheme !== 'untitled') {
					try {
						const fileContentBytes = await fs.readFile(uri)
						reopenContent = new TextDecoder().decode(fileContentBytes)
					
					}
					catch (e) {
						if ((e as any).code === 'FileNotFound') {
							this.utils.warn(`File for closed document ${uriString} not found on re-open. Using last known content or empty.`)
							reopenContent = ''
						
						}
						else {
							throw e
						
						}
					
					}
				
				}
				doc = this.docService.openAndAddTextDocument(uri, reopenContent, language ?? doc.languageId, false)
			
			}
			return doc
		
		}

		if (content === undefined && uri.scheme !== 'untitled') {
			try {
				const fileContentBytes = await fs.readFile(uri)
				content = new TextDecoder().decode(fileContentBytes)
			
			}
			catch (e) {
				if ((e as any).code === 'FileNotFound' && uri.scheme === 'file') {
					this.utils.log(LogLevel.Debug, `File not found for ${uriString}, opening as empty placeholder.`)
					content = ''
				
				}
				else {
					this.utils.error(`Failed to read file content for ${uriString}:`, e)
					throw e
				
				}
			
			}
		
		}
		else if (content === undefined && uri.scheme === 'untitled') {
			content = ''
		
		}

		if (!language) {
			const ext = pathService.extname(uri.path).toLowerCase()
			switch (ext) {
				case '.ts': case '.tsx': language = 'typescript'; break
				case '.js': case '.jsx': language = 'javascript'; break
				case '.json': language = 'json'; break
				case '.py': language = 'python'; break
				case '.java': language = 'java'; break
				case '.cs': language = 'csharp'; break
				case '.html': language = 'html'; break
				case '.css': language = 'css'; break
				case '.md': language = 'markdown'; break
				default: language = 'plaintext'
			}
			this.utils.log(LogLevel.Trace, `Guessed languageId '${language}' for ${uriString}`)
		
		}

		const finalLanguage = language ?? 'plaintext'
		this.utils.log(LogLevel.Trace, 'Calling TextDocumentService.openAndAddTextDocument')
		const newDoc = this.docService.openAndAddTextDocument(uri, content ?? '', finalLanguage, false)
		return newDoc
	
	} //<

	/**
	 * @inheritdoc
	 */
	async saveAll(includeUntitled?: boolean, cancellation?: vt.CancellationToken): Promise<boolean> { //>
		this.utils.log(LogLevel.Info, `WorkspaceNamespace.saveAll called (includeUntitled: ${includeUntitled ?? false})`)
		let allSaved = true
		// const fs = this.fileSystemModule.fs // REMOVED
		const fs = this.fileSystemService // ADDED

		const documentsToSave = [...this.docService.getTextDocuments()]

		for (const doc of documentsToSave) {
			if (cancellation?.isCancellationRequested) {
				this.utils.log(LogLevel.Debug, 'WorkspaceNamespace.saveAll cancelled.')
				return false
			
			}

			if (!doc.isDirty) {
				this.utils.log(LogLevel.Trace, `Skipping save for clean document: ${doc.uri.toString()}`)
				continue
			
			}

			try {
				if (doc.isUntitled) {
					if (includeUntitled) {
						this.utils.log(LogLevel.Debug, `Marking untitled document as clean: ${doc.uri.toString()}`)
						await this.docService.save(doc as TextDocument)
					
					}
					else {
						this.utils.log(LogLevel.Trace, `Skipping save for untitled document (includeUntitled is false): ${doc.uri.toString()}`)
					
					}
				
				}
				else {
					this.utils.log(LogLevel.Debug, `Saving file document to VFS: ${doc.uri.toString()}`)
					const contentBytes = new TextEncoder().encode(doc.getText())
					await fs.writeFile(doc.uri, contentBytes, { create: true, overwrite: true })
				
				}
			
			}
			catch (e) {
				allSaved = false
				this.utils.error(`Error during save for document ${doc.uri.toString()}:`, e)
			
			}
		
		}
		return allSaved
	
	} //<

	/**
	 * @inheritdoc
	 */
	asRelativePath(pathOrUri: string | vt.Uri, includeWorkspaceFolder?: boolean): string { //>
		// const uriService = this.fileSystemModule.Uri // REMOVED
		// const pathService = this.fileSystemModule.path // REMOVED
		const uriService = this.uriService // ADDED
		const pathService = this.pathService // ADDED

		const uri = typeof pathOrUri === 'string'
			? uriService.file(pathOrUri)
			: uriService.parse(pathOrUri.toString()) // Ensure it's our Uri type if vt.Uri is passed

		const folder = this.wsService.getWorkspaceFolder(uri)
		if (!folder) {
			return uri.path // Or fsPath depending on desired output for non-workspace files
		
		}

		const normalizedFolderPath = pathService.normalize(folder.uri.path)
		const normalizedUriPath = pathService.normalize(uri.path)

		const relativePath = pathService.relative(normalizedFolderPath, normalizedUriPath)
		return includeWorkspaceFolder
			? pathService.join(folder.name, relativePath)
			: relativePath
	
	} //<

	/**
	 * @inheritdoc
	 */
	createFileSystemWatcher( //>
		globPattern: vt.GlobPattern,
		ignoreCreateEvents?: boolean,
		ignoreChangeEvents?: boolean,
		ignoreDeleteEvents?: boolean,
	): vt.FileSystemWatcher {
		this.utils.log(LogLevel.Info, `WorkspaceNamespace.createFileSystemWatcher for pattern: ${typeof globPattern === 'string' ? globPattern : globPattern.pattern}`)
		// const pathService = this.fileSystemModule.path // REMOVED
		const pathService = this.pathService // ADDED

		const _onDidCreateEmitter = new EventEmitter<nUri>()
		const _onDidChangeEmitter = new EventEmitter<nUri>()
		const _onDidDeleteEmitter = new EventEmitter<nUri>()
		const disposables: vt.Disposable[] = [
			_onDidCreateEmitter,
			_onDidChangeEmitter,
			_onDidDeleteEmitter,
		]

		let patternString: string
		let baseUri: nUri | undefined
		if (typeof globPattern === 'string') {
			patternString = globPattern
		
		}
		else {
			patternString = globPattern.pattern
			baseUri = globPattern.baseUri as nUri
		
		}

		const matchesGlob = (uri: nUri): boolean => {
			let testPath: string
			if (baseUri) {
				const normalizedBase = pathService.normalize(baseUri.path)
				const normalizedUri = pathService.normalize(uri.path)
				if (!normalizedUri.startsWith(normalizedBase))
					return false
				testPath = pathService.relative(normalizedBase, normalizedUri)
			
			}
			else {
				const folder = this.wsService.getWorkspaceFolder(uri)
				testPath = folder
					? pathService.relative(pathService.normalize(folder.uri.path), pathService.normalize(uri.path))
					: pathService.normalize(uri.path) // Fallback to full path if not in a workspace folder
			
			}
			const isMatch = micromatch.isMatch(testPath, patternString, { dot: true })
			this.utils.log(LogLevel.Trace, `Glob check: testPath='${testPath}', pattern='${patternString}', match=${isMatch}`)
			return isMatch
		
		}

		if (!ignoreCreateEvents) {
			const listener = this.eventBus.getOnDidCreateFilesEvent()((e) => {
				e.files.forEach((file) => {
					if (matchesGlob(file as nUri)) // Ensure Uri type for matchesGlob
						_onDidCreateEmitter.fire(file as nUri)

				})
			
			})
			disposables.push(listener)
		
		}
		if (!ignoreChangeEvents) {
			const saveListener = this.eventBus.getOnDidSaveTextDocumentEvent()((doc) => {
				if (matchesGlob(doc.uri as nUri)) // Ensure Uri type
					_onDidChangeEmitter.fire(doc.uri as nUri)
			
			})
			disposables.push(saveListener)
		
		}
		if (!ignoreDeleteEvents) {
			const listener = this.eventBus.getOnDidDeleteFilesEvent()((e) => {
				e.files.forEach((file) => {
					if (matchesGlob(file as nUri)) // Ensure Uri type
						_onDidDeleteEmitter.fire(file as nUri)

				})
			
			})
			disposables.push(listener)
		
		}

		return {
			ignoreCreateEvents: !!ignoreCreateEvents,
			ignoreChangeEvents: !!ignoreChangeEvents,
			ignoreDeleteEvents: !!ignoreDeleteEvents,
			onDidCreate: _onDidCreateEmitter.event,
			onDidChange: _onDidChangeEmitter.event,
			onDidDelete: _onDidDeleteEmitter.event,
			dispose: () => {
				this.utils.log(LogLevel.Debug, `Disposing FileSystemWatcher for pattern: ${typeof globPattern === 'string' ? globPattern : globPattern.pattern}`)
				disposables.forEach(d => d.dispose())
			
			},
		}
	
	} //<

	/**
	 * @inheritdoc
	 */
	getWorkspaceFolder(uri: vt.Uri): vt.WorkspaceFolder | undefined { //>
		return this.wsService.getWorkspaceFolder(uri)
	
	} //<

	/**
	 * @inheritdoc
	 */
	registerFileSystemProvider(scheme: string, _provider: vt.FileSystemProvider, _options?: { isCaseSensitive?: boolean, isReadonly?: boolean | ThemeColor | vt.MarkdownString }): Disposable { //>
		this.utils.warn(`WorkspaceNamespace.registerFileSystemProvider for scheme '${scheme}' not fully implemented`)
		return new Disposable(() => {})
	
	} //<

	/**
	 * @inheritdoc
	 */
	registerTaskProvider(type: string, _provider: vt.TaskProvider): vt.Disposable { //>
		this.utils.warn(`WorkspaceNamespace.registerTaskProvider for type '${type}' not implemented.`)
		return new Disposable(() => {})
	
	} //<

	/**
	 * @inheritdoc
	 */
	registerTextDocumentContentProvider(scheme: string, _provider: vt.TextDocumentContentProvider): vt.Disposable { //>
		this.utils.warn(`WorkspaceNamespace.registerTextDocumentContentProvider for '${scheme}' not fully implemented.`)
		return new Disposable(() => {})
	
	} //<

} //<