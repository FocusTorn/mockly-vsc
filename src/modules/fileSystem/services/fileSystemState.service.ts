// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, singleton, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import { URI as Uri } from 'vscode-uri'
import { LogLevel, FileType } from '../../../_vscCore/vscEnums.ts'
import type { FileSystemError } from '../../../_vscCore/vscFileSystemError.ts'

//= NODE JS ===================================================================================================
import { TextEncoder, TextDecoder } from 'util'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IFileSystemStateService, IVirtualFSNode, IAddNodeOptions, IPasteOptions } from '../_interfaces/IFileSystemStateService.ts' // Removed IFileSystemStructure, IFileSystemPopulateEntry
import type { IMockNodePathService } from '../../nodePath/_interfaces/IMockNodePathService.ts'
import type { IVfsTreeManagerService } from '../_interfaces/IVfsTreeManagerService.ts'

//--------------------------------------------------------------------------------------------------------------<<

interface InternalClipboard { //>
	node: IVirtualFSNode
	operation: 'copy' | 'cut'
} //<

@injectable()
@singleton()
export class FileSystemStateService implements IFileSystemStateService {

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Properties                                                                                      │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	private _clipboard: InternalClipboard | null = null
	private _textEncoder = new TextEncoder()
	private _textDecoder = new TextDecoder()

	constructor(
		@inject('IMockNodePathService') private pathService: IMockNodePathService,
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
		@inject('IVfsTreeManagerService') private vfsTreeManager: IVfsTreeManagerService,
	) {
		this.utils.log(LogLevel.Debug, 'FileSystemStateService (refactored) initialized.')
	
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Properties Accessors                                                                            │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	get rootNode(): IVirtualFSNode { //>
		return this.vfsTreeManager.getRootNode()
	
	} //<

	get clipboardNode(): IVirtualFSNode | null { //>
		return this._clipboard?.node ?? null
	
	} //<

	get clipboardOperation(): 'copy' | 'cut' | null { //>
		return this._clipboard?.operation ?? null
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Error Helpers (Contextual to FileSystemStateService)                                            │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	private _createFileNotFoundError(uri: Uri, message?: string): FileSystemError { //>
		this.utils.log(LogLevel.Trace, `VFSState: Creating FileNotFound error for: ${uri.toString()}`)
		return this.utils.createFileSystemError('FileNotFound', uri, message) as FileSystemError
	
	} //<

	private _createFileExistsError(uri: Uri, message?: string): FileSystemError { //>
		this.utils.log(LogLevel.Trace, `VFSState: Creating FileExists error for: ${uri.toString()}`)
		return this.utils.createFileSystemError('FileExists', uri, message) as FileSystemError
	
	} //<

	private _createNotADirectoryError(uri: Uri, message?: string): FileSystemError { //>
		this.utils.log(LogLevel.Trace, `VFSState: Creating FileNotADirectory error for: ${uri.toString()}`)
		return this.utils.createFileSystemError('FileNotADirectory', uri, message) as FileSystemError
	
	} //<

	private _createIsADirectoryError(uri: Uri, message?: string): FileSystemError { //>
		this.utils.log(LogLevel.Trace, `VFSState: Creating FileIsADirectory error for: ${uri.toString()}`)
		return this.utils.createFileSystemError('FileIsADirectory', uri, message) as FileSystemError
	
	} //<

	private _createNotAFileError(uri: Uri, message?: string): FileSystemError { //>
		this.utils.log(LogLevel.Trace, `VFSState: Creating NotAFile error for: ${uri.toString()}`)
		return this.utils.createFileSystemError('FileIsADirectory', uri, message || `Path is not a file: ${uri.toString()}`) as FileSystemError
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Path Utility                                                                                    │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	private _pathToUri(path: string | Uri): Uri { //>
		const posixPathUtil = this.pathService.posix
		if (typeof path === 'string') {
			const normalizedStrPath = posixPathUtil.normalize(path.replace(/\\/g, '/'))
			if (/^[a-z][a-z0-9+.-]*:/i.test(normalizedStrPath) && !normalizedStrPath.includes(posixPathUtil.sep)) {
				try {
					return Uri.parse(normalizedStrPath, true)
				
				}
				catch (e) {
					this.utils.warn(`VFSState: Failed to parse potential URI string '${normalizedStrPath}', assuming file path. Error: ${e}`)
					return Uri.file(normalizedStrPath)
				
				}
			
			}
			else {
				if (normalizedStrPath.includes(':') && !normalizedStrPath.startsWith(posixPathUtil.sep) && posixPathUtil.isAbsolute(normalizedStrPath.substring(normalizedStrPath.indexOf(':') + 1))) {
					try {
						return Uri.parse(normalizedStrPath, true)
					
					}
                    
					// eslint-disable-next-line unused-imports/no-unused-vars
					catch (e) {
						return Uri.file(normalizedStrPath)
					
					}
				
				}
				return Uri.file(normalizedStrPath)
			
			}
		
		}
		return path.with({ path: posixPathUtil.normalize(path.path) })
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods (Async)                                                                                 │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	async addFile(path: string | Uri, options?: IAddNodeOptions): Promise<IVirtualFSNode> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: addFile called for: ${uri.toString()}`)
		const parentNode = await this.vfsTreeManager.ensureParents(uri, options)
		const filename = this.pathService.posix.basename(uri.path)

		const existingNode = parentNode.children?.get(filename)

		if (existingNode) {
			if (existingNode.type === FileType.Directory) {
				throw this._createIsADirectoryError(uri)
			
			}
			this.utils.log(LogLevel.Trace, `VFSState: addFile overwriting existing file ${uri.toString()}`)
			let newContent: Uint8Array
			if (options?.content instanceof Uint8Array) {
				newContent = options.content
			
			}
			else if (typeof options?.content === 'string') {
				newContent = this._textEncoder.encode(options.content)
			
			}
			else {
				newContent = existingNode.content instanceof Uint8Array ? existingNode.content : this._textEncoder.encode(existingNode.content as string || '')
			
			}
			this.vfsTreeManager.updateFileContent(existingNode, newContent, options?.mtime)
			if (options?.ctime !== undefined)
				existingNode.ctime = options.ctime
			if (options?.birthtime !== undefined)
				existingNode.birthtime = options.birthtime
			if (options?.atime !== undefined)
				this.vfsTreeManager.updateAtime(existingNode, options.atime)
			if (options?.isRemote !== undefined)
				existingNode.isRemote = options.isRemote
			if (options?.inWorkspace !== undefined)
				existingNode.inWorkspace = options.inWorkspace
			return existingNode
		
		}
		else {
			this.utils.log(LogLevel.Trace, `VFSState: addFile creating new file ${uri.toString()}`)
			const newNode = this.vfsTreeManager.createFileNode(uri.path, parentNode, options)
			this.vfsTreeManager.addChildNode(parentNode, filename, newNode)
			this.vfsTreeManager.updateMtime(parentNode, newNode.mtime)
			return newNode
		
		}
	
	} //<

	async addFileBatch(files: Record<string, string | Uint8Array | IAddNodeOptions | undefined>): Promise<IVirtualFSNode[]> { //>
		const addedNodes: IVirtualFSNode[] = []
		for (const [path, contentOrOptions] of Object.entries(files)) {
			let options: IAddNodeOptions | undefined
			if (typeof contentOrOptions === 'string' || contentOrOptions instanceof Uint8Array) {
				options = { content: contentOrOptions }
			
			}
			else {
				options = contentOrOptions
			
			}
			try {
				const node = await this.addFile(path, options)
				addedNodes.push(node)
			
			}
			catch (e) {
				this.utils.error(`VFSState: Failed to add file in batch: ${path}`, e)
			
			}
		
		}
		return addedNodes
	
	} //<

	async addFolder(path: string | Uri, options?: IAddNodeOptions): Promise<IVirtualFSNode> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: addFolder called for: ${uri.toString()}`)
		const parentNode = await this.vfsTreeManager.ensureParents(uri, options)
		const dirname = this.pathService.posix.basename(uri.path)

		const existingNode = parentNode.children?.get(dirname)

		if (existingNode) {
			if (existingNode.type === FileType.File) {
				throw this._createNotADirectoryError(uri)
			
			}
			this.utils.log(LogLevel.Trace, `VFSState: addFolder - folder already exists ${uri.toString()}, updating metadata.`)
			const now = Date.now()
			if (options?.mtime !== undefined)
				this.vfsTreeManager.updateMtime(existingNode, options.mtime)
			if (options?.ctime !== undefined)
				existingNode.ctime = options.ctime
			if (options?.birthtime !== undefined)
				existingNode.birthtime = options.birthtime
			if (options?.atime !== undefined)
				this.vfsTreeManager.updateAtime(existingNode, options.atime)
			else this.vfsTreeManager.updateAtime(existingNode, now)
			if (options?.isRemote !== undefined)
				existingNode.isRemote = options.isRemote
			if (options?.inWorkspace !== undefined)
				existingNode.inWorkspace = options.inWorkspace
			return existingNode
		
		}
		else {
			this.utils.log(LogLevel.Trace, `VFSState: addFolder creating new folder ${uri.toString()}`)
			const newNode = this.vfsTreeManager.createDirectoryNode(uri.path, parentNode, options)
			this.vfsTreeManager.addChildNode(parentNode, dirname, newNode)
			this.vfsTreeManager.updateMtime(parentNode, newNode.mtime)
			return newNode
		
		}
	
	} //<

	async addFolderBatch(paths: (string | Uri)[]): Promise<IVirtualFSNode[]> { //>
		const addedNodes: IVirtualFSNode[] = []
		for (const path of paths) {
			try {
				const node = await this.addFolder(path, undefined)
				addedNodes.push(node)
			
			}
			catch (e) {
				this.utils.error(`VFSState: Failed to add folder in batch: ${path.toString()}`, e)
			
			}
		
		}
		return addedNodes
	
	} //<

	async readFile(path: string | Uri): Promise<Uint8Array> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: readFile called for: ${uri.toString()}`)
		const node = this.vfsTreeManager.findNode(uri)
		if (!node)
			throw this._createFileNotFoundError(uri)
		if (node.type !== FileType.File)
			throw this._createIsADirectoryError(uri)
		if (node.content === undefined) {
			this.utils.warn(`VFSState: File node missing content: ${uri.toString()}`)
			return new Uint8Array()
		
		}
		const content = (typeof node.content === 'string') ? this._textEncoder.encode(node.content) : node.content
		return content.slice(0)
	
	} //<

	async writeFile(path: string | Uri, content: Uint8Array, options?: IAddNodeOptions): Promise<void> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: writeFile called for: ${uri.toString()}`)
		await this.addFile(uri, { ...options, content })
	
	} //<

	async deleteFile(path: string | Uri, _options?: { useTrash?: boolean }): Promise<void> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: deleteFile called for: ${uri.toString()}`)
		const node = this.vfsTreeManager.findNode(uri, false)

		if (!node)
			throw this._createFileNotFoundError(uri)
		if (node.type !== FileType.File)
			throw this._createNotAFileError(uri)
		if (!node.parent)
			throw this.utils.createError(`Invariant violation: Node ${uri.toString()} has no parent.`)

		const filename = this.pathService.posix.basename(uri.path)
		this.vfsTreeManager.removeChildNode(node.parent, filename)
		this.vfsTreeManager.updateMtime(node.parent)
		this.utils.log(LogLevel.Trace, `VFSState: Successfully deleted file ${uri.toString()}`)
	
	} //<

	async deleteFolder(path: string | Uri, options?: { recursive?: boolean, useTrash?: boolean }): Promise<void> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: deleteFolder called for: ${uri.toString()}, recursive: ${options?.recursive}`)
		const node = this.vfsTreeManager.findNode(uri, false)

		if (!node)
			throw this._createFileNotFoundError(uri)
		if (node.type !== FileType.Directory)
			throw this._createNotADirectoryError(uri)
		if (node === this.vfsTreeManager.getRootNode())
			throw this.utils.createError('Cannot delete the root directory.')
		if (!node.parent)
			throw this.utils.createError(`Invariant violation: Node ${uri.toString()} has no parent.`)
		if (node.children && node.children.size > 0 && !options?.recursive) {
			throw this.utils.createError(`Directory not empty, requires recursive option: ${uri.toString()}`)
		
		}

		const dirname = this.pathService.posix.basename(uri.path)
		this.vfsTreeManager.removeChildNode(node.parent, dirname)
		this.vfsTreeManager.updateMtime(node.parent)
		this.utils.log(LogLevel.Trace, `VFSState: Successfully deleted folder ${uri.toString()}`)
	
	} //<

	async rename(oldPath: string | Uri, newPath: string | Uri, options?: { overwrite?: boolean }): Promise<void> { //>
		const oldUri = this._pathToUri(oldPath)
		const newUri = this._pathToUri(newPath)
		const overwrite = options?.overwrite ?? false
		this.utils.log(LogLevel.Trace, `VFSState: rename from ${oldUri.toString()} to ${newUri.toString()}, overwrite: ${overwrite}`)
		const posixPathUtil = this.pathService.posix

		const oldNormalizedPath = posixPathUtil.normalize(oldUri.path)
		const newNormalizedPath = posixPathUtil.normalize(newUri.path)

		if (oldNormalizedPath === newNormalizedPath) {
			this.utils.warn(`VFSState: rename - old and new paths are identical, doing nothing.`)
			return
		
		}
		if (newNormalizedPath.startsWith(oldNormalizedPath + posixPathUtil.sep)) {
			throw this.utils.createError(`Cannot move directory into itself: ${oldUri.toString()} to ${newUri.toString()}`)
		
		}

		const sourceNode = this.vfsTreeManager.findNode(oldUri, false)
		if (!sourceNode)
			throw this._createFileNotFoundError(oldUri)
		if (sourceNode === this.vfsTreeManager.getRootNode())
			throw this.utils.createError('Cannot rename the root directory.')
		if (!sourceNode.parent)
			throw this.utils.createError(`Invariant: Source node ${oldUri.toString()} has no parent.`)

		const oldParentNode = sourceNode.parent
		const oldName = posixPathUtil.basename(oldNormalizedPath)

		const newParentPath = posixPathUtil.dirname(newNormalizedPath)
		const newName = posixPathUtil.basename(newNormalizedPath)
		const newParentNode = await this.vfsTreeManager.ensureParents(newUri.with({ path: newParentPath }))

		if (newParentNode.type !== FileType.Directory) {
			throw this._createNotADirectoryError(newUri.with({ path: newParentPath }), `Target parent is not a directory: ${newParentPath}`)
		
		}

		const targetNode = newParentNode.children?.get(newName)
		if (targetNode) {
			if (!overwrite)
				throw this._createFileExistsError(newUri)
			if (targetNode === sourceNode) {
				this.utils.warn(`VFSState: rename - Target is same as source after normalization.`)
				this.vfsTreeManager.removeChildNode(oldParentNode, oldName)
				sourceNode.path = newNormalizedPath
				this.vfsTreeManager.addChildNode(newParentNode, newName, sourceNode)
			
			}
			else {
				if (sourceNode.type !== targetNode.type) {
					throw this.utils.createError(`Cannot overwrite ${targetNode.type === FileType.Directory ? 'directory' : 'file'} with ${sourceNode.type === FileType.Directory ? 'directory' : 'file'}`)
				
				}
				if (targetNode.type === FileType.Directory && targetNode.children && targetNode.children.size > 0) {
					throw this.utils.createError(`Cannot overwrite non-empty directory: ${newUri.toString()}`)
				
				}
				this.vfsTreeManager.removeChildNode(newParentNode, newName)
			
			}
		
		}

		if (targetNode !== sourceNode) {
			this.vfsTreeManager.removeChildNode(oldParentNode, oldName)
			sourceNode.path = newNormalizedPath
			this.vfsTreeManager.addChildNode(newParentNode, newName, sourceNode)
		
		}

		const now = Date.now()
		this.vfsTreeManager.updateMtime(sourceNode, now)
		this.vfsTreeManager.updateMtime(oldParentNode, now)
		if (oldParentNode !== newParentNode) {
			this.vfsTreeManager.updateMtime(newParentNode, now)
		
		}

		if (sourceNode.type === FileType.Directory) {
			this.vfsTreeManager.updateChildPathsRecursive(sourceNode)
		
		}
		this.utils.log(LogLevel.Trace, `VFSState: Successfully renamed ${oldUri.toString()} to ${newUri.toString()}`)
	
	} //<

	async readDirectory(path: string | Uri): Promise<[string, FileType][]> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: readDirectory called for: ${uri.toString()}`)
		const node = this.vfsTreeManager.findNode(uri)
		if (!node)
			throw this._createFileNotFoundError(uri)
		if (node.type !== FileType.Directory)
			throw this._createNotADirectoryError(uri)
		if (!node.children)
			return []

		const entries: [string, FileType][] = []
		for (const [name, child] of node.children.entries()) {
			entries.push([name, child.type])
		
		}
		return entries
	
	} //<

	async stat(path: string | Uri): Promise<vt.FileStat> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: stat called for: ${uri.toString()}`)
		const node = this.vfsTreeManager.findNode(uri)
		if (!node)
			throw this._createFileNotFoundError(uri)
		return { type: node.type, ctime: node.ctime, mtime: node.mtime, size: node.size }
	
	} //<

	async exists(path: string | Uri): Promise<boolean> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: exists called for: ${uri.toString()}`)
		return !!this.vfsTreeManager.findNode(uri, false)
	
	} //<

	async getNode(path: string | Uri): Promise<IVirtualFSNode | undefined> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: getNode called for: ${uri.toString()}`)
		return this.vfsTreeManager.findNode(uri)
	
	} //<

	async copy(path: string | Uri): Promise<void> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: copy called for: ${uri.toString()}`)
		const node = this.vfsTreeManager.findNode(uri, false)
		if (!node)
			throw this._createFileNotFoundError(uri)
		if (node === this.vfsTreeManager.getRootNode())
			throw this.utils.createError('Cannot copy the root directory.')
		await this.clearClipboard()
		this._clipboard = { node, operation: 'copy' }
		node.isCopied = true
	
	} //<

	async cut(path: string | Uri): Promise<void> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: cut called for: ${uri.toString()}`)
		const node = this.vfsTreeManager.findNode(uri, false)
		if (!node)
			throw this._createFileNotFoundError(uri)
		if (node === this.vfsTreeManager.getRootNode())
			throw this.utils.createError('Cannot cut the root directory.')
		await this.clearClipboard()
		this._clipboard = { node, operation: 'cut' }
		node.isCut = true
	
	} //<

	async paste(destinationDir: string | Uri, options?: IPasteOptions): Promise<IVirtualFSNode> { //>
		const destUri = this._pathToUri(destinationDir)
		const overwrite = options?.overwrite ?? false
		this.utils.log(LogLevel.Trace, `VFSState: paste into: ${destUri.toString()}, overwrite: ${overwrite}`)
		const posixPathUtil = this.pathService.posix

		if (!this._clipboard)
			throw this.utils.createError('Clipboard is empty.')
		const { node: sourceNodeOriginal, operation } = this._clipboard

		const destDirNode = this.vfsTreeManager.findNode(destUri, false)
		if (!destDirNode || destDirNode.type !== FileType.Directory)
			throw this._createNotADirectoryError(destUri)
		if (!destDirNode.children)
			throw this.utils.createError(`Invariant: Dest dir ${destUri.toString()} has no children map.`)

		const sourceName = posixPathUtil.basename(sourceNodeOriginal.path)
		const finalDestPath = posixPathUtil.join(destDirNode.path, sourceName)
		const finalDestUri = destUri.with({ path: finalDestPath })

		if (finalDestPath === sourceNodeOriginal.path
		  || (sourceNodeOriginal.type === FileType.Directory && finalDestPath.startsWith(sourceNodeOriginal.path + posixPathUtil.sep))) {
			throw this.utils.createError(`Cannot paste into itself or a subdirectory: ${sourceNodeOriginal.path} to ${finalDestPath}`)
		
		}

		const existingTargetInDest = destDirNode.children.get(sourceName)
		if (existingTargetInDest && !overwrite)
			throw this._createFileExistsError(finalDestUri)

		let resultingNode: IVirtualFSNode
		if (operation === 'copy') {
			this.utils.log(LogLevel.Trace, `VFSState: Pasting (copy) ${sourceNodeOriginal.path} into ${destDirNode.path}`)
			const clonedNode = this._cloneNodeRecursiveInternal(sourceNodeOriginal, destDirNode, sourceName)
			if (existingTargetInDest) {
				if (existingTargetInDest.type !== clonedNode.type)
					throw this.utils.createError('Type mismatch on overwrite.')
				// MODIFIED: Added explicit check for existingTargetInDest.children
				if (existingTargetInDest.type === FileType.Directory && existingTargetInDest.children && existingTargetInDest.children.size > 0) {
					throw this.utils.createError('Cannot overwrite non-empty directory.')
				
				}
				this.vfsTreeManager.removeChildNode(destDirNode, sourceName)
			
			}
			this.vfsTreeManager.addChildNode(destDirNode, sourceName, clonedNode)
			this.vfsTreeManager.updateMtime(destDirNode, clonedNode.mtime)
			resultingNode = clonedNode
		
		}
		else { // cut
			this.utils.log(LogLevel.Trace, `VFSState: Pasting (cut/move) ${sourceNodeOriginal.path} into ${destDirNode.path}`)
			await this.rename(sourceNodeOriginal.path, finalDestUri, { overwrite })
			const foundNode = this.vfsTreeManager.findNode(finalDestUri, false)
			if (!foundNode)
				throw this.utils.createError(`Paste (cut) failed: node not found at ${finalDestUri.toString()}`)
			resultingNode = foundNode
		
		}

		const originalClipboard = this._clipboard
		this._clipboard = null
		if (originalClipboard) {
			if (operation === 'copy' || sourceNodeOriginal !== resultingNode) {
				sourceNodeOriginal.isCut = false
				sourceNodeOriginal.isCopied = false
			
			}
		
		}
		return resultingNode
	
	} //<
	
	async clear(): Promise<void> { //>
		this.utils.log(LogLevel.Info, 'VFSState: Clearing FileSystemStateService...')
		this.vfsTreeManager.resetTree()
		await this.clearClipboard()
		this.utils.log(LogLevel.Debug, 'VFSState: FileSystemStateService clear complete.')
	
	} //<

	async clearClipboard(): Promise<void> { //>
		if (this._clipboard) {
			this._clipboard.node.isCut = false
			this._clipboard.node.isCopied = false
			this._clipboard = null
			this.utils.log(LogLevel.Trace, `VFSState: Clipboard cleared.`)
		
		}
	
	} //<

	async setInWorkspace(path: string | Uri, value: boolean, recursive: boolean = true): Promise<void> { //>
		const uri = this._pathToUri(path)
		const node = this.vfsTreeManager.findNode(uri, false)
		if (!node)
			throw this._createFileNotFoundError(uri)
		this._setFlagRecursiveInternal(node, 'inWorkspace', value, recursive)
	
	} //<

	async setIsRemote(path: string | Uri, value: boolean, recursive: boolean = true): Promise<void> { //>
		const uri = this._pathToUri(path)
		const node = this.vfsTreeManager.findNode(uri, false)
		if (!node)
			throw this._createFileNotFoundError(uri)
		this._setFlagRecursiveInternal(node, 'isRemote', value, recursive)
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods (Sync)                                                                                  │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	getNodeSync(path: string | Uri): IVirtualFSNode | undefined { //>
		const uri = this._pathToUri(path)
		return this.vfsTreeManager.findNode(uri)
	
	} //<

	existsSync(path: string | Uri): boolean { //>
		const uri = this._pathToUri(path)
		return !!this.vfsTreeManager.findNode(uri, false)
	
	} //<

	statSync(path: string | Uri): vt.FileStat { //>
		const uri = this._pathToUri(path)
		const node = this.vfsTreeManager.findNode(uri)
		if (!node)
			throw this._createFileNotFoundError(uri)
		return { type: node.type, ctime: node.ctime, mtime: node.mtime, size: node.size }
	
	} //<

	readFileSync(path: string | Uri): Uint8Array { //>
		const uri = this._pathToUri(path)
		const node = this.vfsTreeManager.findNode(uri)
		if (!node)
			throw this._createFileNotFoundError(uri)
		if (node.type !== FileType.File)
			throw this._createIsADirectoryError(uri)
		if (node.content === undefined)
			return new Uint8Array()
		const content = (typeof node.content === 'string') ? this._textEncoder.encode(node.content) : node.content
		return content.slice(0)
	
	} //<

	writeFileSync(path: string | Uri, content: Uint8Array, options?: IAddNodeOptions): IVirtualFSNode { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: writeFileSync called for: ${uri.toString()}`)
		const parentNode = this.vfsTreeManager.ensureParentsSync(uri, options)
		const filename = this.pathService.posix.basename(uri.path)

		const existingNode = parentNode.children?.get(filename)
		if (existingNode) {
			if (existingNode.type === FileType.Directory)
				throw this._createIsADirectoryError(uri)
			this.utils.log(LogLevel.Trace, `VFSState: writeFileSync overwriting existing file ${uri.toString()}`)
			this.vfsTreeManager.updateFileContent(existingNode, content, options?.mtime)
			if (options?.ctime !== undefined)
				existingNode.ctime = options.ctime
			if (options?.birthtime !== undefined)
				existingNode.birthtime = options.birthtime
			if (options?.atime !== undefined)
				this.vfsTreeManager.updateAtime(existingNode, options.atime)
			if (options?.isRemote !== undefined)
				existingNode.isRemote = options.isRemote
			if (options?.inWorkspace !== undefined)
				existingNode.inWorkspace = options.inWorkspace
			return existingNode
		
		}
		else {
			this.utils.log(LogLevel.Trace, `VFSState: writeFileSync creating new file ${uri.toString()}`)
			const creationOpts = { ...options, content }
			const newNode = this.vfsTreeManager.createFileNode(uri.path, parentNode, creationOpts)
			this.vfsTreeManager.addChildNode(parentNode, filename, newNode)
			this.vfsTreeManager.updateMtime(parentNode, newNode.mtime)
			return newNode
		
		}
	
	} //<

	addFolderSync(path: string | Uri, options?: IAddNodeOptions): IVirtualFSNode { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: addFolderSync called for: ${uri.toString()}`)
		const parentNode = this.vfsTreeManager.ensureParentsSync(uri, options)
		const dirname = this.pathService.posix.basename(uri.path)

		const existingNode = parentNode.children?.get(dirname)
		if (existingNode) {
			if (existingNode.type === FileType.File)
				throw this._createNotADirectoryError(uri)
			this.utils.log(LogLevel.Trace, `VFSState: addFolderSync - folder already exists ${uri.toString()}, updating metadata.`)
			const now = Date.now()
			if (options?.mtime !== undefined)
				this.vfsTreeManager.updateMtime(existingNode, options.mtime)
			if (options?.ctime !== undefined)
				existingNode.ctime = options.ctime
			if (options?.birthtime !== undefined)
				existingNode.birthtime = options.birthtime
			if (options?.atime !== undefined)
				this.vfsTreeManager.updateAtime(existingNode, options.atime)
			else this.vfsTreeManager.updateAtime(existingNode, now)
			if (options?.isRemote !== undefined)
				existingNode.isRemote = options.isRemote
			if (options?.inWorkspace !== undefined)
				existingNode.inWorkspace = options.inWorkspace
			return existingNode
		
		}
		else {
			this.utils.log(LogLevel.Trace, `VFSState: addFolderSync creating new folder ${uri.toString()}`)
			const newNode = this.vfsTreeManager.createDirectoryNode(uri.path, parentNode, options)
			this.vfsTreeManager.addChildNode(parentNode, dirname, newNode)
			this.vfsTreeManager.updateMtime(parentNode, newNode.mtime)
			return newNode
		
		}
	
	} //<

	readDirectorySync(path: string | Uri): [string, FileType][] { //>
		const uri = this._pathToUri(path)
		const node = this.vfsTreeManager.findNode(uri)
		if (!node)
			throw this._createFileNotFoundError(uri)
		if (node.type !== FileType.Directory)
			throw this._createNotADirectoryError(uri)
		if (!node.children)
			return []
		const entries: [string, FileType][] = []
		for (const [name, child] of node.children.entries()) {
			entries.push([name, child.type])
		
		}
		return entries
	
	} //<

	deleteFileSync(path: string | Uri, _options?: { useTrash?: boolean }): void { //>
		const uri = this._pathToUri(path)
		const node = this.vfsTreeManager.findNode(uri, false)
		if (!node)
			throw this._createFileNotFoundError(uri)
		if (node.type !== FileType.File)
			throw this._createNotAFileError(uri)
		if (!node.parent)
			throw this.utils.createError(`Invariant: Node ${uri.toString()} has no parent.`)
		const filename = this.pathService.posix.basename(uri.path)
		this.vfsTreeManager.removeChildNode(node.parent, filename)
		this.vfsTreeManager.updateMtime(node.parent)
	
	} //<

	deleteFolderSync(path: string | Uri, options?: { recursive?: boolean, useTrash?: boolean }): void { //>
		const uri = this._pathToUri(path)
		const node = this.vfsTreeManager.findNode(uri, false)
		if (!node)
			throw this._createFileNotFoundError(uri)
		if (node.type !== FileType.Directory)
			throw this._createNotADirectoryError(uri)
		if (node === this.vfsTreeManager.getRootNode())
			throw this.utils.createError('Cannot delete root.')
		if (!node.parent)
			throw this.utils.createError(`Invariant: Node ${uri.toString()} has no parent.`)
		if (node.children && node.children.size > 0 && !options?.recursive)
			throw this.utils.createError('Directory not empty.')
		const dirname = this.pathService.posix.basename(uri.path)
		this.vfsTreeManager.removeChildNode(node.parent, dirname)
		this.vfsTreeManager.updateMtime(node.parent)
	
	} //<

	renameSync(oldPath: string | Uri, newPath: string | Uri, options?: { overwrite?: boolean }): void { //>
		const oldUri = this._pathToUri(oldPath)
		const newUri = this._pathToUri(newPath)
		const overwrite = options?.overwrite ?? false
		this.utils.log(LogLevel.Trace, `VFSState: renameSync from ${oldUri.toString()} to ${newUri.toString()}, overwrite: ${overwrite}`)
		const posixPathUtil = this.pathService.posix

		const oldNormalizedPath = posixPathUtil.normalize(oldUri.path)
		const newNormalizedPath = posixPathUtil.normalize(newUri.path)

		if (oldNormalizedPath === newNormalizedPath)
			return
		if (newNormalizedPath.startsWith(oldNormalizedPath + posixPathUtil.sep))
			throw this.utils.createError('Cannot move into itself.')

		const sourceNode = this.vfsTreeManager.findNode(oldUri, false)
		if (!sourceNode)
			throw this._createFileNotFoundError(oldUri)
		if (sourceNode === this.vfsTreeManager.getRootNode())
			throw this.utils.createError('Cannot rename root.')
		if (!sourceNode.parent)
			throw this.utils.createError(`Invariant: Source node ${oldUri.toString()} has no parent.`)

		const oldParentNode = sourceNode.parent
		const oldName = posixPathUtil.basename(oldNormalizedPath)

		const newParentPath = posixPathUtil.dirname(newNormalizedPath)
		const newName = posixPathUtil.basename(newNormalizedPath)
		const newParentNode = this.vfsTreeManager.findNode(newUri.with({ path: newParentPath }), false)

		if (!newParentNode || newParentNode.type !== FileType.Directory) {
			throw this._createFileNotFoundError(newUri.with({ path: newParentPath }), `Target parent dir does not exist or not a dir: ${newParentPath}`)
		
		}

		const targetNode = newParentNode.children?.get(newName)
		if (targetNode) {
			if (!overwrite)
				throw this._createFileExistsError(newUri)
			if (targetNode === sourceNode)
				return
			if (sourceNode.type !== targetNode.type)
				throw this.utils.createError('Type mismatch on overwrite.')
			if (targetNode.type === FileType.Directory && targetNode.children && targetNode.children.size > 0)
				throw this.utils.createError('Cannot overwrite non-empty directory.')
			this.vfsTreeManager.removeChildNode(newParentNode, newName)
		
		}

		if (targetNode !== sourceNode) {
			this.vfsTreeManager.removeChildNode(oldParentNode, oldName)
			sourceNode.path = newNormalizedPath
			this.vfsTreeManager.addChildNode(newParentNode, newName, sourceNode)
		
		}
		else {
			this.vfsTreeManager.removeChildNode(oldParentNode, oldName)
			sourceNode.path = newNormalizedPath
			this.vfsTreeManager.addChildNode(newParentNode, newName, sourceNode)
		
		}

		const now = Date.now()
		this.vfsTreeManager.updateMtime(sourceNode, now)
		this.vfsTreeManager.updateMtime(oldParentNode, now)
		if (oldParentNode !== newParentNode)
			this.vfsTreeManager.updateMtime(newParentNode, now)

		if (sourceNode.type === FileType.Directory)
			this.vfsTreeManager.updateChildPathsRecursive(sourceNode)
	
	} //<

	// REMOVED: populateSync and populate methods

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal Helpers for Paste, Populate, and Metadata Flags                                        │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	private _cloneNodeRecursiveInternal(sourceNode: IVirtualFSNode, newParent: IVirtualFSNode, newName: string): IVirtualFSNode { //>
		const now = Date.now()
		const posixPathUtil = this.pathService.posix
		const clonedPath = posixPathUtil.normalize(posixPathUtil.join(newParent.path, newName))

		let clonedContent: Uint8Array | string | undefined
		if (sourceNode.content instanceof Uint8Array) {
			clonedContent = sourceNode.content.slice(0)
		
		}
		else {
			clonedContent = sourceNode.content
		
		}

		const addNodeOptions: IAddNodeOptions = {
			content: clonedContent,
			ctime: now,
			mtime: sourceNode.mtime,
			birthtime: now,
			atime: now,
			isRemote: sourceNode.isRemote,
			inWorkspace: sourceNode.inWorkspace,
		}

		const clonedNode = sourceNode.type === FileType.Directory
			? this.vfsTreeManager.createDirectoryNode(clonedPath, newParent, addNodeOptions)
			: this.vfsTreeManager.createFileNode(clonedPath, newParent, addNodeOptions)

		if (sourceNode.type === FileType.Directory && sourceNode.children) {
			if (!clonedNode.children)
				clonedNode.children = new Map()
			for (const [childName, childNode] of sourceNode.children.entries()) {
				const clonedChild = this._cloneNodeRecursiveInternal(childNode, clonedNode, childName)
				this.vfsTreeManager.addChildNode(clonedNode, childName, clonedChild)
			
			}
		
		}
		return clonedNode
	
	} //<

	private _setFlagRecursiveInternal(node: IVirtualFSNode, flagName: 'isRemote' | 'inWorkspace', value: boolean, recursive: boolean): void { //>
		(node as any)[flagName] = value
		if (recursive && node.type === FileType.Directory && node.children) {
			node.children.forEach(child => this._setFlagRecursiveInternal(child, flagName, value, recursive))
		
		}
	
	} //<

}
