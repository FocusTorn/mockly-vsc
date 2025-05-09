// ESLint & Imports --------->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'

//= IMPLEMENTATION TYPES ======================================================================================
import type { TextDocument } from '../implementations/textDocument.ts'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Interface defining the contract for the TextDocumentService.
 * Manages the state of open text documents within the mock environment.
 */
export interface ITextDocumentService {

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  METHODS                                                                                         │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    /**
     * Closes a text document, removing it from the list of open documents.
     * @param uri The Uri of the document to close.
     * @param fireEvent Whether to fire the onDidCloseTextDocument event (default true).
     */
    closeTextDocument: (uri: vt.Uri, fireEvent?: boolean) => Promise<void>

    /**
     * Marks a document as saved and fires the onDidSaveTextDocument event.
     * Note: This mock method does not interact with the virtual file system.
     * Actual saving to VFS should be handled by the caller (e.g., workspace.saveAll).
     * @param doc The document to save.
     * @returns A promise that resolves to true on success.
     */
    save: (doc: TextDocument) => Promise<boolean>

    /**
     * Retrieves an open text document by its Uri.
     * @param uri The Uri of the document.
     * @returns The TextDocument instance if open, otherwise undefined.
     */
    getTextDocument: (uri: vt.Uri) => TextDocument | undefined

    /**
     * Retrieves all currently open text documents.
     * @returns An array of open TextDocument instances.
     */
    getTextDocuments: () => TextDocument[]

    /**
     * Opens a text document or returns an already open one. Adds it to the internal list.
     * This method is primarily for internal use by the mock workspace.openTextDocument.
     * @param uri The Uri of the document.
     * @param content The initial content of the document.
     * @param languageId The language ID of the document (default 'plaintext').
     * @param suppressEvent Whether to suppress the onDidOpenTextDocument event (default false).
     * @returns The opened or existing TextDocument instance.
     */
    openAndAddTextDocument: (uri: vt.Uri, content: string, languageId?: string, suppressEvent?: boolean) => TextDocument

    /**
     * Updates the Uri of an open text document after a rename operation.
     * @param oldUri The old Uri of the document.
     * @param newUri The new Uri of the document.
     */
    renameTextDocument: (oldUri: vt.Uri, newUri: vt.Uri) => void

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  INTERNALS                                                                                       │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    /**
     * Updates the internal content of a document after it has been saved to the VFS.
     * Marks the document as not dirty and increments the version.
     * @param doc The document to update.
     * @param savedContent The content string after saving.
     */
    _setContentAfterSave: (doc: TextDocument, savedContent: string) => void

    /**
     * Resets the state of the service, clearing all open documents.
     */
    _reset: () => void

}
