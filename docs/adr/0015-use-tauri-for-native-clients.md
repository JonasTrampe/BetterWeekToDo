# Use Tauri 2 for desktop and Android clients

BetterWeekToDo keeps its Vue browser application and shared domain/synchronization logic while using Tauri 2 as the native shell for Windows, Linux, macOS, and Android. Browser clients use web storage and cryptography adapters; native clients use SQLite and operating-system-protected key storage behind the same application interfaces. Electron-specific IPC, Node runtime, packaging, and updater code remain removed, reducing duplicated platform logic and native attack surface while preserving one product codebase.
