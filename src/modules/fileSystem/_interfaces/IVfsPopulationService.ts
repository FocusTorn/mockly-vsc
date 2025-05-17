// ESLint & Imports -->>

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Defines an entry for populating the file system, allowing specification of content and optional metadata.
 */
export interface IFileSystemPopulateEntry { //>
	content?: string | Uint8Array // For files
	// Optional: type?: 'file' | 'directory'; // Could be explicit, or inferred
	// Optional: mtime?: number; ctime?: number; // For advanced metadata setup
} //<

/**
 * Defines the structure for populating the virtual file system.
 * Keys are paths, and values can be content (string or Uint8Array for files),
 * null (for directories), or an IFileSystemPopulateEntry for more detailed specification.
 */
export interface IFileSystemStructure { //>
	[path: string]: string | Uint8Array | null | IFileSystemPopulateEntry
} //<

/**
 * Interface for the VFS Population Service.
 * This service is responsible for populating the VFS from a given structure.
 */
export interface IVfsPopulationService {
	/**
	 * Populates the virtual file system synchronously based on the provided structure.
	 * Parent directories are created as needed.
	 * @param structure An object where keys are paths and values define the file/folder.
	 * @throws Error if processing any path fails.
	 */
	populateSync: (structure: IFileSystemStructure) => void

	/**
	 * Populates the virtual file system asynchronously based on the provided structure.
	 * Parent directories are created as needed.
	 * @param structure An object where keys are paths and values define the file/folder.
	 * @returns A promise that resolves when population is complete.
	 * @throws Error if processing any path fails.
	 */
	populate: (structure: IFileSystemStructure) => Promise<void>
}
