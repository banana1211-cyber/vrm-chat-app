# VRM チャットアシスタント

React と Three.js を使用した、3D VRM キャラクターと会話できる Web アプリケーションです。AI による応答生成と音声合成機能を備えています。

## 機能

- 🎭 **3D VRM キャラクター表示**: Three.js と @pixiv/three-vrm を使用した VRM 1.0 モデルの表示
- 💬 **AI チャット**: Google Gemini API による自然な会話生成
- 🎤 **音声合成**: にじボイス API による日本語音声生成
- 👄 **リップシンク**: 音声再生中のキャラクターの口の動きをアニメーション
- 🎨 **美しい UI**: shadcn/ui と Tailwind CSS によるモダンなデザイン

## 技術スタック

- **フロントエンド**: React 18 + Vite
- **3D レンダリング**: Three.js + @pixiv/three-vrm 3.3.0
- **UI ライブラリ**: shadcn/ui (Radix UI + Tailwind CSS)
- **AI API**: Google Gemini API (gemini-2.0-flash-exp)
- **音声合成 API**: にじボイス API
- **アイコン**: lucide-react

## セットアップ手順

### 1. リポジトリのクローン

\`\`\`bash
git clone <your-repository-url>
cd vrm-chat-app
\`\`\`

### 2. 依存関係のインストール

\`\`\`bash
npm install
# または
pnpm install
# または
yarn install
\`\`\`

### 3. 環境変数の設定

\`.env.example\` をコピーして \`.env\` ファイルを作成します：

\`\`\`bash
cp .env.example .env
\`\`\`

\`.env\` ファイルを編集して、API キーを設定します：

\`\`\`env
VITE_OPENAI_API_KEY=your_gemini_api_key_here
VITE_NIJIVOICE_API_KEY=your_nijivoice_api_key_here
\`\`\`

#### API キーの取得方法

**Gemini API キー:**
1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. 「Create API Key」をクリック
3. 生成された API キーをコピー

**にじボイス API キー:**
1. [にじボイス プラットフォーム](https://nijivoice.com/) にアクセス
2. アカウントを作成してログイン
3. API セクションで API キーを生成

### 4. VRM モデルの配置

VRM 1.0 形式の 3D モデルを \`public/avatar.vrm\` に配置します。

VRM モデルは以下のサイトから入手できます：
- [VRoid Hub](https://hub.vroid.com/)
- [ニコニ立体](https://3d.nicovideo.jp/)
- [BOOTH](https://booth.pm/)

**注意**: モデルの利用規約を必ず確認してください。

### 5. 開発サーバーの起動

\`\`\`bash
npm run dev
# または
pnpm dev
# または
yarn dev
\`\`\`

ブラウザで [http://localhost:5173](http://localhost:5173) を開きます。

### 6. ビルド

\`\`\`bash
npm run build
# または
pnpm build
# または
yarn build
\`\`\`

## GitHub Pages へのデプロイ

### 1. GitHub リポジトリの作成

1. GitHub で新しいリポジトリを作成
2. ローカルリポジトリをプッシュ：

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
\`\`\`

### 2. GitHub Secrets の設定

1. リポジトリの「Settings」→「Secrets and variables」→「Actions」に移動
2. 以下の Secrets を追加：
   - \`VITE_OPENAI_API_KEY\`: Gemini API キー
   - \`VITE_NIJIVOICE_API_KEY\`: にじボイス API キー

### 3. GitHub Pages の有効化

1. リポジトリの「Settings」→「Pages」に移動
2. Source を「GitHub Actions」に設定

### 4. デプロイ

\`main\` ブランチにプッシュすると、自動的にデプロイされます：

\`\`\`bash
git add .
git commit -m "Update"
git push
\`\`\`

## プロジェクト構造

\`\`\`
vrm-chat-app/
├── public/
│   └── avatar.vrm              # VRM キャラクターモデル
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui コンポーネント
│   │   │   ├── button.jsx
│   │   │   ├── input.jsx
│   │   │   ├── card.jsx
│   │   │   └── scroll-area.jsx
│   │   └── VRMViewer.jsx       # 3D VRM ビューアー
│   ├── hooks/
│   │   ├── useGeminiChat.js    # Gemini API 統合
│   │   └── useNijiVoice.js     # にじボイス API 統合
│   ├── lib/
│   │   └── utils.js            # ユーティリティ関数
│   ├── App.jsx                 # メインコンポーネント
│   ├── App.css                 # スタイル
│   └── main.jsx                # エントリーポイント
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions デプロイ設定
├── .env.example                # 環境変数テンプレート
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
\`\`\`

## 使い方

1. **チャットの開始**: 画面右側の入力欄にメッセージを入力して送信
2. **音声の切り替え**: ヘッダーのスピーカーアイコンをクリックして音声の ON/OFF を切り替え
3. **チャットのクリア**: ヘッダーのゴミ箱アイコンをクリックして会話履歴をクリア
4. **キャラクターの観察**: 音声再生中、左側の 3D キャラクターの口が動きます

## カスタマイズ

### キャラクターの変更

\`public/avatar.vrm\` を別の VRM 1.0 モデルに置き換えます。

### 音声の変更

\`src/hooks/useNijiVoice.js\` の \`voice-actors\` ID を変更して、異なる声を使用できます：

\`\`\`javascript
const response = await fetch(
  'https://api.nijivoice.com/api/platform/v1/voice-actors/YOUR_VOICE_ACTOR_ID/generate-voice',
  // ...
)
\`\`\`

### UI のカスタマイズ

- \`src/App.jsx\`: レイアウトとコンポーネント構造
- \`src/App.css\`: Tailwind CSS 変数とスタイル
- \`tailwind.config.js\`: Tailwind テーマ設定

## トラブルシューティング

### VRM モデルが表示されない

- \`public/avatar.vrm\` ファイルが存在することを確認
- ブラウザのコンソールでエラーメッセージを確認
- VRM 1.0 形式であることを確認（VRM 0.x は変換が必要）

### API エラー

- \`.env\` ファイルに正しい API キーが設定されていることを確認
- API キーの有効期限とクォータを確認
- ブラウザのネットワークタブでリクエストの詳細を確認

### 音声が再生されない

- ブラウザの音声設定を確認
- にじボイス API のクォータを確認
- 音声が有効になっているか確認（ヘッダーのスピーカーアイコン）

## ライセンス

MIT License

## クレジット

- **VRM**: [VRM Consortium](https://vrm.dev/)
- **Three.js**: [Three.js](https://threejs.org/)
- **@pixiv/three-vrm**: [pixiv/three-vrm](https://github.com/pixiv/three-vrm)
- **Gemini API**: [Google AI](https://ai.google.dev/)
- **にじボイス**: [にじボイス](https://nijivoice.com/)
- **shadcn/ui**: [shadcn/ui](https://ui.shadcn.com/)
