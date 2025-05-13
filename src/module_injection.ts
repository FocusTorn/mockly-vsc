// ESLint & Imports -->>

//= TSYRINGE ==================================================================================================
import 'reflect-metadata'
import { container } from 'tsyringe'

//= VSCODE TYPES & MOCKED INTERNALS ===========================================================================
import { URI as vUri } from 'vscode-uri'

//= INJECTED TYPES ============================================================================================
import type { IVSCodeAPISimulatorService } from './core/_interfaces/IVSCodeAPISimulatorService.ts'
import type { IEventBusService } from './core/_interfaces/IEventBusService.ts'
import type { ICoreUtilitiesService } from './core/_interfaces/ICoreUtilitiesService.ts'
import type { ICommandsModule } from './modules/commands/_interfaces/ICommandsModule.ts'
import type { ICommandsNamespace } from './modules/commands/_interfaces/ICommandsNamespace.ts'
import type { ICommandsService } from './modules/commands/_interfaces/ICommandsService.ts'
import type { IEnvModule } from './modules/env/_interfaces/IEnvModule.ts'
import type { IEnvNamespace } from './modules/env/_interfaces/IEnvNamespace.ts'
import type { IEnvService } from './modules/env/_interfaces/IEnvService.ts'
import type { IExtensionsModule } from './modules/extensions/_interfaces/IExtensionsModule.ts'
import type { IExtensionsNamespace } from './modules/extensions/_interfaces/IExtensionsNamespace.ts'
import type { IExtensionsService } from './modules/extensions/_interfaces/IExtensionsService.ts'
import type { IFileSystemModule } from './modules/fileSystem/_interfaces/IFileSystemModule.ts'
import type { IFileSystemService } from './modules/fileSystem/_interfaces/IFileSystemService.ts'
import type { IFileSystemStateService } from './modules/fileSystem/_interfaces/IFileSystemStateService.ts'
import type { IMockNodePathService } from './modules/fileSystem/_interfaces/IMockNodePathService.ts'
import type { IUriService } from './modules/fileSystem/_interfaces/IUriService.ts'
import type { IWindowModule } from './modules/window/_interfaces/IWindowModule.ts'
import type { IWindowNamespace } from './modules/window/_interfaces/IWindowNamespace.ts'
import type { IOutputChannelService } from './modules/window/_interfaces/IOutputChannelService.ts'
import type { ITerminalService } from './modules/window/_interfaces/ITerminalService.ts'
import type { ITextEditorService } from './modules/window/_interfaces/ITextEditorService.ts'
import type { IUserInteractionService } from './modules/window/_interfaces/IUserInteractionService.ts'
import type { IWorkspaceModule } from './modules/workspace/_interfaces/IWorkspaceModule.ts'
import type { IWorkspaceNamespace } from './modules/workspace/_interfaces/IWorkspaceNamespace.ts'
import type { ITextDocumentService } from './modules/workspace/_interfaces/ITextDocumentService.ts'
import type { IWorkspaceStateService } from './modules/workspace/_interfaces/IWorkspaceStateService.ts'
import type { INodeFsService } from './modules/nodeFs/_interfaces/INodeFsService.ts'

//= IMPLEMENTATIONS ===========================================================================================
import { VSCodeAPISimulatorService } from './core/implementations/vscodeAPISimulatorService.ts'
import { EventBusService } from './core/implementations/eventBus.service.ts'
import { CoreUtilitiesService } from './core/implementations/coreUtilities.service.ts'
import { CommandsModule } from './modules/commands/implementations/commands.module.ts'
import { CommandsNamespace } from './modules/commands/implementations/commandsNamespace.ts'
import { CommandsService } from './modules/commands/services/commands.service.ts'
import { EnvModule } from './modules/env/implementations/env.module.ts'
import { EnvNamespace } from './modules/env/implementations/envNamespace.ts'
import { EnvService } from './modules/env/services/env.service.ts'
import { ExtensionsModule } from './modules/extensions/implementations/extensions.module.ts'
import { ExtensionsNamespace } from './modules/extensions/implementations/extensionsNamespace.ts'
import { ExtensionsService } from './modules/extensions/services/extensions.service.ts'
import { FileSystemModule } from './modules/fileSystem/implementations/fileSystem.module.ts'
import { FileSystemService } from './modules/fileSystem/services/fileSystem.service.ts'
import { FileSystemStateService } from './modules/fileSystem/services/fileSystemState.service.ts'
import { NodePathService } from './modules/fileSystem/services/nodePath.service.ts'
import { UriService } from './modules/fileSystem/services/uri.service.ts'
import { WindowModule } from './modules/window/implementations/window.module.ts'
import { WindowNamespace } from './modules/window/windowNamespace.ts'
import { OutputChannelService } from './modules/window/services/outputChannel.service.ts'
import { TerminalService } from './modules/window/services/terminal.service.ts'
import { TextEditorService } from './modules/window/services/textEditor.service.ts'
import { UserInteractionService } from './modules/window/services/userInteraction.service.ts'
import { WorkspaceModule } from './modules/workspace/implementations/workspace.module.ts'
import { WorkspaceNamespace } from './modules/workspace/implementations/workspaceNamespace.ts'
import { TextDocumentService } from './modules/workspace/services/textDocument.service.ts'
import { WorkspaceStateService } from './modules/workspace/services/workspaceState.service.ts'
import { NodeFsService } from './modules/nodeFs/services/nodeFs.service.ts'

//--------------------------------------------------------------------------------------------------------------<<

// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
// │  CORE SERVICES                                                                                   │
// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

container.registerSingleton<ICoreUtilitiesService>('ICoreUtilitiesService', CoreUtilitiesService)
container.registerSingleton<IEventBusService>('IEventBusService', EventBusService)

// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
// │  FILE SYSTEM                                                                                     │
// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

container.registerSingleton<IMockNodePathService>('IMockNodePathService', NodePathService)
container.registerSingleton<IFileSystemStateService>('IFileSystemStateService', FileSystemStateService)
container.registerSingleton<IUriService>('IUriService', UriService)
container.registerSingleton<IFileSystemService>('IFileSystemService', FileSystemService)

container.registerSingleton<IFileSystemModule>('IFileSystemModule', FileSystemModule)

// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
// │  NODE FS (Mock of Node.js 'fs')                                                                  │
// └──────────────────────────────────────────────────────────────────────────────────────────────────┘
container.registerSingleton<INodeFsService>('INodeFsService', NodeFsService)

// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
// │  WORKSPACE                                                                                       │
// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

container.registerSingleton<IWorkspaceStateService>('IWorkspaceStateService', WorkspaceStateService)
container.registerSingleton<ITextDocumentService>('ITextDocumentService', TextDocumentService)
// FileSystemUtilityService registration removed

container.registerSingleton<IWorkspaceNamespace>('IWorkspaceNamespace', WorkspaceNamespace)
container.registerSingleton<IWorkspaceModule>('IWorkspaceModule', WorkspaceModule)

// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
// │  WINDOW                                                                                          │
// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

container.registerSingleton<IUserInteractionService>('IUserInteractionService', UserInteractionService)
container.registerSingleton<ITextEditorService>('ITextEditorService', TextEditorService)
container.registerSingleton<ITerminalService>('ITerminalService', TerminalService)
container.registerSingleton<IOutputChannelService>('IOutputChannelService', OutputChannelService)

container.registerSingleton<IWindowNamespace>('IWindowNamespace', WindowNamespace)
container.registerSingleton<IWindowModule>('IWindowModule', WindowModule)

// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
// │  COMMANDS                                                                                        │
// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

container.registerSingleton<ICommandsService>('ICommandsService', CommandsService)

container.registerSingleton<ICommandsNamespace>('ICommandsNamespace', CommandsNamespace)
container.registerSingleton<ICommandsModule>('ICommandsModule', CommandsModule)

// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
// │  ENV                                                                                             │
// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

container.registerSingleton<IEnvService>('IEnvService', EnvService)

container.registerSingleton<IEnvNamespace>('IEnvNamespace', EnvNamespace)
container.registerSingleton<IEnvModule>('IEnvModule', EnvModule)

// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
// │  EXTENSIONS                                                                                      │
// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

container.registerSingleton<IExtensionsService>('IExtensionsService', ExtensionsService)

container.registerSingleton<IExtensionsNamespace>('IExtensionsNamespace', ExtensionsNamespace)
container.registerSingleton<IExtensionsModule>('IExtensionsModule', ExtensionsModule)

// ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
// │  SINGLE                                                                                          │
// └──────────────────────────────────────────────────────────────────────────────────────────────────┘

container.registerSingleton<IVSCodeAPISimulatorService>('IVSCodeAPISimulatorService', VSCodeAPISimulatorService)
container.register('Uri', { useValue: vUri })

// Export the configured container
export { container }