import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

type TerminalApp = 'Ghostty' | 'iTerm' | 'Terminal' | 'Warp' | 'Alacritty' | 'Kitty';

interface TerminalConfig {
    appName: string;
    bundleId: string;
    getScript: (workspacePath: string, command: string) => string;
}

const terminalConfigs: Record<TerminalApp, TerminalConfig> = {
    Ghostty: {
        appName: 'Ghostty',
        bundleId: 'com.mitchellh.ghostty',
        getScript: (workspacePath: string, command: string) => `
            tell application "Ghostty"
                activate
            end tell
            delay 0.3
            tell application "System Events"
                tell process "Ghostty"
                    keystroke "n" using command down
                end tell
            end tell
            delay 0.5
            tell application "System Events"
                keystroke "cd ${escapeForAppleScript(workspacePath)}${command ? ` && ${command}` : ''}"
                keystroke return
            end tell
        `
    },
    iTerm: {
        appName: 'iTerm',
        bundleId: 'com.googlecode.iterm2',
        getScript: (workspacePath: string, command: string) => `
            tell application "iTerm"
                activate
                create window with default profile
                tell current session of current window
                    write text "cd ${escapeForAppleScript(workspacePath)}${command ? ` && ${command}` : ''}"
                end tell
            end tell
        `
    },
    Terminal: {
        appName: 'Terminal',
        bundleId: 'com.apple.Terminal',
        getScript: (workspacePath: string, command: string) => `
            tell application "Terminal"
                activate
                do script "cd ${escapeForAppleScript(workspacePath)}${command ? ` && ${command}` : ''}"
            end tell
        `
    },
    Warp: {
        appName: 'Warp',
        bundleId: 'dev.warp.Warp-Stable',
        getScript: (workspacePath: string, command: string) => `
            tell application "Warp"
                activate
            end tell
            delay 0.3
            tell application "System Events"
                tell process "Warp"
                    keystroke "n" using command down
                end tell
            end tell
            delay 0.5
            tell application "System Events"
                keystroke "cd ${escapeForAppleScript(workspacePath)}${command ? ` && ${command}` : ''}"
                keystroke return
            end tell
        `
    },
    Alacritty: {
        appName: 'Alacritty',
        bundleId: 'org.alacritty',
        getScript: (workspacePath: string, command: string) => `
            tell application "Alacritty"
                activate
            end tell
            delay 0.3
            tell application "System Events"
                tell process "Alacritty"
                    keystroke "n" using command down
                end tell
            end tell
            delay 0.5
            tell application "System Events"
                keystroke "cd ${escapeForAppleScript(workspacePath)}${command ? ` && ${command}` : ''}"
                keystroke return
            end tell
        `
    },
    Kitty: {
        appName: 'kitty',
        bundleId: 'net.kovidgoyal.kitty',
        getScript: (workspacePath: string, command: string) => `
            tell application "kitty"
                activate
            end tell
            delay 0.3
            tell application "System Events"
                tell process "kitty"
                    keystroke "n" using command down
                end tell
            end tell
            delay 0.5
            tell application "System Events"
                keystroke "cd ${escapeForAppleScript(workspacePath)}${command ? ` && ${command}` : ''}"
                keystroke return
            end tell
        `
    }
};

function escapeForAppleScript(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

async function runAppleScript(script: string): Promise<void> {
    const escapedScript = script.replace(/'/g, "'\"'\"'");
    await execAsync(`osascript -e '${escapedScript}'`);
}

export async function openTerminalWithClaude(
    terminalApp: string,
    workspacePath: string,
    autoRunClaude: boolean
): Promise<void> {
    const config = terminalConfigs[terminalApp as TerminalApp];

    if (!config) {
        throw new Error(`Unsupported terminal app: ${terminalApp}`);
    }

    const command = autoRunClaude ? 'claude' : '';
    const script = config.getScript(workspacePath, command);

    await runAppleScript(script);
}

export async function activateTerminal(terminalApp: string): Promise<void> {
    const config = terminalConfigs[terminalApp as TerminalApp];

    if (!config) {
        throw new Error(`Unsupported terminal app: ${terminalApp}`);
    }

    const script = `
        tell application "${config.appName}"
            activate
        end tell
    `;

    await runAppleScript(script);
}
