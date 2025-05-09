// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'

//--------------------------------------------------------------------------------------------------------------<<

/**
 * Interface simulating the `vscode.window` namespace.
 * This is the public interface exposed by the Window module.
 */
export interface IWindowNamespace extends Pick<typeof vt.window,

    // Properties
  | 'activeTextEditor'
  | 'visibleTextEditors'
  | 'terminals'
  | 'activeTerminal'

    // Methods
  | 'showTextDocument'
  | 'showInformationMessage'
  | 'showWarningMessage'
  | 'showErrorMessage'
  | 'showQuickPick'
  | 'showInputBox'
  | 'createStatusBarItem'
  | 'createOutputChannel'
  | 'createTerminal'
  | 'registerTreeDataProvider'

    // Events (provided by EventBusService)
  | 'onDidChangeActiveTextEditor'
  | 'onDidChangeVisibleTextEditors'
  | 'onDidChangeTextEditorSelection'
  | 'onDidChangeTextEditorVisibleRanges'
  | 'onDidChangeTextEditorOptions'
  | 'onDidChangeTextEditorViewColumn'
  | 'onDidChangeWindowState'
  | 'onDidOpenTerminal'
  | 'onDidCloseTerminal'
  | 'onDidChangeActiveTerminal'> { }
