// ESLint & Imports --------->>

import { injectable, inject, singleton } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import type * as vt from 'vscode'
import { LogLevel } from '../../../_vscCore/vscEnums.ts'

//= INJECTED TYPES ============================================================================================
import type { ICoreUtilitiesService } from '../../../core/_interfaces/ICoreUtilitiesService.ts'

//= IMPLEMENTATION TYPES ======================================================================================
import type { IUserInteractionService } from '../_interfaces/IUserInteractionService.ts'

//--------------------------------------------------------------------------------------------------------------<<

@injectable()
@singleton()
export class UserInteractionService implements IUserInteractionService {

    private _lastInfoMessage: string | undefined = undefined
    private _quickPickQueue: { //>
        items: any[]
        options?: vt.QuickPickOptions
        resolve: (value: any | undefined) => void
        returnValue: any | undefined
    }[] = [] //<
    private _inputBoxQueue: { //>
        options?: vt.InputBoxOptions
        resolve: (value: string | undefined) => void
        returnValue: any | undefined
    }[] = [] //<

    // TODO Eavluate the Queue Resolution: The _quickPickQueue and _inputBoxQueue store resolve functions, but the showQuickPick and showInputBox methods resolve the promises immediately upon being called if a queued value exists, rather than using the stored resolve function to control the timing. This means tests using expect...AndReturn cannot control when the user interaction promise resolves, which might be a bug depending on the intended mocking behavior.
    
    constructor(
        @inject('ICoreUtilitiesService') private utils: ICoreUtilitiesService,
    ) { }

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Methods                                                                                         │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    showErrorMessage( //>
        message: string,
        ..._args: any[]
    ): Thenable<any | undefined> {
        this.utils.log(LogLevel.Error, `[UI MOCK] Error Message: ${message}`)

        // TODO: Handle modal options and items

        return Promise.resolve(undefined)
    } //<

    showInformationMessage( //>
        message: string,
        ...args: any[]
    ): Thenable<any | undefined> {
        this.utils.log(LogLevel.Info, `[UI MOCK] Info Message: ${message}`)
        this._lastInfoMessage = message

        // TODO: Handle modal options and return selected item if applicable
        let options: vt.MessageOptions | undefined
        let items: (vt.MessageItem | string)[] = []
        if (args.length > 0) {
            if (typeof args[0] === 'object' && args[0] !== null && ('modal' in args[0] || 'detail' in args[0])) {

                // eslint-disable-next-line unused-imports/no-unused-vars
                options = args.shift() as vt.MessageOptions
            }

            // eslint-disable-next-line unused-imports/no-unused-vars
            items = args as (vt.MessageItem | string)[]
        }

        // For now, always resolve undefined
        return Promise.resolve(undefined)
    } //<

    showInputBox( //>
        options?: vt.InputBoxOptions,
        _token?: vt.CancellationToken,
    ): Thenable<string | undefined> {
        this.utils.log(LogLevel.Info, `[UI MOCK] Input Box Shown (options: ${JSON.stringify(options)})`)
        // Check if there's a queued response
        if (this._inputBoxQueue.length > 0) {
            const queued = this._inputBoxQueue.shift()!
            // TODO: Optionally validate options match the expectation?
            this.utils.log(LogLevel.Debug, `[UI MOCK] Resolving Input Box with queued value: ${queued.returnValue}`)
            return Promise.resolve(queued.returnValue)
        }
        // Default behavior: resolve undefined immediately
        this.utils.log(LogLevel.Warning, `[UI MOCK] No queued response for Input Box, resolving undefined. Use expectInputBoxAndReturn() to provide a value.`)
        return Promise.resolve(undefined)
    } //<

    showQuickPick( //>
        items: readonly string[] | Thenable<readonly string[]>,
        options?: vt.QuickPickOptions,
        token?: vt.CancellationToken
    ): Thenable<string | undefined>
    showQuickPick<T extends vt.QuickPickItem>(
        items: readonly T[] | Thenable<readonly T[]>,
        options?: vt.QuickPickOptions,
        token?: vt.CancellationToken
    ): Thenable<T | undefined>
    showQuickPick(
        _items: any,
        options?: vt.QuickPickOptions,
        _token?: vt.CancellationToken,
    ): Thenable<any | undefined> {
        this.utils.log(LogLevel.Info, `[UI MOCK] Quick Pick Shown (options: ${JSON.stringify(options)})`)
        if (this._quickPickQueue.length > 0) {
            const queued = this._quickPickQueue.shift()!
            // TODO: Optionally validate items/options match the expectation?
            this.utils.log(LogLevel.Debug, `[UI MOCK] Resolving Quick Pick with queued value: ${JSON.stringify(queued.returnValue)}`)
            return Promise.resolve(queued.returnValue)
        }

        this.utils.log(LogLevel.Warning, `[UI MOCK] No queued response for Quick Pick, resolving undefined. Use expectQuickPickAndReturn() to provide a value.`)
        return Promise.resolve(undefined)
    } //<

    showWarningMessage( //>
        message: string,
        ..._args: any[]
    ): Thenable<any | undefined> {
        this.utils.log(LogLevel.Warning, `[UI MOCK] Warning Message: ${message}`)

        // TODO: Handle modal options and items
        return Promise.resolve(undefined)
    } //<

    // ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
    // │  Internal                                                                                        │
    // └──────────────────────────────────────────────────────────────────────────────────────────────────┘

    expectInputBoxAndReturn( //>
        returnValue?: string | undefined,
    ): void {
        this.utils.log(LogLevel.Debug, `[UI MOCK] Queuing Input Box response: ${returnValue}`)
        this._inputBoxQueue.push({ resolve: (_val) => { }, returnValue })
    } //<

    expectQuickPickAndReturn( //>
        expectedItems: any[],
        returnValue: any,
    ): void {
        this.utils.log(LogLevel.Debug, `[UI MOCK] Queuing Quick Pick response: ${JSON.stringify(returnValue)}`)
        this._quickPickQueue.push({ items: expectedItems, resolve: (_val) => { }, returnValue })
    } //<

    getLastInformationMessage(): string | undefined { //>
        return this._lastInfoMessage
    } //<

    _reset(): void { //>
        this.utils.log(LogLevel.Debug, 'Resetting UserInteractionService state...')
        this._lastInfoMessage = undefined
        this._quickPickQueue = []
        this._inputBoxQueue = []
    } //<
}
