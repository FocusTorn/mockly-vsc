// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import { injectable, singleton, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import { LogLevel, FileType } from '../../../_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { IWorkspaceStateService } from '../_interfaces/IWorkspaceStateService.ts'
import type { IEventBusService } from '../../../core/_interfaces/IEventBusService.ts'
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import { WorkspaceType } from '../_interfaces/IWorkspaceStateService.ts'
import type { IFileSystemService } from 'src/modules/fileSystem/_interfaces/IFileSystemService.ts'
import type { IMockNodePathService } from 'src/modules/nodePath/_interfaces/IMockNodePathService.ts'

//--------------------------------------------------------------------------------------------------------------<<

@injectable()
@singleton()
export class WorkspaceStateService implements IWorkspaceStateService {

	private _folders: vt.WorkspaceFolder[] = []
	private _type: WorkspaceType = WorkspaceType.NONE
	private _workspaceFile: vt.Uri | undefined = undefined
	private _name: string | undefined = undefined

	constructor(
		@inject('IFileSystemService') private fileSystemService: IFileSystemService,
		@inject('IMockNodePathService') private pathService: IMockNodePathService,
		@inject('IEventBusService') private eventBus: IEventBusService,
		@inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
	) {
		this.utils.log(LogLevel.Debug, 'WorkspaceStateService initialized.')
	
	}

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  GETTERS                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	get workspaceType(): WorkspaceType { //>
		return this._type
	
	} //<

	get workspaceFolders(): readonly vt.WorkspaceFolder[] | undefined { //>
		return this._type === WorkspaceType.NONE ? undefined : this._folders
	
	} //<

	get name(): string | undefined { //>
		return this._name
	
	} //<

	get workspaceFile(): vt.Uri | undefined { //>
		return this._workspaceFile
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  METHODS                                                                                         │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	async addWorkspaceFolder(folderUri: vt.Uri, name?: string): Promise<boolean> { //>
		this.utils.log(LogLevel.Info, `addWorkspaceFolder called for: ${folderUri.toString()}`)

		if (!(await this._validateFolderUri(folderUri))) {
			this.utils.error(`Validation failed for adding workspace folder: ${folderUri.toString()}`)
			return false
		
		}

		const alreadyExists = this._folders.some(f => this._compareUris(f.uri, folderUri))
		if (alreadyExists) {
			this.utils.log(LogLevel.Debug, `Workspace folder already exists: ${folderUri.toString()}`)
			return false
		
		}

		const folderName = name ?? this.pathService.basename(folderUri.path)
		const newFolder: vt.WorkspaceFolder = {
			uri: folderUri,
			name: folderName,
			index: this._folders.length,
		}

		const oldFolders = [...this._folders]
		const newFolders = [...this._folders, newFolder]

		this._updateStateAndFireEvent(oldFolders, newFolders, this._workspaceFile)

		this.utils.log(LogLevel.Debug, `Workspace folder added successfully: ${folderUri.toString()}`)
		return true
	
	} //<

	async clearWorkspace(): Promise<void> { //>
		this.utils.log(LogLevel.Info, `clearWorkspace called.`)
		const oldFolders = [...this._folders]
		this._updateStateAndFireEvent(oldFolders, [], undefined)
		this.utils.log(LogLevel.Debug, `Workspace cleared.`)
	
	} //<

	async removeWorkspaceFolder(folderUri: vt.Uri): Promise<boolean> { //>
		this.utils.log(LogLevel.Info, `removeWorkspaceFolder called for: ${folderUri.toString()}`)

		const oldFolders = [...this._folders]
		const indexToRemove = oldFolders.findIndex(f => this._compareUris(f.uri, folderUri))

		if (indexToRemove === -1) {
			this.utils.log(LogLevel.Debug, `Workspace folder not found for removal: ${folderUri.toString()}`)
			return false
		
		}

		const newFoldersProvisional = oldFolders.slice(0, indexToRemove).concat(oldFolders.slice(indexToRemove + 1))

		let newWorkspaceFile = this._workspaceFile
		if (newFoldersProvisional.length <= 1 && this._workspaceFile) {
			this.utils.log(LogLevel.Debug, `Clearing workspace file as folder count drops below 2.`)
			newWorkspaceFile = undefined
		
		}

		this._updateStateAndFireEvent(oldFolders, newFoldersProvisional, newWorkspaceFile)

		this.utils.log(LogLevel.Debug, `Workspace folder removed successfully: ${folderUri.toString()}`)
		return true
	
	} //<

	async setWorkspaceFolders(folders: readonly (vt.WorkspaceFolder | vt.Uri)[], workspaceFileUri?: vt.Uri): Promise<void> { //>
		this.utils.log(LogLevel.Info, `setWorkspaceFolders called with ${folders.length} folders. Workspace file: ${workspaceFileUri?.toString()}`)

		const oldFolders = [...this._folders]
		const newValidFolders: vt.WorkspaceFolder[] = []
		const uniqueUris = new Set<string>()

		for (let i = 0; i < folders.length; i++) {
			const item = folders[i]
			let uri: vt.Uri
			let name: string | undefined

			if ('uri' in item) {
				uri = item.uri
				name = item.name
			
			}
			else {
				uri = item
				name = undefined
			
			}

			const normalizedPath = this.pathService.normalize(uri.path)
			if (uniqueUris.has(normalizedPath)) {
				this.utils.warn(`Duplicate folder URI detected and skipped: ${uri.toString()}`)
				continue
			
			}

			try {
				// Use the stat method from the new merged FileSystemService
				const stats = await this.fileSystemService.stat(uri)
				if (stats.type === FileType.Directory) {
					uniqueUris.add(normalizedPath)
					newValidFolders.push({
						uri,
						name: name ?? this.pathService.basename(uri.path),
						index: newValidFolders.length,
					})
				
				}
				else {
					// Path exists but is not a directory
					this.utils.error(`Invalid folder skipped during setWorkspaceFolders: ${uri.toString()} (Not a directory)`)
				
				}
			
			}
			catch (e) {
				// Catch any error from stat, including FileNotFound
				this.utils.error(`Invalid folder skipped during setWorkspaceFolders: ${uri.toString()} (Error: ${(e as any).message})`)
			
			}
		
		}

		this._updateStateAndFireEvent(oldFolders, newValidFolders, workspaceFileUri)
		this.utils.log(LogLevel.Debug, `setWorkspaceFolders complete. New count: ${this._folders.length}`)
	
	} //<

	getWorkspaceFolder(uri: vt.Uri): vt.WorkspaceFolder | undefined { //>
		this.utils.log(LogLevel.Trace, `getWorkspaceFolder called for: ${uri.toString()}`)
		if (!this.workspaceFolders) {
			return undefined
		
		}

		const normalizedInputPath = this.pathService.normalize(uri.path)
		let bestMatch: vt.WorkspaceFolder | undefined

		for (const folder of this.workspaceFolders) {
			const normalizedFolderPath = this.pathService.normalize(folder.uri.path)

			const relativePath = this.pathService.relative(normalizedFolderPath, normalizedInputPath)

			if (relativePath === '' || (!relativePath.startsWith('..') && relativePath !== normalizedInputPath)) {
				if (!bestMatch || normalizedFolderPath.length > this.pathService.normalize(bestMatch.uri.path).length) {
					bestMatch = folder
				
				}
			
			}
		
		}

		if (bestMatch) {
			this.utils.log(LogLevel.Trace, `getWorkspaceFolder: Found match: ${bestMatch.name} (${bestMatch.uri.toString()})`)
		
		}
		else {
			this.utils.log(LogLevel.Trace, `getWorkspaceFolder: No matching folder found for ${uri.toString()}`)
		
		}
		return bestMatch
	
	} //<

	// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
	// │  INTERNAL                                                                                        │
	// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

	async _validateFolderUri( //>
		uri: vt.Uri,
	): Promise<boolean> {
		try {
			// Use the stat method from the new merged FileSystemService
			const stats = await this.fileSystemService.stat(uri)
			if (stats.type === FileType.Directory) {
				return true
			
			}
			else {
				this.utils.warn(`Path is not a directory: ${uri.toString()}`)
				return false
			
			}
		
		}
		catch (e) { //>
			if ((e as any).code === 'FileNotFound') {
				this.utils.warn(`Workspace folder path not found in VFS: ${uri.toString()}`)
			
			}
			else {
				this.utils.error(`Error validating workspace folder URI ${uri.toString()}:`, e)
			
			}
			return false
		
		} //<
	
	} //<

	_compareUris( //>
		uri1: vt.Uri,
		uri2: vt.Uri,
	): boolean {
		const normUri1 = uri1.with({ path: this.pathService.normalize(uri1.path) })
		const normUri2 = uri2.with({ path: this.pathService.normalize(uri2.path) })
		const areEqual = normUri1.toString() === normUri2.toString()
		this.utils.log(LogLevel.Trace, `_compareUris: '${uri1.toString()}' vs '${uri2.toString()}' => Normalized: '${normUri1.toString()}' vs '${normUri2.toString()}' => Equal: ${areEqual}`)
		return areEqual
	
	} //<

	_updateStateAndFireEvent( //>
		oldFolders: readonly vt.WorkspaceFolder[],
		newFoldersInput: readonly vt.WorkspaceFolder[],
		newWorkspaceFile?: vt.Uri,
	): void {
		const added: vt.WorkspaceFolder[] = []
		const removed: vt.WorkspaceFolder[] = [...oldFolders]

		const finalNewFolders = newFoldersInput.map((folder, index) => ({
			...folder,
			index,
		}))

		for (const newFolder of finalNewFolders) {
			const oldIndex = removed.findIndex(old => this._compareUris(old.uri, newFolder.uri))
			if (oldIndex !== -1) {
				removed.splice(oldIndex, 1)
			
			}
			else {
				added.push(newFolder)
			
			}
		
		}

		const oldWorkspaceFile = this._workspaceFile

		this._folders = finalNewFolders

		this._workspaceFile = newWorkspaceFile

		if (this._workspaceFile) { //>
			this._type = WorkspaceType.MULTI_ROOT
			const basename = this.pathService.basename(this._workspaceFile.path)
			const ext = this.pathService.extname(basename)
			this._name = ext ? basename.slice(0, -ext.length) : basename
		
		} //<
		else if (this._folders.length === 0) { //>
			this._type = WorkspaceType.NONE
			this._name = undefined
		
		} //<
		else if (this._folders.length === 1) { //>
			this._type = WorkspaceType.SINGLE_ROOT
			this._name = this._folders[0].name
		
		} //<
		else { //>
			this._type = WorkspaceType.MULTI_ROOT
			this._name = this._folders[0].name
		
		} //<

		const workspaceFileChanged = oldWorkspaceFile?.toString() !== newWorkspaceFile?.toString()

		if (added.length > 0 || removed.length > 0 || workspaceFileChanged) { //>
			this.utils.log(LogLevel.Debug, `Firing onDidChangeWorkspaceFolders: Added ${added.length}, Removed ${removed.length}, WS File Changed: ${workspaceFileChanged}`)
			this.eventBus.fireOnDidChangeWorkspaceFolders({ added, removed })
		
		} //<
		else { //>
			this.utils.log(LogLevel.Trace, `No workspace folder changes detected, skipping event firing.`)
		
		} //<
	
	} //<

}
