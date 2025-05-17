// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, inject, singleton } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type { URI as Uri } from 'vscode-uri'
import { FileType, LogLevel } from '../../../_vscCore/vscEnums.ts'

//= NODE JS ===================================================================================================
import { TextEncoder } from 'node:util'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IMockNodePathService } from '../../nodePath/_interfaces/IMockNodePathService.ts'
import type { IVirtualFSNode, IAddNodeOptions } from '../_interfaces/IFileSystemStateService.ts'
import type { IVfsTreeManagerService } from '../_interfaces/IVfsTreeManagerService.ts'

//--------------------------------------------------------------------------------------------------------------<<

@injectable()
@singleton()
export class VfsTreeManagerService implements IVfsTreeManagerService {

	private _root!: IVirtualFSNode // Initialized in constructor via resetTree
	private _textEncoder = new TextEncoder()

	constructor(
		@inject('IMockNodePathService') private pathService: IMockNodePathService,
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
	) {
		this.resetTree() // Initialize _root
		this.utils.log(LogLevel.Debug, 'VfsTreeManagerService initialized.')
	
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Node Access & Query                                                                             │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	getRootNode(): IVirtualFSNode { //>
		return this._root
	
	} //<

	findNode(uri: Uri, updateAtime = true): IVirtualFSNode | undefined { //>
		const posixPathUtil = this.pathService.posix
		const normalizedInputPath = posixPathUtil.normalize(uri.path)
		this.utils.log(LogLevel.Trace, `VFS TreeManager: findNode searching for: ${normalizedInputPath}`)

		const rootPathNormalized = posixPathUtil.normalize(this._root.path)

		if (normalizedInputPath.toLowerCase() === rootPathNormalized.toLowerCase()) {
			if (updateAtime)
				this.updateAtime(this._root)
			return this._root
		
		}

		let currentNode: IVirtualFSNode | undefined = this._root
		const segments = normalizedInputPath.split(posixPathUtil.sep).filter(s => s.length > 0)

		if (segments.length === 0 && normalizedInputPath === posixPathUtil.sep && rootPathNormalized === posixPathUtil.sep) {
			if (updateAtime)
				this.updateAtime(this._root)
			return this._root
		
		}
		if (segments.length === 0 && normalizedInputPath !== posixPathUtil.sep) {
			this.utils.log(LogLevel.Trace, `VFS TreeManager: findNode failed: No valid segments for path '${normalizedInputPath}'`)
			return undefined
		
		}

		for (let i = 0; i < segments.length; i++) {
			let segmentToSearch = segments[i]
			if (!currentNode || currentNode.type !== FileType.Directory || !currentNode.children) {
				this.utils.log(LogLevel.Trace, `VFS TreeManager: findNode failed: Current node is not a directory or has no children at segment '${segmentToSearch}'`)
				return undefined
			
			}
			const parentNodeForLog = currentNode
			// Handle drive letters in Windows-style paths when using posix normalization (e.g. "C:")
			if (i === 0 && normalizedInputPath.startsWith(posixPathUtil.sep) && segmentToSearch.endsWith(':')) {
				segmentToSearch = segmentToSearch.substring(0, segmentToSearch.length - 1)
			
			}
			const childKey: string | undefined = Array.from(currentNode.children.keys()).find(k => k.toLowerCase() === segmentToSearch.toLowerCase())
			currentNode = childKey ? currentNode.children.get(childKey) : undefined

			if (!currentNode) {
				this.utils.log(LogLevel.Trace, `VFS TreeManager: findNode failed: Segment '${segments[i]}' (searched as '${segmentToSearch}') not found in parent '${parentNodeForLog.path}'`)
				return undefined
			
			}
		
		}

		if (currentNode && updateAtime) {
			this.updateAtime(currentNode)
		
		}
		return currentNode
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Node Creation                                                                                   │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	createFileNode(fullPath: string, parent: IVirtualFSNode, options?: IAddNodeOptions): IVirtualFSNode { //>
		const now = Date.now()
		let content: Uint8Array
		if (options?.content instanceof Uint8Array) {
			content = options.content
		
		}
		else if (typeof options?.content === 'string') {
			content = this._textEncoder.encode(options.content)
		
		}
		else {
			content = new Uint8Array()
		
		}

		const node: IVirtualFSNode = {
			path: this.pathService.posix.normalize(fullPath),
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

	createDirectoryNode(fullPath: string, parent: IVirtualFSNode | null, options?: IAddNodeOptions): IVirtualFSNode { //>
		const now = Date.now()
		const node: IVirtualFSNode = {
			path: this.pathService.posix.normalize(fullPath),
			type: FileType.Directory,
			parent,
			children: new Map<string, IVirtualFSNode>(),
			size: 0,
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

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Tree Manipulation (Path & Hierarchy)                                                            │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	async ensureParents(uri: Uri, creationOptions?: IAddNodeOptions): Promise<IVirtualFSNode> { //>
		// This method remains async for the interface, but the core logic can be sync
		// if we assume no truly async operations are needed for parent creation in this mock.
		// For simplicity, we'll call the sync version.
		return Promise.resolve(this.ensureParentsSync(uri, creationOptions))
	
	} //<

	ensureParentsSync(uri: Uri, creationOptions?: IAddNodeOptions): IVirtualFSNode { //>
		const posixPathUtil = this.pathService.posix
		const normalizedPath = posixPathUtil.normalize(uri.path)
		const parentPath = posixPathUtil.dirname(normalizedPath)

		if (parentPath === normalizedPath || parentPath === this._root.path) {
			return this._root
		
		}

		const parentUri = uri.with({ path: parentPath })
		let parentNode = this.findNode(parentUri, false)

		if (!parentNode) {
			// Recursively ensure the next level of parents
			parentNode = this.ensureParentsSync(parentUri, creationOptions)
			// Now create the current parentPath directory as it didn't exist
			const dirname = posixPathUtil.basename(parentPath)
			const newNode = this.createDirectoryNode(parentPath, parentNode, creationOptions)
			this.addChildNode(parentNode, dirname, newNode)
			this.updateMtime(parentNode) // Update mtime of the grandparent
			this.utils.log(LogLevel.Trace, `VFS TreeManager: ensureParentsSync created directory: ${parentPath}`)
			return newNode // This is the newly created parent
		
		}
		else if (parentNode.type !== FileType.Directory) {
			throw this.utils.createFileSystemError('FileNotADirectory', parentUri)
		
		}
		return parentNode
	
	} //<

	updateChildPathsRecursive(dirNode: IVirtualFSNode): void { //>
		if (dirNode.type !== FileType.Directory || !dirNode.children)
			return
		const posixPathUtil = this.pathService.posix

		for (const [name, child] of dirNode.children.entries()) {
			child.path = posixPathUtil.normalize(posixPathUtil.join(dirNode.path, name))
			child.parent = dirNode // Ensure parent reference is correct
			if (child.type === FileType.Directory) {
				this.updateChildPathsRecursive(child)
			
			}
		
		}
	
	} //<

	addChildNode(parentNode: IVirtualFSNode, childName: string, childNode: IVirtualFSNode): void { //>
		if (parentNode.type !== FileType.Directory || !parentNode.children) {
			throw this.utils.createError(`Cannot add child. Parent ${parentNode.path} is not a directory or has no children map.`)
		
		}
		parentNode.children.set(childName, childNode)
		childNode.parent = parentNode // Ensure parent reference is set
	
	} //<

	removeChildNode(parentNode: IVirtualFSNode, childName: string): boolean { //>
		if (parentNode.type !== FileType.Directory || !parentNode.children) {
			throw this.utils.createError(`Cannot remove child. Parent ${parentNode.path} is not a directory or has no children map.`)
		
		}
		return parentNode.children.delete(childName)
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Node Metadata Updates                                                                           │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	updateMtime(node: IVirtualFSNode, timestamp?: number): void { //>
		const now = timestamp ?? Date.now()
		node.mtime = now
		// Also update parent's mtime as content within it changed
		if (node.parent) {
			node.parent.mtime = now
		
		}
	
	} //<

	updateAtime(node: IVirtualFSNode, timestamp?: number): void { //>
		node.atime = timestamp ?? Date.now()
	
	} //<

	updateFileContent(fileNode: IVirtualFSNode, newContent: Uint8Array, newMtime?: number): void { //>
		if (fileNode.type !== FileType.File) {
			throw this.utils.createError(`Cannot update content of non-file node: ${fileNode.path}`)
		
		}
		fileNode.content = newContent
		fileNode.size = newContent.byteLength
		this.updateMtime(fileNode, newMtime ?? Date.now())
	
	} //<

	resetTree(): void { //>
		this.utils.log(LogLevel.Debug, 'VfsTreeManagerService: Resetting VFS tree...')
		this._root = this.createDirectoryNode(this.pathService.posix.sep, null)
	
	} //<

}
