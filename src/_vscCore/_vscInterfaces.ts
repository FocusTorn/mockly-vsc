// ESLint & Imports --------->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import type { URI as Uri } from 'vscode-uri'
import type { EndOfLine } from './vscEnums.ts'
import type { Position, Range } from './vscClasses.ts'

//--------------------------------------------------------------------------------------------------------------<<

export interface FileOperation { //>
    kind: 'create' | 'delete' | 'rename'
    uri?: Uri
    oldUri?: Uri
    newUri?: Uri
    options?: FileOperationOptions
    metadata?: vt.WorkspaceEditEntryMetadata
} //<

export interface TextEditFactory { //>
    replace: (range: Range, newText: string) => vt.TextEdit
    insert: (position: Position, newText: string) => vt.TextEdit
    delete: (range: Range) => vt.TextEdit
    setEndOfLine: (eol: EndOfLine) => vt.TextEdit
    prototype?: any
} //<

export interface MockFileSystemErrorNamespace extends Pick<typeof vt.FileSystemError, //>
  | 'FileExists'
  | 'FileNotFound'
  | 'FileNotADirectory'
  | 'FileIsADirectory'
  | 'NoPermissions'
  | 'Unavailable'> { } //<

export type StoredTextEdit = vt.TextEdit & { metadata?: vt.WorkspaceEditEntryMetadata }

export type FileOperationOptions = ( //>
  | { overwrite?: boolean, ignoreIfExists?: boolean, content?: Uint8Array }
  | { recursive?: boolean, ignoreIfNotExists?: boolean, useTrash?: boolean, maxSize?: number }
  | { overwrite?: boolean, ignoreIfExists?: boolean }
) //<

