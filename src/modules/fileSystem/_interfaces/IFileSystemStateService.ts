// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import type { URI as Uri } from 'vscode-uri'
import type { FileType } from '../../../_vscCore/vscEnums.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Represents a node in the virtual file system tree.
 */
export interface IVirtualFSNode { //>
	path: string
	type: FileType
	parent: IVirtualFSNode | null
	children?: Map<string, IVirtualFSNode> // Only for directories
	content?: Uint8Array | string // Only for files
	size: number
	ctime: number // Creation time
	mtime: number // Modification time
	birthtime: number // Birth time (creation time)
	atime: number // Access time
	isRemote?: boolean // Mockly specific metadata
	inWorkspace?: boolean // Mockly specific metadata
	isCut?: boolean // Mockly specific metadata
	isCopied?: boolean // Mockly specific metadata
} //<

/**
 * Options for adding a file or folder node to the virtual file system.
 */
export interface IAddNodeOptions { //>
	content?: string | Uint8Array // Initial content for files
	ctime?: number
	mtime?: number
	birthtime?: number
	atime?: number
	isRemote?: boolean
	inWorkspace?: boolean
} //<

/**
 * Options for paste operations in the virtual file system.
 */
export interface IPasteOptions { //>
	overwrite?: boolean
} //<

/**
 * Interface for the Virtual File System State Service.
 * Manages the in-memory representation of the file system and its state.
 * This service is an internal component used by the FileSystemModule.
 */
export interface IFileSystemStateService {

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Properties                                                                                      │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
	readonly rootNode: IVirtualFSNode
	readonly clipboardNode: IVirtualFSNode | null
	readonly clipboardOperation: 'copy' | 'cut' | null

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  Methods                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	/**
	 * Adds or overwrites a file in the virtual file system. Creates parent directories if they don't exist.
	 * @param path The path (string or Uri) of the file.
	 * @param options Options including content and metadata.
	 * @returns The created or updated file node.
	 * @throws FileSystemError if the path points to a directory.
	 */
	addFile: (path: string | Uri, options?: IAddNodeOptions) => Promise<IVirtualFSNode>

	/**
	 * Adds or overwrites multiple files in a batch operation.
	 * @param files A record where keys are paths and values are content (string | Uint8Array) or options.
	 * @returns An array of the created or updated file nodes.
	 */
	addFileBatch: (files: Record<string, string | Uint8Array | IAddNodeOptions | undefined>) => Promise<IVirtualFSNode[]>

	/**
	 * Adds a folder (directory) to the virtual file system. Creates parent directories if they don't exist.
	 * @param path The path (string or Uri) of the folder.
	 * @param options Optional metadata for the folder.
	 * @returns The created or existing folder node.
	 * @throws FileSystemError if the path points to a file.
	 */
	addFolder: (path: string | Uri, options?: IAddNodeOptions) => Promise<IVirtualFSNode>

	/**
	 * Adds multiple folders in a batch operation.
	 * @param paths An array of paths (string or Uri) for the folders to add.
	 * @returns An array of the created folder nodes.
	 */
	addFolderBatch: (paths: (string | Uri)[]) => Promise<IVirtualFSNode[]>

	/**
	 * Reads the content of a file.
	 * @param path The path (string or Uri) of the file.
	 * @returns The content as Uint8Array.
	 * @throws FileSystemError if the path is not found or is a directory.
	 */
	readFile: (path: string | Uri) => Promise<Uint8Array>

	/**
	 * Writes content to a file, creating or overwriting it. Creates parent directories if they don't exist.
	 * @param path The path (string or Uri) of the file.
	 * @param content The content as Uint8Array.
	 * @param options Optional metadata for the file.
	 * @throws FileSystemError if the path points to a directory.
	 */
	writeFile: (path: string | Uri, content: Uint8Array, options?: IAddNodeOptions) => Promise<void>

	/**
	 * Deletes a file from the virtual file system.
	 * @param path The path (string or Uri) of the file.
	 * @param options Optional delete options (useTrash is ignored).
	 * @throws FileSystemError if the path is not found or is a directory.
	 */
	deleteFile: (path: string | Uri, options?: { useTrash?: boolean }) => Promise<void>

	/**
	 * Deletes a folder from the virtual file system.
	 * @param path The path (string or Uri) of the folder.
	 * @param options Optional delete options (recursive, useTrash).
	 * @throws FileSystemError if the path is not found, is a file, or the directory is not empty and recursive is false.
	 */
	deleteFolder: (path: string | Uri, options?: { recursive?: boolean, useTrash?: boolean }) => Promise<void>

	/**
	 * Renames or moves a file or folder.
	 * @param oldPath The current path (string or Uri).
	 * @param newPath The target path (string or Uri).
	 * @param options Optional rename options (overwrite).
	 * @throws FileSystemError if the old path is not found, the new path exists and overwrite is false, or type conflicts occur.
	 */
	rename: (oldPath: string | Uri, newPath: string | Uri, options?: { overwrite?: boolean }) => Promise<void>

	/**
	 * Reads the entries of a directory.
	 * @param path The path (string or Uri) of the directory.
	 * @returns An array of [name, type] tuples for each entry.
	 * @throws FileSystemError if the path is not found or is a file.
	 */
	readDirectory: (path: string | Uri) => Promise<[string, FileType][]>

	/**
	 * Retrieves file status (metadata) for a path.
	 * @param path The path (string or Uri).
	 * @returns A FileStat object.
	 * @throws FileSystemError if the path is not found.
	 */
	stat: (path: string | Uri) => Promise<vt.FileStat>

	/**
	 * Checks if a path exists in the virtual file system.
	 * @param path The path (string or Uri).
	 * @returns True if the path exists, false otherwise.
	 */
	exists: (path: string | Uri) => Promise<boolean>

	/**
	 * Retrieves the internal node representation for a path.
	 * @param path The path (string or Uri).
	 * @returns The IVirtualFSNode or undefined if not found.
	 */
	getNode: (path: string | Uri) => Promise<IVirtualFSNode | undefined>

	/**
	 * Copies a file or folder to the internal clipboard.
	 * @param path The path (string or Uri) to copy.
	 * @throws FileSystemError if the path is not found.
	 */
	copy: (path: string | Uri) => Promise<void>

	/**
	 * Cuts (marks for move) a file or folder to the internal clipboard.
	 * @param path The path (string or Uri) to cut.
	 * @throws FileSystemError if the path is not found.
	 */
	cut: (path: string | Uri) => Promise<void>

	/**
	 * Pastes the content of the clipboard to a destination directory.
	 * @param destinationDir The path (string or Uri) of the destination directory.
	 * @param options Optional paste options (overwrite).
	 * @returns The resulting node at the destination.
	 * @throws Error if the clipboard is empty or paste fails due to conflicts.
	 */
	paste: (destinationDir: string | Uri, options?: IPasteOptions) => Promise<IVirtualFSNode>

	/**
	 * Clears the entire virtual file system state.
	 */
	clear: () => Promise<void>

	/**
	 * Clears the internal clipboard state.
	 */
	clearClipboard: () => Promise<void>

	/**
	 * Sets the 'inWorkspace' flag for a node and optionally its children.
	 * @param path The path (string or Uri) of the node.
	 * @param value The boolean value to set.
	 * @param recursive Whether to apply recursively to children (default true).
	 * @throws FileSystemError if the path is not found.
	 */
	setInWorkspace: (path: string | Uri, value: boolean, recursive?: boolean) => Promise<void>

	/**
	 * Sets the 'isRemote' flag for a node and optionally its children.
	 * @param path The path (string or Uri) of the node.
	 * @param value The boolean value to set.
	 * @param recursive Whether to apply recursively to children (default true).
	 * @throws FileSystemError if the path is not found.
	 */
	setIsRemote: (path: string | Uri, value: boolean, recursive?: boolean) => Promise<void>

}