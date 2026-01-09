import * as vscode from 'vscode';
import { openTerminalWithClaude, activateTerminal } from './terminalLauncher';

// 既に開いたワークスペースパスを追跡
const openedWorkspaces = new Set<string>();

export function activate(context: vscode.ExtensionContext) {
    console.log('Open Terminal Claude extension is now active');

    const disposable = vscode.commands.registerCommand('openTerminalClaude.open', async () => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder is open');
            return;
        }

        const config = vscode.workspace.getConfiguration('openTerminalClaude');
        const terminalApp = config.get<string>('terminalApp', 'Ghostty');
        const autoRunClaude = config.get<boolean>('autoRunClaudeCode', true);
        const workspacePath = workspaceFolder.uri.fsPath;

        try {
            if (openedWorkspaces.has(workspacePath)) {
                // 既に開いているプロジェクト → ターミナルをアクティブにするだけ
                await activateTerminal(terminalApp);
            } else {
                // 新しいプロジェクト → 新しいウィンドウを開く
                await openTerminalWithClaude(terminalApp, workspacePath, autoRunClaude);
                openedWorkspaces.add(workspacePath);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to open terminal: ${errorMessage}`);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
