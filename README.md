# 📸 Sales Studio (AI画像加工アプリ)

商品画像の「背景」をAIで自動削除し、ECサイト（Amazon/メルカリ）向けの「白背景画像」を一瞬で作成するWebアプリケーションです。

## ✨ 特徴
*   **AI自動切り抜き**: `rembg` を使用し、高精度に背景を削除。
*   **白背景合成**: 透明背景ではなく、ECサイト推奨の「白背景」に自動加工。
*   **モダンなUI**: React + Chakra UI による、スマホアプリのような操作感。

## 🛠 技術スタック

### Frontend
*   React (TypeScript)
*   Vite
*   Chakra UI
*   Axios

### Backend
*   Python 3.9
*   FastAPI
*   rembg (AI)
*   Pillow (画像処理)

## 📁 構成
このリポジトリはモノレポ構成（フロント・バックエンド同居）です。

*   `frontend/`: Reactアプリケーション
*   `backend/`: FastAPIサーバー