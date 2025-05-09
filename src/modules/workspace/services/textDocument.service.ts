// ESLint & Imports --------->>

//= TSYRINGE ==================================================================================================
import { injectable, inject } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { LogLevel } from '../../../_vscCore/vscEnums.ts'
import type * as vt from 'vscode'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'
import type { IEventBusService } from '../../../core/_interfaces/IEventBusService.ts'
import type { ITextDocumentService } from '../_interfaces/ITextDocumentService.ts'

//= IMPLEMENTATION CLASSES ====================================================================================
import { TextDocument } from '../implementations/textDocument.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Service responsible for managing the state of open text documents within the mock environment.
 * Implements the ITextDocumentService interface.
 */
@injectable()
export class TextDocumentService implements ITextDocumentService {
    private _openTextDocuments: Map<string, TextDocument> = new Map()

    constructor(
        @inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
        @inject('IEventBusService') private eventBus: IEventBusService,
    ) { }

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  METHODS                                                                                         │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    /**
     * Closes a text document, removing it from the list of open documents.
     * @param uri The Uri of the document to close.
     * @param fireEvent Whether to fire the onDidCloseTextDocument event (default true).
     */
    async closeTextDocument( //>
		uri: vt.Uri,
		fireEvent: boolean = true,
	): Promise<void> {
		const uriString = uri.toString()
		const doc = this._openTextDocuments.get(uriString)
		this.utils.log(LogLevel.Debug, `closeTextDocument: Called for ${uriString}, doc = ${doc ? doc.uri.toString() : 'undefined'}, fireEvent = ${fireEvent}`)
		if (doc) {
			if (!doc.isClosed) { // Only proceed if not already closed
				this.utils.log(LogLevel.Debug, `Closing document: ${uriString}`)
				doc._close() // Mark the instance as closed

				// DO NOT remove from open documents map, allow it to be found but checked for isClosed
				// this._openTextDocuments.delete(uriString) 
				this.utils.log(LogLevel.Debug, `closeTextDocument: Marked as closed. _openTextDocuments.size = ${this._openTextDocuments.size}`)

				if (fireEvent) {
					this.utils.log(LogLevel.Debug, `Firing onDidCloseTextDocument for ${uriString}`)
					this.eventBus.fireOnDidCloseTextDocument(doc)
				}
			} else {
				this.utils.log(LogLevel.Debug, `Document ${uriString} is already closed.`)
			}
		}
	} //<
    
    /**
     * Marks a document as saved and fires the onDidSaveTextDocument event.
     * Note: This mock method does not interact with the virtual file system.
     * Actual saving to VFS should be handled by the caller (e.g., workspace.saveAll).
     * @param doc The document to save.
     * @returns A promise that resolves to true on success.
     */
    async save( //>
        doc: TextDocument,
    ): Promise<boolean> {

        // The actual saving to VFS should be triggered by
        // the caller (e.g., workspace.saveAll or explicit writeFile)
        // and then call _markSaved() on the document.

        this.utils.log(LogLevel.Debug, `TextDocumentService.save called for ${doc.uri.toString()}. Marking as clean.`)

        if (!doc.isUntitled) {
            doc._markSaved() // Mark as saved
            this.eventBus.fireOnDidSaveTextDocument(doc) // Fire the onDidSaveTextDocument event via EventBus
            return Promise.resolve(true)
        }
        else {
            doc._markSaved()
            return Promise.resolve(true)
        }

    } //<

    /**
     * Retrieves an open text document by its Uri.
     * @param uri The Uri of the document.
     * @returns The TextDocument instance if open, otherwise undefined.
     */
    getTextDocument( //>
        uri: vt.Uri,
    ): TextDocument | undefined {
        return this._openTextDocuments.get(uri.toString())
    } //<

    /**
     * Retrieves all currently open text documents.
     * @returns An array of open TextDocument instances.
     */
    getTextDocuments(): TextDocument[] { //>
		// Filter out documents that are marked as closed
		return [...this._openTextDocuments.values()].filter(doc => !doc.isClosed)
	} //<
    
    /**
     * Opens a text document or returns an already open one. Adds it to the internal list.
     * This method is primarily for internal use by the mock workspace.openTextDocument.
     * @param uri The Uri of the document.
     * @param content The initial content of the document.
     * @param languageId The language ID of the document (default 'plaintext').
     * @param suppressEvent Whether to suppress the onDidOpenTextDocument event (default false).
     * @returns The opened or existing TextDocument instance.
     */
    openAndAddTextDocument( //>
		uri: vt.Uri,
		content: string,
		languageId: string = 'plaintext',
		suppressEvent: boolean = false,
	): TextDocument {
		this.utils.log(LogLevel.Trace, 'TextDocumentService.openAndAddTextDocument called')
		const uriString = uri.toString()

		const existingDoc = this._openTextDocuments.get(uriString);

		if (existingDoc) {
			if (!existingDoc.isClosed) {
				this.utils.log(LogLevel.Debug, `Returning already open document: ${uriString}`)
				// If languageId is provided and different, update it
				if (languageId && existingDoc.languageId !== languageId) {
					existingDoc._setLanguageId(languageId);
				}
				return existingDoc
			} else {
				// Document exists but is closed, so re-open it
				this.utils.log(LogLevel.Debug, `Re-opening closed document: ${uriString}.`)
				existingDoc._reOpen(content, languageId); // Use provided content for re-open
				if (!suppressEvent) {
					this.eventBus.fireOnDidOpenTextDocument(existingDoc)
					this.utils.log(LogLevel.Debug, `Document re-opened: ${existingDoc.uri.toString()} - Event fired.`)
				} else {
					this.utils.log(LogLevel.Debug, `Document re-opened: ${existingDoc.uri.toString()} - Event suppressed.`)
				}
				return existingDoc;
			}
		} else {
			// No existing doc found in map. Create a new one.
			this.utils.log(LogLevel.Debug, `No existing document found for ${uriString}. Creating new instance.`)
			const newDoc = new TextDocument(uri, content, languageId, this.utils, this.eventBus)
			this._openTextDocuments.set(uriString, newDoc)
			if (!suppressEvent) {
				this.eventBus.fireOnDidOpenTextDocument(newDoc)
				this.utils.log(LogLevel.Debug, `Document opened and added to map: ${newDoc.uri.toString()} - Event fired.`)
			} else {
				this.utils.log(LogLevel.Debug, `Document opened and added to map: ${newDoc.uri.toString()} - Event suppressed.`)
			}
			return newDoc
		}
	} //<
    
    /**
     * Updates the Uri of an open text document after a rename operation.
     * @param oldUri The old Uri of the document.
     * @param newUri The new Uri of the document.
     */
    renameTextDocument( //>
        oldUri: vt.Uri,
        newUri: vt.Uri,
    ): void {
        const oldUriString = oldUri.toString()
        const newUriString = newUri.toString()

        const doc = this._openTextDocuments.get(oldUriString)
        if (!doc) {
            this.utils.log(
                LogLevel.Warning,
                `renameTextDocument: Document not found for ${oldUriString}`,
            )
            return
        }

        // Create a new document instance with the new URI but the same content/state.
        const newDoc = new TextDocument(newUri, doc.getText(), doc.languageId, this.utils, this.eventBus)

        newDoc._markSaved()
        this._openTextDocuments.delete(oldUriString)
        this._openTextDocuments.set(newUriString, newDoc) // Add the new document instance to the map
        doc._close()
    } //<

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  INTERNALS                                                                                       │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    /**
     * Updates the internal content of a document after it has been saved to the VFS.
     * Marks the document as not dirty and increments the version.
     * @param doc The document to update.
     * @param savedContent The content string after saving.
     */
    _setContentAfterSave( //>
        doc: TextDocument,
        savedContent: string,
    ): void {
        this.utils.log(LogLevel.Debug, `_setContentAfterSave called for ${doc.uri.toString()}. New content: ${savedContent}`)
        doc._setContentAfterSave(savedContent)
        this.eventBus.fireOnDidSaveTextDocument(doc) // Fire the event
    } //<

    /**
     * Resets the state of the service, clearing all open documents.
     */
    _reset(): void { //>
		this.utils.log(LogLevel.Debug, `TextDocumentService._reset called. Current document count: ${this._openTextDocuments.size}`)
		// Explicitly mark all documents as closed before clearing, to handle any external references
		for (const doc of this._openTextDocuments.values()) {
			doc._close();
		}
		this._openTextDocuments.clear()
		this.utils.log(LogLevel.Debug, `TextDocumentService._reset complete. Document count after clear: ${this._openTextDocuments.size}`)
	} //<
    
}