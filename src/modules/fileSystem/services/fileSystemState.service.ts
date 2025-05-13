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
import type { IFileSystemStateService, IVirtualFSNode, IAddNodeOptions, IPasteOptions, IFileSystemStructure, IFileSystemPopulateEntry } from '../_interfaces/IFileSystemStateService.ts'
import type { IMockNodePathService } from '../_interfaces/IMockNodePathService.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Represents an internal clipboard state for copy/cut operations.
 */
interface InternalClipboard { //>
	node: IVirtualFSNode
	operation: 'copy' | 'cut'
} //<

/**
 * Manages the in-memory representation of the virtual file system state.
 * This service is an internal component used by the FileSystemModule.
 */
@injectable()
@singleton()
export class FileSystemStateService implements IFileSystemStateService {

	private _root: IVirtualFSNode
	private _clipboard: InternalClipboard | null = null
	private _textEncoder = new TextEncoder()
	private _textDecoder = new TextDecoder()

	constructor(
		@inject('IMockNodePathService') private pathService: IMockNodePathService,
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
	) {
		this._root = this._createDirectoryNodeInternal(this.pathService.sep, null) // Root has null parent
		this.utils.log(LogLevel.Debug, 'FileSystemStateService initialized.')
	
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Properties                                                                                      │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * @inheritdoc
	 */
	get rootNode(): IVirtualFSNode { //>
		return this._root
	
	} //<

	/**
	 * @inheritdoc
	 */
	get clipboardNode(): IVirtualFSNode | null { //>
		return this._clipboard?.node ?? null
	
	} //<

	/**
	 * @inheritdoc
	 */
	get clipboardOperation(): 'copy' | 'cut' | null { //>
		return this._clipboard?.operation ?? null
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods (Async)                                                                                 │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * @inheritdoc
	 */
	async addFile(path: string | Uri, options?: IAddNodeOptions): Promise<IVirtualFSNode> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: addFile called for: ${uri.toString()}`)
		const parentNode = await this._ensureParents(uri, options) // Async version
		const filename = this.pathService.basename(uri.path)

		if (!parentNode.children) {
			throw this.utils.createError(`Invariant violation: Parent node ${parentNode.path} has no children map after _ensureParents.`)
		
		}

		const existingNode = parentNode.children.get(filename)

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
			else if (existingNode.content instanceof Uint8Array) {
				newContent = existingNode.content
			
			}
			else if (typeof existingNode.content === 'string') {
				newContent = this._textEncoder.encode(existingNode.content)
			
			}
			else {
				newContent = new Uint8Array()
			
			}

			existingNode.content = newContent
			existingNode.size = newContent.byteLength
			existingNode.mtime = options?.mtime ?? Date.now()
			existingNode.ctime = options?.ctime ?? existingNode.ctime
			existingNode.birthtime = options?.birthtime ?? existingNode.birthtime
			existingNode.atime = options?.atime ?? Date.now()
			existingNode.isRemote = options?.isRemote ?? existingNode.isRemote
			existingNode.inWorkspace = options?.inWorkspace ?? existingNode.inWorkspace
			this._updateMtime(parentNode, existingNode.mtime)
			return existingNode
		
		}
		else {
			this.utils.log(LogLevel.Trace, `VFSState: addFile creating new file ${uri.toString()}`)
			const newNode = this._createFileNodeInternal(uri.path, parentNode, options)
			parentNode.children.set(filename, newNode)
			this._updateMtime(parentNode, newNode.mtime)
			return newNode
		
		}
	
	} //<

	/**
	 * @inheritdoc
	 */
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

	/**
	 * @inheritdoc
	 */
	async addFolder(path: string | Uri, options?: IAddNodeOptions): Promise<IVirtualFSNode> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: addFolder called for: ${uri.toString()}`)
		const parentNode = await this._ensureParents(uri, options) // Async version
		const dirname = this.pathService.basename(uri.path)

		if (!parentNode.children) {
			throw this.utils.createError(`Invariant violation: Parent node ${parentNode.path} has no children map after _ensureParents.`)
		
		}

		const existingNode = parentNode.children.get(dirname)

		if (existingNode) {
			if (existingNode.type === FileType.File) {
				throw this._createNotADirectoryError(uri)
			
			}
			this.utils.log(LogLevel.Trace, `VFSState: addFolder - folder already exists ${uri.toString()}, updating metadata.`)
			const now = Date.now()
			existingNode.mtime = options?.mtime ?? existingNode.mtime
			existingNode.ctime = options?.ctime ?? existingNode.ctime
			existingNode.birthtime = options?.birthtime ?? existingNode.birthtime
			existingNode.atime = options?.atime ?? now
			existingNode.isRemote = options?.isRemote ?? existingNode.isRemote
			existingNode.inWorkspace = options?.inWorkspace ?? existingNode.inWorkspace
			if (options?.mtime) {
				this._updateMtime(parentNode, options.mtime)
			
			}
			return existingNode
		
		}
		else {
			this.utils.log(LogLevel.Trace, `VFSState: addFolder creating new folder ${uri.toString()}`)
			const newNode = this._createDirectoryNodeInternal(uri.path, parentNode, options)
			parentNode.children.set(dirname, newNode)
			this._updateMtime(parentNode, newNode.mtime)
			return newNode
		
		}
	
	} //<

	/**
	 * @inheritdoc
	 */
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

	/**
	 * @inheritdoc
	 */
	async readFile(path: string | Uri): Promise<Uint8Array> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: readFile called for: ${uri.toString()}`)
		const node = this._findNode(uri) // Updates atime
		if (!node) {
			throw this._createFileNotFoundError(uri)
		
		}
		if (node.type !== FileType.File) {
			throw this._createIsADirectoryError(uri)
		
		}
		if (node.content === undefined) {
			this.utils.warn(`VFSState: File node missing content: ${uri.toString()}`)
			return new Uint8Array()
		
		}
		const content = (typeof node.content === 'string') ? this._textEncoder.encode(node.content) : node.content
		return content.slice(0) // Return a copy
	
	} //<

	/**
	 * @inheritdoc
	 */
	async writeFile(path: string | Uri, content: Uint8Array, options?: IAddNodeOptions): Promise<void> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: writeFile called for: ${uri.toString()}`)
		await this.addFile(uri, { ...options, content }) // addFile handles overwrite logic
	
	} //<

	/**
	 * @inheritdoc
	 */
	async deleteFile(path: string | Uri, _options?: { useTrash?: boolean }): Promise<void> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: deleteFile called for: ${uri.toString()}`)
		const node = this._findNode(uri, false)

		if (!node) {
			throw this._createFileNotFoundError(uri)
		
		}
		if (node.type !== FileType.File) {
			throw this._createNotAFileError(uri) // More specific than FileIsADirectory
		
		}
		if (!node.parent || !node.parent.children) {
			throw this.utils.createError(`Invariant violation: Node ${uri.toString()} has no parent or parent has no children map.`)
		
		}

		const filename = this.pathService.basename(uri.path)
		node.parent.children.delete(filename)
		this._updateMtime(node.parent)
		this.utils.log(LogLevel.Trace, `VFSState: Successfully deleted file ${uri.toString()}`)
	
	} //<

	/**
	 * @inheritdoc
	 */
	async deleteFolder(path: string | Uri, options?: { recursive?: boolean, useTrash?: boolean }): Promise<void> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: deleteFolder called for: ${uri.toString()}, recursive: ${options?.recursive}`)
		const node = this._findNode(uri, false)

		if (!node) {
			throw this._createFileNotFoundError(uri)
		
		}
		if (node.type !== FileType.Directory) {
			throw this._createNotADirectoryError(uri)
		
		}
		if (node === this._root) {
			throw this.utils.createError('Cannot delete the root directory.')
		
		}
		if (!node.parent || !node.parent.children) {
			throw this.utils.createError(`Invariant violation: Node ${uri.toString()} has no parent or parent has no children map.`)
		
		}
		if (node.children && node.children.size > 0 && !options?.recursive) {
			throw this.utils.createError(`Directory not empty, requires recursive option: ${uri.toString()}`)
		
		}

		const dirname = this.pathService.basename(uri.path)
		node.parent.children.delete(dirname)
		this._updateMtime(node.parent)
		this.utils.log(LogLevel.Trace, `VFSState: Successfully deleted folder ${uri.toString()}`)
	
	} //<

	/**
	 * @inheritdoc
	 */
	async rename(oldPath: string | Uri, newPath: string | Uri, options?: { overwrite?: boolean }): Promise<void> { //>
		const oldUri = this._pathToUri(oldPath)
		const newUri = this._pathToUri(newPath)
		const overwrite = options?.overwrite ?? false
		this.utils.log(LogLevel.Trace, `VFSState: rename called from ${oldUri.toString()} to ${newUri.toString()}, overwrite: ${overwrite}`)

		const oldNormalizedPath = this.pathService.normalize(oldUri.path)
		const newNormalizedPath = this.pathService.normalize(newUri.path)

		if (oldNormalizedPath === newNormalizedPath) {
			this.utils.warn(`VFSState: rename - old and new paths are identical, doing nothing.`)
			return
		
		}
		if (newNormalizedPath.startsWith(oldNormalizedPath + this.pathService.sep)) {
			throw this.utils.createError(`Cannot move directory into itself: ${oldUri.toString()} to ${newUri.toString()}`)
		
		}

		const sourceNode = this._findNode(oldUri, false)
		if (!sourceNode) {
			throw this._createFileNotFoundError(oldUri)
		
		}
		if (sourceNode === this._root) {
			throw this.utils.createError('Cannot rename the root directory.')
		
		}
		if (!sourceNode.parent || !sourceNode.parent.children) {
			throw this.utils.createError(`Invariant violation: Source node ${oldUri.toString()} has no parent or parent has no children map.`)
		
		}

		const oldParentNode = sourceNode.parent
		const oldName = this.pathService.basename(oldNormalizedPath)

		const newParentPath = this.pathService.dirname(newNormalizedPath)
		const newName = this.pathService.basename(newNormalizedPath)
		const newParentUri = newUri.with({ path: newParentPath })
		const newParentNode = this._findNode(newParentUri, false)

		if (!newParentNode || newParentNode.type !== FileType.Directory) {
			// If new parent doesn't exist, create it (as rename can move across directories)
			// This part was missing in the original async logic if we interpret rename strictly as POSIX mv
			// However, for a user-friendly mock, creating parent might be acceptable.
			// For now, let's stick to throwing if parent doesn't exist, similar to how _ensureParents works.
			// To allow creation, we'd call _ensureParentsSync here.
			throw this._createFileNotFoundError(newParentUri, `Target parent directory does not exist: ${newParentUri.toString()}`)
		
		}
		if (!newParentNode.children) {
			throw this.utils.createError(`Invariant violation: Target parent node ${newParentUri.toString()} has no children map.`)
		
		}

		const targetNode = newParentNode.children.get(newName)

		if (targetNode) {
			if (!overwrite) {
				throw this._createFileExistsError(newUri)
			
			}
			if (targetNode === sourceNode) {
				this.utils.warn(`VFSState: rename - Target is the same as source after normalization, doing nothing.`)
				return
			
			}
			if (sourceNode.type !== targetNode.type) {
				throw this.utils.createError(`Cannot overwrite ${targetNode.type === FileType.Directory ? 'directory' : 'file'} with ${sourceNode.type === FileType.Directory ? 'directory' : 'file'}`)
			
			}
			if (targetNode.type === FileType.Directory && targetNode.children && targetNode.children.size > 0) {
				throw this.utils.createError(`Cannot overwrite non-empty directory: ${newUri.toString()}`)
			
			}
			newParentNode.children.delete(newName)
			this.utils.log(LogLevel.Trace, `VFSState: rename - Overwrote target node ${newUri.toString()}`)
		
		}

		oldParentNode.children?.delete(oldName)
		sourceNode.parent = newParentNode
		sourceNode.path = newNormalizedPath
		newParentNode.children.set(newName, sourceNode)

		const now = Date.now()
		this._updateMtime(sourceNode, now) // Update source node's mtime
		this._updateMtime(oldParentNode, now)
		if (oldParentNode !== newParentNode) {
			this._updateMtime(newParentNode, now)
		
		}

		if (sourceNode.type === FileType.Directory) {
			this._updateChildPathsRecursive(sourceNode)
		
		}
		this.utils.log(LogLevel.Trace, `VFSState: Successfully renamed ${oldUri.toString()} to ${newUri.toString()}`)
	
	} //<

	/**
	 * @inheritdoc
	 */
	async readDirectory(path: string | Uri): Promise<[string, FileType][]> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: readDirectory called for: ${uri.toString()}`)
		const node = this._findNode(uri)
		if (!node) {
			throw this._createFileNotFoundError(uri)
		
		}
		if (node.type !== FileType.Directory) {
			throw this._createNotADirectoryError(uri)
		
		}
		if (!node.children) {
			this.utils.warn(`VFSState: Directory node missing children map: ${uri.toString()}`)
			return []
		
		}

		const entries: [string, FileType][] = []
		for (const [name, child] of node.children.entries()) {
			entries.push([name, child.type])
		
		}
		this.utils.log(LogLevel.Trace, `VFSState: readDirectory returning ${entries.length} entries for: ${uri.toString()}`)
		return entries
	
	} //<

	/**
	 * @inheritdoc
	 */
	async stat(path: string | Uri): Promise<vt.FileStat> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: stat called for: ${uri.toString()}`)
		const node = this._findNode(uri)
		if (!node) {
			throw this._createFileNotFoundError(uri)
		
		}
		this.utils.log(LogLevel.Trace, `VFSState: stat found node at: ${node.path}, type: ${node.type}`)
		return {
			type: node.type,
			ctime: node.ctime,
			mtime: node.mtime,
			size: node.size,
		}
	
	} //<

	/**
	 * @inheritdoc
	 */
	async exists(path: string | Uri): Promise<boolean> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: exists called for: ${uri.toString()}`)
		const node = this._findNode(uri, false)
		return !!node
	
	} //<

	/**
	 * @inheritdoc
	 */
	async getNode(path: string | Uri): Promise<IVirtualFSNode | undefined> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: getNode called for: ${uri.toString()}`)
		return this._findNode(uri)
	
	} //<

	/**
	 * @inheritdoc
	 */
	async copy(path: string | Uri): Promise<void> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: copy called for: ${uri.toString()}`)
		const node = this._findNode(uri, false)
		if (!node) {
			throw this._createFileNotFoundError(uri)
		
		}
		if (node === this._root) {
			throw this.utils.createError('Cannot copy the root directory.')
		
		}
		await this.clearClipboard()
		this._clipboard = { node, operation: 'copy' }
		node.isCopied = true
		this.utils.log(LogLevel.Trace, `VFSState: Node copied to clipboard: ${uri.toString()}`)
	
	} //<

	/**
	 * @inheritdoc
	 */
	async cut(path: string | Uri): Promise<void> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: cut called for: ${uri.toString()}`)
		const node = this._findNode(uri, false)
		if (!node) {
			throw this._createFileNotFoundError(uri)
		
		}
		if (node === this._root) {
			throw this.utils.createError('Cannot cut the root directory.')
		
		}
		await this.clearClipboard()
		this._clipboard = { node, operation: 'cut' }
		node.isCut = true
		this.utils.log(LogLevel.Trace, `VFSState: Node marked for cut: ${uri.toString()}`)
	
	} //<

	/**
	 * @inheritdoc
	 */
	async paste(destinationDir: string | Uri, options?: IPasteOptions): Promise<IVirtualFSNode> { //>
		const destUri = this._pathToUri(destinationDir)
		const overwrite = options?.overwrite ?? false
		this.utils.log(LogLevel.Trace, `VFSState: paste called into: ${destUri.toString()}, overwrite: ${overwrite}`)

		if (!this._clipboard) {
			throw this.utils.createError('Clipboard is empty.')
		
		}

		const sourceNode = this._clipboard.node
		const operation = this._clipboard.operation

		const destDirNode = this._findNode(destUri, false)
		if (!destDirNode) {
			throw this._createFileNotFoundError(destUri)
		
		}
		if (destDirNode.type !== FileType.Directory) {
			throw this._createNotADirectoryError(destUri)
		
		}
		if (!destDirNode.children) {
			throw this.utils.createError(`Invariant violation: Destination directory ${destUri.toString()} has no children map.`)
		
		}

		const sourceName = this.pathService.basename(sourceNode.path)
		const finalDestPath = this.pathService.join(destDirNode.path, sourceName)
		const finalDestUri = destUri.with({ path: finalDestPath })

		if (finalDestPath === sourceNode.path || finalDestPath.startsWith(sourceNode.path + this.pathService.sep)) {
			throw this.utils.createError(`Cannot paste into itself or a subdirectory of itself: ${sourceNode.path} to ${finalDestPath}`)
		
		}

		const existingTarget = destDirNode.children.get(sourceName)
		if (existingTarget && !overwrite) {
			throw this._createFileExistsError(finalDestUri)
		
		}

		let resultingNode: IVirtualFSNode

		if (operation === 'copy') {
			this.utils.log(LogLevel.Trace, `VFSState: Pasting (copy) ${sourceNode.path} into ${destDirNode.path}`)
			const clonedNode = this._cloneNodeRecursive(sourceNode, destDirNode, sourceName)
			if (existingTarget) {
				if (existingTarget.type !== clonedNode.type) {
					throw this.utils.createError(`Cannot overwrite ${existingTarget.type === FileType.Directory ? 'directory' : 'file'} with ${clonedNode.type === FileType.Directory ? 'directory' : 'file'}`)
				
				}
				if (existingTarget.type === FileType.Directory && existingTarget.children && existingTarget.children.size > 0) {
					throw this.utils.createError(`Cannot overwrite non-empty directory: ${finalDestUri.toString()}`)
				
				}
				destDirNode.children.delete(sourceName)
			
			}
			destDirNode.children.set(sourceName, clonedNode)
			this._updateMtime(destDirNode, clonedNode.mtime)
			resultingNode = clonedNode
		
		}
		else { // operation === 'cut'
			this.utils.log(LogLevel.Trace, `VFSState: Pasting (cut/move) ${sourceNode.path} into ${destDirNode.path}`)
			// For cut, we use the rename logic.
			await this.rename(sourceNode.path, finalDestUri, { overwrite }) // rename is async
			const foundNode = this._findNode(finalDestUri, false) // _findNode is sync
			if (!foundNode) { // Should always be found after a successful rename
				throw this.utils.createError(`Paste (cut) failed: node not found at new location ${finalDestUri.toString()}`)
			
			}
			resultingNode = foundNode
		
		}

		const originalClipboard = this._clipboard
		this._clipboard = null
		if (originalClipboard) {
			originalClipboard.node.isCut = false
			originalClipboard.node.isCopied = false
		
		}
		this.utils.log(LogLevel.Trace, `VFSState: Paste successful, result node path: ${resultingNode.path}`)
		return resultingNode
	
	} //<

	/**
	 * @inheritdoc
	 */
	async clear(): Promise<void> { //>
		this.utils.log(LogLevel.Info, 'VFSState: Clearing VirtualFileSystemService...')
		this._root = this._createDirectoryNodeInternal(this.pathService.sep, null)
		await this.clearClipboard()
		this.utils.log(LogLevel.Debug, 'VFSState: VirtualFileSystemService clear complete.')
	
	} //<

	/**
	 * @inheritdoc
	 */
	async clearClipboard(): Promise<void> { //>
		if (this._clipboard) {
			this._clipboard.node.isCut = false
			this._clipboard.node.isCopied = false
			this._clipboard = null
			this.utils.log(LogLevel.Trace, `VFSState: Clipboard cleared.`)
		
		}
	
	} //<

	/**
	 * @inheritdoc
	 */
	async setInWorkspace(path: string | Uri, value: boolean, recursive: boolean = true): Promise<void> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: setInWorkspace called for: ${uri.toString()}, value: ${value}, recursive: ${recursive}`)
		const node = this._findNode(uri, false)
		if (!node) {
			throw this._createFileNotFoundError(uri)
		
		}
		function setFlagRecursive(n: IVirtualFSNode) {
			n.inWorkspace = value
			if (recursive && n.type === FileType.Directory && n.children) {
				n.children.forEach(setFlagRecursive)
			
			}
		
		}
		setFlagRecursive(node)
	
	} //<

	/**
	 * @inheritdoc
	 */
	async setIsRemote(path: string | Uri, value: boolean, recursive: boolean = true): Promise<void> { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: setIsRemote called for: ${uri.toString()}, value: ${value}, recursive: ${recursive}`)
		const node = this._findNode(uri, false)
		if (!node) {
			throw this._createFileNotFoundError(uri)
		
		}
		function setFlagRecursive(n: IVirtualFSNode) {
			n.isRemote = value
			if (recursive && n.type === FileType.Directory && n.children) {
				n.children.forEach(setFlagRecursive)
			
			}
		
		}
		setFlagRecursive(node)
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods (Sync)                                                                                  │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	getNodeSync(path: string | Uri): IVirtualFSNode | undefined { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: getNodeSync called for: ${uri.toString()}`)
		return this._findNode(uri) // _findNode is already synchronous
	
	} //<

	existsSync(path: string | Uri): boolean { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: existsSync called for: ${uri.toString()}`)
		const node = this._findNode(uri, false) // Don't update atime for exists check
		return !!node
	
	} //<

	statSync(path: string | Uri): vt.FileStat { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: statSync called for: ${uri.toString()}`)
		const node = this._findNode(uri) // Updates atime
		if (!node) {
			throw this._createFileNotFoundError(uri)
		
		}
		this.utils.log(LogLevel.Trace, `VFSState: statSync found node at: ${node.path}, type: ${node.type}`)
		return {
			type: node.type,
			ctime: node.ctime,
			mtime: node.mtime,
			size: node.size,
		}
	
	} //<

	readFileSync(path: string | Uri): Uint8Array { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: readFileSync called for: ${uri.toString()}`)
		const node = this._findNode(uri) // Updates atime
		if (!node) {
			throw this._createFileNotFoundError(uri)
		
		}
		if (node.type !== FileType.File) {
			throw this._createIsADirectoryError(uri)
		
		}
		if (node.content === undefined) {
			this.utils.warn(`VFSState: File node missing content (readFileSync): ${uri.toString()}`)
			return new Uint8Array()
		
		}
		const content = (typeof node.content === 'string') ? this._textEncoder.encode(node.content) : node.content
		return content.slice(0) // Return a copy
	
	} //<

	writeFileSync(path: string | Uri, content: Uint8Array, options?: IAddNodeOptions): IVirtualFSNode { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: writeFileSync called for: ${uri.toString()}`)

		// Effectively, this is addFileSync logic
		const parentNode = this._ensureParentsSync(uri, options)
		const filename = this.pathService.basename(uri.path)

		if (!parentNode.children) {
			throw this.utils.createError(`Invariant violation: Parent node ${parentNode.path} has no children map after _ensureParentsSync.`)
		
		}

		const existingNode = parentNode.children.get(filename)

		if (existingNode) {
			if (existingNode.type === FileType.Directory) {
				throw this._createIsADirectoryError(uri)
			
			}
			this.utils.log(LogLevel.Trace, `VFSState: writeFileSync overwriting existing file ${uri.toString()}`)
			existingNode.content = content // Directly use provided Uint8Array
			existingNode.size = content.byteLength
			existingNode.mtime = options?.mtime ?? Date.now()
			existingNode.ctime = options?.ctime ?? existingNode.ctime // Preserve original ctime if not specified
			existingNode.birthtime = options?.birthtime ?? existingNode.birthtime // Preserve original birthtime
			existingNode.atime = options?.atime ?? Date.now()
			existingNode.isRemote = options?.isRemote ?? existingNode.isRemote
			existingNode.inWorkspace = options?.inWorkspace ?? existingNode.inWorkspace
			this._updateMtime(parentNode, existingNode.mtime)
			return existingNode
		
		}
		else {
			this.utils.log(LogLevel.Trace, `VFSState: writeFileSync creating new file ${uri.toString()}`)
			// Create new options object for _createFileNodeInternal to avoid mutating input `options`
			const creationOptions: IAddNodeOptions = { ...options, content }
			const newNode = this._createFileNodeInternal(uri.path, parentNode, creationOptions)
			parentNode.children.set(filename, newNode)
			this._updateMtime(parentNode, newNode.mtime)
			return newNode
		
		}
	
	} //<

	addFolderSync(path: string | Uri, options?: IAddNodeOptions): IVirtualFSNode { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: addFolderSync called for: ${uri.toString()}`)
		const parentNode = this._ensureParentsSync(uri, options)
		const dirname = this.pathService.basename(uri.path)

		if (!parentNode.children) {
			throw this.utils.createError(`Invariant violation: Parent node ${parentNode.path} has no children map after _ensureParentsSync.`)
		
		}

		const existingNode = parentNode.children.get(dirname)

		if (existingNode) {
			if (existingNode.type === FileType.File) {
				throw this._createNotADirectoryError(uri)
			
			}
			this.utils.log(LogLevel.Trace, `VFSState: addFolderSync - folder already exists ${uri.toString()}, updating metadata.`)
			const now = Date.now()
			existingNode.mtime = options?.mtime ?? existingNode.mtime
			existingNode.ctime = options?.ctime ?? existingNode.ctime
			existingNode.birthtime = options?.birthtime ?? existingNode.birthtime
			existingNode.atime = options?.atime ?? now
			existingNode.isRemote = options?.isRemote ?? existingNode.isRemote
			existingNode.inWorkspace = options?.inWorkspace ?? existingNode.inWorkspace
			if (options?.mtime) {
				this._updateMtime(parentNode, options.mtime)
			
			}
			return existingNode
		
		}
		else {
			this.utils.log(LogLevel.Trace, `VFSState: addFolderSync creating new folder ${uri.toString()}`)
			const newNode = this._createDirectoryNodeInternal(uri.path, parentNode, options)
			parentNode.children.set(dirname, newNode)
			this._updateMtime(parentNode, newNode.mtime)
			return newNode
		
		}
	
	} //<

	readDirectorySync(path: string | Uri): [string, FileType][] { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: readDirectorySync called for: ${uri.toString()}`)
		const node = this._findNode(uri) // Updates atime
		if (!node) {
			throw this._createFileNotFoundError(uri)
		
		}
		if (node.type !== FileType.Directory) {
			throw this._createNotADirectoryError(uri)
		
		}
		if (!node.children) {
			this.utils.warn(`VFSState: Directory node missing children map (readDirectorySync): ${uri.toString()}`)
			return []
		
		}

		const entries: [string, FileType][] = []
		for (const [name, child] of node.children.entries()) {
			entries.push([name, child.type])
		
		}
		this.utils.log(LogLevel.Trace, `VFSState: readDirectorySync returning ${entries.length} entries for: ${uri.toString()}`)
		return entries
	
	} //<

	deleteFileSync(path: string | Uri, _options?: { useTrash?: boolean }): void { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: deleteFileSync called for: ${uri.toString()}`)
		const node = this._findNode(uri, false) // Don't update atime if it's about to be deleted

		if (!node) {
			throw this._createFileNotFoundError(uri)
		
		}
		if (node.type !== FileType.File) {
			throw this._createNotAFileError(uri)
		
		}
		if (!node.parent || !node.parent.children) {
			throw this.utils.createError(`Invariant violation: Node ${uri.toString()} has no parent or parent has no children map.`)
		
		}

		const filename = this.pathService.basename(uri.path)
		node.parent.children.delete(filename)
		this._updateMtime(node.parent)
		this.utils.log(LogLevel.Trace, `VFSState: Successfully deleted file (sync) ${uri.toString()}`)
	
	} //<

	deleteFolderSync(path: string | Uri, options?: { recursive?: boolean, useTrash?: boolean }): void { //>
		const uri = this._pathToUri(path)
		this.utils.log(LogLevel.Trace, `VFSState: deleteFolderSync called for: ${uri.toString()}, recursive: ${options?.recursive}`)
		const node = this._findNode(uri, false)

		if (!node) {
			throw this._createFileNotFoundError(uri)
		
		}
		if (node.type !== FileType.Directory) {
			throw this._createNotADirectoryError(uri)
		
		}
		if (node === this._root) {
			throw this.utils.createError('Cannot delete the root directory.')
		
		}
		if (!node.parent || !node.parent.children) {
			throw this.utils.createError(`Invariant violation: Node ${uri.toString()} has no parent or parent has no children map.`)
		
		}
		if (node.children && node.children.size > 0 && !options?.recursive) {
			throw this.utils.createError(`Directory not empty, requires recursive option: ${uri.toString()}`)
		
		}

		const dirname = this.pathService.basename(uri.path)
		node.parent.children.delete(dirname)
		this._updateMtime(node.parent)
		this.utils.log(LogLevel.Trace, `VFSState: Successfully deleted folder (sync) ${uri.toString()}`)
	
	} //<

	renameSync(oldPath: string | Uri, newPath: string | Uri, options?: { overwrite?: boolean }): void { //>
		const oldUri = this._pathToUri(oldPath)
		const newUri = this._pathToUri(newPath)
		const overwrite = options?.overwrite ?? false
		this.utils.log(LogLevel.Trace, `VFSState: renameSync called from ${oldUri.toString()} to ${newUri.toString()}, overwrite: ${overwrite}`)

		const oldNormalizedPath = this.pathService.normalize(oldUri.path)
		const newNormalizedPath = this.pathService.normalize(newUri.path)

		if (oldNormalizedPath === newNormalizedPath) {
			this.utils.warn(`VFSState: renameSync - old and new paths are identical, doing nothing.`)
			return
		
		}
		if (newNormalizedPath.startsWith(oldNormalizedPath + this.pathService.sep)) {
			throw this.utils.createError(`Cannot move directory into itself: ${oldUri.toString()} to ${newUri.toString()}`)
		
		}

		const sourceNode = this._findNode(oldUri, false)
		if (!sourceNode) {
			throw this._createFileNotFoundError(oldUri)
		
		}
		if (sourceNode === this._root) {
			throw this.utils.createError('Cannot rename the root directory.')
		
		}
		if (!sourceNode.parent || !sourceNode.parent.children) {
			throw this.utils.createError(`Invariant violation: Source node ${oldUri.toString()} has no parent or parent has no children map.`)
		
		}

		const oldParentNode = sourceNode.parent
		const oldName = this.pathService.basename(oldNormalizedPath)

		// For renameSync, the target parent directory must exist. We don't create it.
		const newParentPath = this.pathService.dirname(newNormalizedPath)
		const newName = this.pathService.basename(newNormalizedPath)
		const newParentUri = newUri.with({ path: newParentPath })
		const newParentNode = this._findNode(newParentUri, false)

		if (!newParentNode || newParentNode.type !== FileType.Directory) {
			throw this._createFileNotFoundError(newParentUri, `Target parent directory does not exist or is not a directory: ${newParentUri.toString()}`)
		
		}
		if (!newParentNode.children) {
			throw this.utils.createError(`Invariant violation: Target parent node ${newParentUri.toString()} has no children map.`)
		
		}

		const targetNode = newParentNode.children.get(newName)

		if (targetNode) {
			if (!overwrite) {
				throw this._createFileExistsError(newUri)
			
			}
			if (targetNode === sourceNode) {
				this.utils.warn(`VFSState: renameSync - Target is the same as source after normalization, doing nothing.`)
				return
			
			}
			if (sourceNode.type !== targetNode.type) {
				throw this.utils.createError(`Cannot overwrite ${targetNode.type === FileType.Directory ? 'directory' : 'file'} with ${sourceNode.type === FileType.Directory ? 'directory' : 'file'}`)
			
			}
			if (targetNode.type === FileType.Directory && targetNode.children && targetNode.children.size > 0) {
				// For sync rename, Node.js fs.renameSync would throw ENOTEMPTY or EPERM/EISDIR depending on OS
				// if trying to overwrite a non-empty directory with a file, or vice-versa.
				// If overwriting a non-empty dir with another dir, it might also fail.
				// Let's simplify to "cannot overwrite non-empty directory".
				throw this.utils.createError(`Cannot overwrite non-empty directory: ${newUri.toString()}`)
			
			}
			newParentNode.children.delete(newName)
			this.utils.log(LogLevel.Trace, `VFSState: renameSync - Overwrote target node ${newUri.toString()}`)
		
		}

		oldParentNode.children?.delete(oldName)
		sourceNode.parent = newParentNode
		sourceNode.path = newNormalizedPath // Update the node's own path
		newParentNode.children.set(newName, sourceNode)

		const now = Date.now()
		this._updateMtime(sourceNode, now) // Update source node's mtime
		this._updateMtime(oldParentNode, now)
		if (oldParentNode !== newParentNode) {
			this._updateMtime(newParentNode, now)
		
		}

		// If it was a directory, update paths of all its children recursively
		if (sourceNode.type === FileType.Directory) {
			this._updateChildPathsRecursive(sourceNode)
		
		}
		this.utils.log(LogLevel.Trace, `VFSState: Successfully renamed (sync) ${oldUri.toString()} to ${newUri.toString()}`)
	
	} //<

	populateSync(structure: IFileSystemStructure): void { //>
		this.utils.log(LogLevel.Info, `VFSState: populateSync called with ${Object.keys(structure).length} entries.`)
		// Sort paths to attempt directory creation before files within them,
		// although addFolderSync and writeFileSync handle parent creation.
		// Sorting by length is a simple heuristic.
		const sortedPaths = Object.keys(structure).sort((a, b) => a.length - b.length)

		for (const rawPath of sortedPaths) {
			try {
				const normalizedPath = this.pathService.normalize(rawPath.replace(/\\/g, '/'))
				const entryValue = structure[rawPath]

				if (entryValue === null) {
					// Explicit directory
					this.addFolderSync(normalizedPath)
				}
				else if (typeof entryValue === 'string') {
					// File with string content
					const contentUint8Array = this._textEncoder.encode(entryValue)
					this.writeFileSync(normalizedPath, contentUint8Array)
				}
				else if (entryValue instanceof Uint8Array) {
					// File with Uint8Array content
					this.writeFileSync(normalizedPath, entryValue)
				}
				else if (typeof entryValue === 'object' && entryValue !== null) {
					// IFileSystemPopulateEntry
					const populateEntry = entryValue as IFileSystemPopulateEntry
					const addNodeOptions: IAddNodeOptions = {}
					let isDirectory = false

					if (populateEntry.content === undefined) {
						isDirectory = true // No content implies directory for IFileSystemPopulateEntry
					}

					if (populateEntry.content !== undefined) {
						addNodeOptions.content = populateEntry.content
					}
					// TODO: Add mtime, ctime from populateEntry to addNodeOptions if they exist

					if (isDirectory) {
						this.addFolderSync(normalizedPath, addNodeOptions)
					}
					else {
						let contentUint8Array: Uint8Array
						if (addNodeOptions.content instanceof Uint8Array) {
							contentUint8Array = addNodeOptions.content
						}
						else if (typeof addNodeOptions.content === 'string') {
							contentUint8Array = this._textEncoder.encode(addNodeOptions.content)
						}
						else {
							contentUint8Array = new Uint8Array() // Default to empty if somehow still undefined
						}
						this.writeFileSync(normalizedPath, contentUint8Array, addNodeOptions)
					}
				}
				else {
					this.utils.warn(`VFSState: populateSync - Skipping unknown entry type for path: ${rawPath}`)
				}
			}
			catch (e) {
				this.utils.error(`VFSState: populateSync - Error processing path '${rawPath}':`, e)
				// Decide if we should re-throw or continue
				// For sync, typically the first error would halt.
				throw e
			}
		}
		this.utils.log(LogLevel.Debug, `VFSState: populateSync finished.`)
	} //<

	async populate(structure: IFileSystemStructure): Promise<void> { //>
		this.utils.log(LogLevel.Info, `VFSState: populate (async) called with ${Object.keys(structure).length} entries.`)
		const sortedPaths = Object.keys(structure).sort((a, b) => a.length - b.length)

		for (const rawPath of sortedPaths) {
			// Error handling within the loop allows other entries to be processed if one fails.
			// For a more atomic operation, errors could be collected and thrown at the end,
			// or the first error could halt the process.
			try {
				const normalizedPath = this.pathService.normalize(rawPath.replace(/\\/g, '/'))
				const entryValue = structure[rawPath]

				if (entryValue === null) {
					await this.addFolder(normalizedPath)
				}
				else if (typeof entryValue === 'string') {
					const contentUint8Array = this._textEncoder.encode(entryValue)
					await this.writeFile(normalizedPath, contentUint8Array)
				}
				else if (entryValue instanceof Uint8Array) {
					await this.writeFile(normalizedPath, entryValue)
				}
				else if (typeof entryValue === 'object' && entryValue !== null) {
					const populateEntry = entryValue as IFileSystemPopulateEntry
					const addNodeOptions: IAddNodeOptions = {}
					let isDirectory = false

					if (populateEntry.content === undefined) {
						isDirectory = true
					}

					if (populateEntry.content !== undefined) {
						addNodeOptions.content = populateEntry.content
					}

					if (isDirectory) {
						await this.addFolder(normalizedPath, addNodeOptions)
					}
					else {
						let contentUint8Array: Uint8Array
						if (addNodeOptions.content instanceof Uint8Array) {
							contentUint8Array = addNodeOptions.content
						}
						else if (typeof addNodeOptions.content === 'string') {
							contentUint8Array = this._textEncoder.encode(addNodeOptions.content)
						}
						else {
							contentUint8Array = new Uint8Array()
						}
						await this.writeFile(normalizedPath, contentUint8Array, addNodeOptions)
					}
				}
				else {
					this.utils.warn(`VFSState: populate (async) - Skipping unknown entry type for path: ${rawPath}`)
				}
			}
			catch (e) {
				this.utils.error(`VFSState: populate (async) - Error processing path '${rawPath}':`, e)
				// For async, we might choose to continue and report errors later, or re-throw immediately.
				// Re-throwing immediately for now.
				throw e
			}
		}
		this.utils.log(LogLevel.Debug, `VFSState: populate (async) finished.`)
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Internal Helpers                                                                                │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	private _pathToUri(path: string | Uri): Uri { //>
		if (typeof path === 'string') {
			if (/^[a-z][a-z0-9+.-]*:/i.test(path)) { // Check if it looks like a URI scheme
				try {
					return Uri.parse(path, true) // Strict parsing
				
				}
				catch (e) {
					this.utils.warn(`VFSState: Failed to parse potential URI string '${path}', assuming file path. Error: ${e}`)
					return Uri.file(this.pathService.resolve(path)) // Fallback to file path
				
				}
			
			}
			else {
				return Uri.file(this.pathService.resolve(path)) // Assume file path
			
			}
		
		}
		// Ensure path component of Uri is normalized
		return path.with({ path: this.pathService.normalize(path.path) })
	
	} //<

	private _createDirectoryNodeInternal(fullPath: string, parent: IVirtualFSNode | null, options?: IAddNodeOptions): IVirtualFSNode { //>
		const now = Date.now()
		const node: IVirtualFSNode = {
			path: fullPath,
			type: FileType.Directory,
			parent,
			children: new Map<string, IVirtualFSNode>(),
			size: 0, // Directories have 0 size in this mock
			ctime: options?.ctime ?? now,
			mtime: options?.mtime ?? now,
			birthtime: options?.birthtime ?? now,
			atime: options?.atime ?? now,
			isRemote: options?.isRemote ?? false,
			inWorkspace: options?.inWorkspace ?? false,
			isCut: false,
			isCopied: false,
		}
		return node
	
	} //<

	private _createFileNodeInternal(fullPath: string, parent: IVirtualFSNode | null, options?: IAddNodeOptions): IVirtualFSNode { //>
		const now = Date.now()
		let content: Uint8Array
		if (options?.content instanceof Uint8Array) {
			content = options.content
		
		}
		else if (typeof options?.content === 'string') {
			content = this._textEncoder.encode(options.content)
		
		}
		else {
			content = new Uint8Array() // Default to empty content
		
		}

		const node: IVirtualFSNode = {
			path: fullPath,
			type: FileType.File,
			parent,
			content,
			size: content.byteLength,
			ctime: options?.ctime ?? now,
			mtime: options?.mtime ?? now,
			birthtime: options?.birthtime ?? now,
			atime: options?.atime ?? now,
			isRemote: options?.isRemote ?? false,
			inWorkspace: options?.inWorkspace ?? false,
			isCut: false,
			isCopied: false,
		}
		return node
	
	} //<

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
		// Using FileIsADirectory code for "not a file" is a common pattern if a specific "NotAFile" code isn't standard.
		// Or, we can use a generic error if preferred. For now, let's align with how it might be if FileIsADirectory is used.
		return this.utils.createFileSystemError('FileIsADirectory', uri, message || `Path is not a file: ${uri.toString()}`) as FileSystemError
	
	} //<

	private _findNode(uri: Uri, updateAtime = true): IVirtualFSNode | undefined { //>
		const normalizedPath = this.pathService.normalize(uri.path)
		this.utils.log(LogLevel.Trace, `VFSState: _findNode searching for: ${normalizedPath}`)

		if (normalizedPath === this._root.path) {
			if (updateAtime)
				this._updateAtime(this._root)
			return this._root
		
		}

		// Handle paths like "c:" or "/" which should resolve to root if `pathService.sep` is the path.
		if (normalizedPath === this.pathService.sep && this._root.path === this.pathService.sep) {
			if (updateAtime)
				this._updateAtime(this._root)
			return this._root
		
		}


		const segments = normalizedPath.split(this.pathService.sep).filter(s => s.length > 0)

		// If segments are empty, it means path was likely just "/" or "c:/", which should point to root.
		// However, if root itself is just "/", segments would be empty.
		// If root is "c:/", then "c:" split by "/" might give ["c:"].
		// This needs careful handling based on how pathService.sep and root path interact.

		// If root is "/" and path is "/", segments is empty.
		// If root is "c:\" and path is "c:\", segments is ["c:"]. This is wrong.
		// Let's adjust segment generation for drive letters on windows if pathService.sep is '\'
		let effectiveSegments = segments
		if (this.pathService.sep === '\\' && normalizedPath.includes(':')) {
			const driveLetter = normalizedPath.substring(0, normalizedPath.indexOf(':') + 1) // e.g., "C:"
			const pathAfterDrive = normalizedPath.substring(driveLetter.length + (normalizedPath.startsWith(`${driveLetter}\\`) ? 1 : 0))
			effectiveSegments = [driveLetter, ...pathAfterDrive.split(this.pathService.sep).filter(s => s.length > 0)]
			if (this._root.path.toUpperCase() === driveLetter.toUpperCase() + this.pathService.sep && effectiveSegments.length === 1 && effectiveSegments[0].toUpperCase() === driveLetter.toUpperCase()) {
				if (updateAtime)
					this._updateAtime(this._root)
				return this._root
			
			}
		
		}
		else if (segments.length === 0 && normalizedPath === this.pathService.sep && this._root.path === this.pathService.sep) {
			// Path is "/" and root is "/"
			if (updateAtime)
				this._updateAtime(this._root)
			return this._root
		
		}


		let currentNode: IVirtualFSNode | undefined = this._root
		for (const segment of effectiveSegments) {
			if (!currentNode || currentNode.type !== FileType.Directory || !currentNode.children) {
				this.utils.log(LogLevel.Trace, `VFSState: _findNode failed: Parent not a directory or missing children at segment '${segment}' for path '${normalizedPath}'`)
				return undefined
			
			}
			// Case-insensitive find for Windows-like mode
			const childKey: string | undefined = this.pathService.getMode() === 'win32'
				? Array.from(currentNode.children.keys()).find(k => k.toLowerCase() === segment.toLowerCase())
				: segment
			
			currentNode = childKey ? currentNode.children.get(childKey) : undefined

			if (!currentNode) {
				this.utils.log(LogLevel.Trace, `VFSState: _findNode failed: Segment '${segment}' not found in parent '${effectiveSegments.slice(0, effectiveSegments.indexOf(segment)).join(this.pathService.sep)}' for path '${normalizedPath}'`)
				return undefined
			
			}
			this.utils.log(LogLevel.Trace, `VFSState: _findNode traversed to: ${currentNode.path}`)
		
		}

		if (currentNode && updateAtime) {
			this._updateAtime(currentNode)
		
		}
		return currentNode
	
	} //<
    
	private _updateMtime(node: IVirtualFSNode, timestamp?: number): void { //>
		const now = timestamp ?? Date.now()
		node.mtime = now
		if (node.parent) {
			// Also update parent's mtime as its content (the list of children/their metadata) has changed.
			node.parent.mtime = now
		
		}
	
	} //<

	private _updateAtime(node: IVirtualFSNode, timestamp?: number): void { //>
		node.atime = timestamp ?? Date.now()
	
	} //<

	private _updateChildPathsRecursive(dirNode: IVirtualFSNode): void { //>
		if (dirNode.type !== FileType.Directory || !dirNode.children)
			return

		for (const [name, child] of dirNode.children.entries()) {
			child.path = this.pathService.normalize(this.pathService.join(dirNode.path, name))
			child.parent = dirNode // Ensure parent reference is correct
			if (child.type === FileType.Directory) {
				this._updateChildPathsRecursive(child)
			
			}
		
		}
	
	} //<

	private async _ensureParents(uri: Uri, options?: IAddNodeOptions): Promise<IVirtualFSNode> { //>
		const normalizedPath = this.pathService.normalize(uri.path)
		const parentPath = this.pathService.dirname(normalizedPath)

		if (parentPath === normalizedPath || parentPath === this._root.path) { // Reached root or trying to get parent of root
			return this._root
		
		}

		const parentUri = uri.with({ path: parentPath })
		let parentNode = this._findNode(parentUri, false)

		if (!parentNode) {
			parentNode = await this._ensureParents(parentUri, options) // Recursively ensure grandparent
			const dirname = this.pathService.basename(parentPath)
			// Create the current parent directory node
			const newNode = this._createDirectoryNodeInternal(parentPath, parentNode, options)
			if (!parentNode.children) { // Should have been created by recursive call if parentNode is root
				parentNode.children = new Map()
			
			}
			parentNode.children.set(dirname, newNode)
			this._updateMtime(parentNode) // Update mtime of the grandparent
			this.utils.log(LogLevel.Trace, `VFSState: _ensureParents created directory: ${parentPath}`)
			return newNode // Return the newly created parent
		
		}
		else if (parentNode.type !== FileType.Directory) {
			throw this._createNotADirectoryError(parentUri)
		
		}
		return parentNode
	
	} //<

	private _ensureParentsSync(uri: Uri, options?: IAddNodeOptions): IVirtualFSNode { //>
		const normalizedPath = this.pathService.normalize(uri.path)
		const parentPath = this.pathService.dirname(normalizedPath)

		if (parentPath === normalizedPath || parentPath === this._root.path) {
			return this._root
		
		}

		const parentUri = uri.with({ path: parentPath })
		let parentNode = this._findNode(parentUri, false)

		if (!parentNode) {
			parentNode = this._ensureParentsSync(parentUri, options) // Recursive sync call
			const dirname = this.pathService.basename(parentPath)
			const newNode = this._createDirectoryNodeInternal(parentPath, parentNode, options)
			if (!parentNode.children) {
				parentNode.children = new Map()
			
			}
			parentNode.children.set(dirname, newNode)
			this._updateMtime(parentNode)
			this.utils.log(LogLevel.Trace, `VFSState: _ensureParentsSync created directory: ${parentPath}`)
			return newNode
		
		}
		else if (parentNode.type !== FileType.Directory) {
			throw this._createNotADirectoryError(parentUri)
		
		}
		return parentNode
	
	} //<

	private _cloneNodeRecursive(sourceNode: IVirtualFSNode, newParent: IVirtualFSNode | null, newName?: string): IVirtualFSNode { //>
		const now = Date.now()
		const clonedNode: IVirtualFSNode = {
			...sourceNode, // Shallow copy properties
			path: newParent ? this.pathService.join(newParent.path, newName ?? this.pathService.basename(sourceNode.path)) : sourceNode.path,
			parent: newParent,
			ctime: now, // Reset timestamps for a new copy
			mtime: now,
			birthtime: now,
			atime: now,
			isCut: false, // Reset flags
			isCopied: false,
			content: sourceNode.content instanceof Uint8Array ? sourceNode.content.slice(0) : sourceNode.content, // Deep copy content
			children: undefined, // Will be populated if directory
		}
		clonedNode.path = this.pathService.normalize(clonedNode.path)

		if (sourceNode.type === FileType.Directory && sourceNode.children) {
			clonedNode.children = new Map<string, IVirtualFSNode>()
			for (const [childName, childNode] of sourceNode.children.entries()) {
				const clonedChild = this._cloneNodeRecursive(childNode, clonedNode, childName)
				clonedNode.children.set(childName, clonedChild)
			
			}
		
		}
		return clonedNode
	
	} //<

}