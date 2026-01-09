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
            set needsCommand to false
            tell application "System Events"
                if not (exists process "Ghostty") then
                    set needsCommand to true
                else
                    tell process "Ghostty"
                        if (count of windows) = 0 then
                            set needsCommand to true
                        end if
                    end tell
                end if
            end tell
            tell application "Ghostty"
                activate
            end tell
            if needsCommand then
                delay 0.5
                tell application "System Events"
                    tell process "Ghostty"
                        if (count of windows) = 0 then
                            keystroke "n" using command down
                            delay 0.5
                        end if
                    end tell
                    keystroke "cd ${escapeForAppleScript(workspacePath)}${command ? ` && ${command}` : ''}"
                    keystroke return
                end tell
            end if
        `
    },
    iTerm: {
        appName: 'iTerm',
        bundleId: 'com.googlecode.iterm2',
        getScript: (workspacePath: string, command: string) => `
            tell application "iTerm"
                activate
                if (count of windows) = 0 then
                    create window with default profile
                    tell current session of current window
                        write text "cd ${escapeForAppleScript(workspacePath)}${command ? ` && ${command}` : ''}"
                    end tell
                end if
            end tell
        `
    },
    Terminal: {
        appName: 'Terminal',
        bundleId: 'com.apple.Terminal',
        getScript: (workspacePath: string, command: string) => `
            tell application "Terminal"
                activate
                if (count of windows) = 0 then
                    do script "cd ${escapeForAppleScript(workspacePath)}${command ? ` && ${command}` : ''}"
                end if
            end tell
        `
    },
    Warp: {
        appName: 'Warp',
        bundleId: 'dev.warp.Warp-Stable',
        getScript: (workspacePath: string, command: string) => `
            set needsCommand to false
            tell application "System Events"
                if not (exists process "Warp") then
                    set needsCommand to true
                else
                    tell process "Warp"
                        if (count of windows) = 0 then
                            set needsCommand to true
                        end if
                    end tell
                end if
            end tell
            tell application "Warp"
                activate
            end tell
            if needsCommand then
                delay 0.5
                tell application "System Events"
                    keystroke "cd ${escapeForAppleScript(workspacePath)}${command ? ` && ${command}` : ''}"
                    keystroke return
                end tell
            end if
        `
    },
    Alacritty: {
        appName: 'Alacritty',
        bundleId: 'org.alacritty',
        getScript: (workspacePath: string, command: string) => `
            set needsCommand to false
            tell application "System Events"
                if not (exists process "Alacritty") then
                    set needsCommand to true
                else
                    tell process "Alacritty"
                        if (count of windows) = 0 then
                            set needsCommand to true
                        end if
                    end tell
                end if
            end tell
            tell application "Alacritty"
                activate
            end tell
            if needsCommand then
                delay 0.5
                tell application "System Events"
                    keystroke "cd ${escapeForAppleScript(workspacePath)}${command ? ` && ${command}` : ''}"
                    keystroke return
                end tell
            end if
        `
    },
    Kitty: {
        appName: 'kitty',
        bundleId: 'net.kovidgoyal.kitty',
        getScript: (workspacePath: string, command: string) => `
            set needsCommand to false
            tell application "System Events"
                if not (exists process "kitty") then
                    set needsCommand to true
                else
                    tell process "kitty"
                        if (count of windows) = 0 then
                            set needsCommand to true
                        end if
                    end tell
                end if
            end tell
            tell application "kitty"
                activate
            end tell
            if needsCommand then
                delay 0.5
                tell application "System Events"
                    keystroke "cd ${escapeForAppleScript(workspacePath)}${command ? ` && ${command}` : ''}"
                    keystroke return
                end tell
            end if
        `
    }
};

function escapeForAppleScript(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

async function isAppRunning(bundleId: string): Promise<boolean> {
    try {
        const script = `tell application "System Events" to (name of processes) contains "${bundleId.split('.').pop()}"`;
        const { stdout } = await execAsync(`osascript -e '${script}'`);
        return stdout.trim() === 'true';
    } catch {
        return false;
    }
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
