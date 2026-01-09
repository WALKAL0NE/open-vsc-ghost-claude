# Open Terminal with Claude Code - 開発仕様書

このファイルはClaude Codeがこのプロジェクトを理解するためのガイダンスを提供します。

## プロジェクト概要

VSCode拡張機能で、エディタのアイコンをクリックしてターミナルアプリを起動し、Claude Code CLIを自動実行します。

## 開発コマンド

| コマンド | 目的 |
|---------|------|
| `npm install` | 依存関係のインストール |
| `npm run compile` | TypeScriptコンパイル |
| `npm run watch` | ウォッチモード（ファイル変更監視） |
| `npm run package` | .vsixファイル生成 |

## ファイル構成

```
src/
├── extension.ts         # 拡張機能エントリーポイント
└── terminalLauncher.ts  # ターミナル起動ロジック

resources/
├── icon-light.svg       # ライトテーマ用アイコン
└── icon-dark.svg        # ダークテーマ用アイコン
```

## 主要コンポーネント

### extension.ts

- `activate()`: 拡張機能の初期化
- `openTerminalClaude.open`コマンドの登録
- ユーザー設定の読み込み（terminalApp, autoRunClaudeCode）
- ワークスペースパスの取得と検証

### terminalLauncher.ts

- `launchTerminal(terminalApp, workspacePath, autoRunClaude)`: メイン関数
- 各ターミナルアプリ用のAppleScript生成
- 対応ターミナル: Ghostty, iTerm2, Terminal, Warp, Alacritty, Kitty

## 設定項目

| 設定キー | 型 | デフォルト | 説明 |
|---------|---|----------|------|
| `openTerminalClaude.terminalApp` | string | "Ghostty" | 使用するターミナルアプリ |
| `openTerminalClaude.autoRunClaudeCode` | boolean | true | claude自動実行の有効化 |

## 実装上の注意点

### AppleScript

- macOS専用機能
- パス内の特殊文字（スペース、クォート）のエスケープが必要
- `keystroke`を使用したコマンド入力
- アプリケーションの起動状態チェック

### VSCode API

- `vscode.commands.registerCommand`: コマンド登録
- `vscode.workspace.workspaceFolders`: ワークスペース取得
- `vscode.workspace.getConfiguration`: 設定取得
- `vscode.window.showErrorMessage`: エラー表示

## 新しいターミナルアプリの追加方法

1. `terminalLauncher.ts`の`TERMINAL_SCRIPTS`に新しいAppleScriptを追加
2. `package.json`の`configuration.properties`に選択肢を追加
3. テスト実行

## プラットフォーム要件

- macOS専用（AppleScript使用）
- VSCode 1.85.0以上
- Node.js 20.x
- Claude Code CLIがインストール済み
