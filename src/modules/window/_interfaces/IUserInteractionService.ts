// ESLint & Imports -->>

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'

//--------------------------------------------------------------------------------------------------------------<<

export interface IUserInteractionService {

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Methods                                                                                         │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘
    showErrorMessage: //>
        ((
            message: string,
            ...items: (vt.MessageItem | string)[]
        ) => Thenable<vt.MessageItem | undefined>) &
        ((
            message: string,
            options: vt.MessageOptions,
            ...items: (vt.MessageItem | string)[]
        ) => Thenable<vt.MessageItem | undefined>) //<

    showInformationMessage: //>
        ((
            message: string,
            ...items: (vt.MessageItem | string)[]
        ) => Thenable<vt.MessageItem | undefined>) &
        ((
            message: string,
            options: vt.MessageOptions,
            ...items: (vt.MessageItem | string)[]
        ) => Thenable<vt.MessageItem | undefined>) //<

    showInputBox: ( //>
        options?: vt.InputBoxOptions,
        token?: vt.CancellationToken
    ) => Thenable<string | undefined> //<

    showQuickPick: //>
    (
        <T extends vt.QuickPickItem>(
            items: readonly T[] | Thenable<readonly T[]>,
            options?: vt.QuickPickOptions,
            token?: vt.CancellationToken
        ) => Thenable<T | undefined>
    ) //<

    showWarningMessage: //>
        ((
            message: string,
            ...items: (vt.MessageItem | string)[]
        ) => Thenable<vt.MessageItem | undefined>) &
        ((
            message: string,
            options: vt.MessageOptions,
            ...items: (vt.MessageItem | string)[]
        ) => Thenable<vt.MessageItem | undefined>) //<

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Internal                                                                                        │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘
    expectInputBoxAndReturn: ( //>
        returnValue?: string
    ) => void //<

    expectQuickPickAndReturn: ( //>
        expectedItems: any[],
        returnValue: any
    ) => void //<

    getLastInformationMessage: ( //>
    ) => string | undefined //<

    _reset: () => void //> //<

}
