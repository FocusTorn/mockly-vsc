// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type { URI as Uri } from 'vscode-uri'
import type { FileType } from '../../../_vscCore/vscEnums.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { IVirtualFSNode, IAddNodeOptions } from './IFileSystemStateService.ts' // Re-use existing types

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Interface for the VFS Tree Manager Service.
 * This service is responsible for the direct, low-level manipulation of the IVirtualFSNode tree.
 * It is an internal service for the FileSystem module.
 */
export interface IVfsTreeManagerService {
	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Node Access & Query                                                                             │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Gets the root node of the VFS tree.
	 */
	getRootNode: () => IVirtualFSNode

	/**
	 * Finds a node in the VFS tree by its URI.
	 * @param uri The URI of the node to find.
	 * @param updateAtime Whether to update the access time of the found node (default true).
	 * @returns The found IVirtualFSNode or undefined if not found.
	 */
	findNode: (uri: Uri, updateAtime?: boolean) => IVirtualFSNode | undefined

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Node Creation                                                                                   │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Creates a new file node object. Does not add it to the tree.
	 * @param fullPath The full, normalized path for the new node.
	 * @param parent The parent node.
	 * @param options Options for the new file node, including content.
	 * @returns The created IVirtualFSNode for the file.
	 */
	createFileNode: (fullPath: string, parent: IVirtualFSNode, options?: IAddNodeOptions) => IVirtualFSNode

	/**
	 * Creates a new directory node object. Does not add it to the tree.
	 * @param fullPath The full, normalized path for the new node.
	 * @param parent The parent node, or null if creating the root.
	 * @param options Options for the new directory node.
	 * @returns The created IVirtualFSNode for the directory.
	 */
	createDirectoryNode: (fullPath: string, parent: IVirtualFSNode | null, options?: IAddNodeOptions) => IVirtualFSNode

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Tree Manipulation (Path & Hierarchy)                                                            │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Ensures all parent directories for the given URI exist, creating them if necessary (async).
	 * @param uri The URI for which to ensure parent directories.
	 * @param creationOptions Options to use if new parent directories are created.
	 * @returns The immediate parent IVirtualFSNode of the target URI.
	 */
	ensureParents: (uri: Uri, creationOptions?: IAddNodeOptions) => Promise<IVirtualFSNode>

	/**
	 * Ensures all parent directories for the given URI exist, creating them if necessary (sync).
	 * @param uri The URI for which to ensure parent directories.
	 * @param creationOptions Options to use if new parent directories are created.
	 * @returns The immediate parent IVirtualFSNode of the target URI.
	 */
	ensureParentsSync: (uri: Uri, creationOptions?: IAddNodeOptions) => IVirtualFSNode

	/**
	 * Updates the paths of all children of a directory node recursively.
	 * This is typically called after a directory is moved or renamed.
	 * @param dirNode The directory node whose children's paths need updating.
	 */
	updateChildPathsRecursive: (dirNode: IVirtualFSNode) => void

	/**
	 * Adds a child node to a parent node's children map.
	 * @param parentNode The parent directory node.
	 * @param childName The name of the child node.
	 * @param childNode The child node to add.
	 * @throws Error if the parent is not a directory or has no children map.
	 */
	addChildNode: (parentNode: IVirtualFSNode, childName: string, childNode: IVirtualFSNode) => void

	/**
	 * Removes a child node from a parent node's children map.
	 * @param parentNode The parent directory node.
	 * @param childName The name of the child node to remove.
	 * @returns True if the child was removed, false otherwise.
	 * @throws Error if the parent is not a directory or has no children map.
	 */
	removeChildNode: (parentNode: IVirtualFSNode, childName: string) => boolean

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Node Metadata Updates                                                                           │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	/**
	 * Updates the mtime (modification time) of a node and its parent.
	 * @param node The node whose mtime is being updated.
	 * @param timestamp Optional specific timestamp to set. Defaults to Date.now().
	 */
	updateMtime: (node: IVirtualFSNode, timestamp?: number) => void

	/**
	 * Updates the atime (access time) of a node.
	 * @param node The node whose atime is being updated.
	 * @param timestamp Optional specific timestamp to set. Defaults to Date.now().
	 */
	updateAtime: (node: IVirtualFSNode, timestamp?: number) => void

	/**
	 * Updates the content and size of a file node.
	 * @param fileNode The file node to update.
	 * @param newContent The new content as Uint8Array.
	 * @param newMtime Optional new modification time.
	 */
	updateFileContent: (fileNode: IVirtualFSNode, newContent: Uint8Array, newMtime?: number) => void

	/**
	 * Resets the VFS tree to its initial state (a single root directory).
	 */
	resetTree: () => void
}
