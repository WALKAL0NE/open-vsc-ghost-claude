# Open Terminal with Claude Code

VSCode拡張機能 - アイコンをクリックして、お好みのターミナルアプリでClaude Codeを自動起動します。

## 機能

- エディタタイトルバーのアイコンをクリックして、ターミナルを起動
- 現在のワークスペースディレクトリで`claude`コマンドを自動実行
- 複数のターミナルアプリに対応:
  - Ghostty
  - iTerm2
  - Terminal.app (macOS標準)
  - Warp
  - Alacritty
  - Kitty
- 既にターミナルが開いている場合は、新規ウィンドウを開かずにそちらにフォーカス

## 設定

VSCodeの設定から以下のオプションを変更できます:

- `openTerminalClaude.terminalApp`: 使用するターミナルアプリ（デフォルト: Ghostty）
- `openTerminalClaude.autoRunClaudeCode`: ターミナル起動時に自動で`claude`コマンドを実行するか（デフォルト: true）

## 開発

```bash
# 依存関係のインストール
npm install

# コンパイル
npm run compile

# 監視モード
npm run watch

# パッケージング
npm run package
```

## インストール

### 開発版としてインストール

1. `npm run compile` でビルド
2. VSCodeで `F5` を押して拡張機能開発ホストを起動

### VSIXファイルからインストール

1. `npm run package` で `.vsix` ファイルを生成
2. VSCodeで `Extensions: Install from VSIX...` コマンドを実行

## 必要条件

- macOS（AppleScriptを使用するため）
- 使用するターミナルアプリがインストールされていること
- Claude Code CLIがインストールされていること（`claude`コマンドが使用可能）

## 技術スタック

- **言語:** TypeScript 5.3.0
- **実行環境:** Node.js 20.x
- **IDE API:** VSCode 1.85.0以上
- **ターミナル制御:** AppleScript（macOS専用）

## アーキテクチャ

```
src/
├── extension.ts         # VSCode拡張機能のエントリーポイント
└── terminalLauncher.ts  # ターミナル起動ロジック（AppleScript）

resources/
├── icon-light.svg       # ライトテーマ用アイコン
└── icon-dark.svg        # ダークテーマ用アイコン
```

### 動作原理

1. VSCodeエディタのタイトルバーにアイコンボタンを表示
2. クリック時に選択したターミナルアプリをAppleScriptで起動
3. 現在のワークスペースディレクトリに`cd`
4. `claude`コマンドを自動実行（オプション）

## ライセンス

MIT
# open-vsc-ghost-claude
