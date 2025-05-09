// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'

//--------------------------------------------------------------------------------------------------------------<<

export interface ICommandsNamespace extends Pick<typeof vt.commands, //
  'registerCommand'
  | 'executeCommand'
  | 'getCommands'> { }
