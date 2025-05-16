
export enum LogLevel { //>
	Off = 0,
	Trace = 1,
	Debug = 2,
	Info = 3,
	Warning = 4,
	Error = 5,
} //<

export enum FileType { //>
	Unknown = 0,
	File = 1,
	Directory = 2,
	SymbolicLink = 64,
} //<

export enum TextEditorRevealType { //>
	Default = 0,
	InCenter = 1,
	InCenterIfOutsideViewport = 2,
	AtTop = 3,
} //<

export enum EndOfLine { //>
	LF = 1,
	CRLF = 2,
} //<

export enum TextDocumentSaveReason { //>
	Manual = 1,
	AfterDelay = 2,
	FocusOut = 3,
	WindowChange = 4, // Added based on potential usage
} //<

export enum ViewColumn { //>
	One = 1,
	Two = 2,
	Three = 3,
	Four = 4,
	Five = 5,
	Six = 6,
	Seven = 7,
	Eight = 8,
	Nine = 9,
	Active = -1,
	Beside = -2,
} //<

export enum StatusBarAlignment { //>
	Left = 1,
	Right = 2,
} //<

export enum ConfigurationTarget { //>
	Global = 1,
	Workspace = 2,
	WorkspaceFolder = 3,
} //<

export enum DiagnosticSeverity { //>
	Error = 0,
	Warning = 1,
	Information = 2,
	Hint = 3,
} //<

export enum QuickPickItemKind { //>
	Separator = -1,
	Default = 0,
} //<

export enum ProgressLocation { //>
	SourceControl = 1,
	Window = 10,
	Notification = 15,
} //<

export enum TreeItemCollapsibleState { //>
	None = 0,
	Collapsed = 1,
	Expanded = 2,
} //<

export enum UIKind { //>
	Desktop = 1,
	Web = 2,
} //<

export enum ExtensionKind { //>
	UI = 1,
	Workspace = 2,
} //<

export enum TerminalLocation { //>
	Panel = 1,
	Editor = 2,
} //<

export enum WindowState { //>
	/** The window has focus. */
	Focused = 1,
	/** The window is not focused. */
	Unfocused = 2,
} //<

export enum TextDocumentChangeReason { //>
	/** The text change is caused by an undo operation. */
	Undo = 1,
	/** The text change is caused by a redo operation. */
	Redo = 2,
} //<

export enum ColorThemeKind { //>
	Light = 1,
	Dark = 2,
	HighContrast = 3,
	HighContrastLight = 4,
} //<
