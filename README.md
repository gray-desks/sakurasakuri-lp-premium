# さくらさくり LP — Premium（別パターン）

「さくらさくり」（YiEM SHOP）のランディングページ **リニューアル提案・別パターン** です。
スマートフォン表示をメインに、**3D（WebGL / Three.js）** で桜吹雪と金粉が舞う没入空間を表現し、
和モダン × ラグジュアリーの世界観で「豪華さ」を狙いました。

## 公開URL

GitHub Pages: https://gray-desks.github.io/sakurasakuri-lp-premium/

## 既存パターンとの違い

| | 既存パターン (`sakurasakuri-lp`) | 本パターン (`-premium`) |
|---|---|---|
| 演出技術 | CSS の花びら降下アニメ | **3D / WebGL（Three.js）** |
| 背景 | 平面 | 全面固定の3D空間（奥行き・被写界・ライティング） |
| インタラクション | スクロールのみ | スクロール・端末の傾き・指の動きに視点が呼応 |
| 世界観 | 桜 × 抹茶 | 桜 × 和モダン × 金（昇華） |

## 特徴

- **3D 桜吹雪** — InstancedMesh による花びらが奥行きをもって舞う
- **金粉パーティクル** — 加算合成で上品な煌めき
- **視点の呼応** — スクロールで沈み込み、端末の傾き・ポインタで視差
- **モバイル最適化** — 端末性能に応じて花びら数を自動調整、`prefers-reduced-motion` 対応、非表示タブで描画停止
- **スクロール演出** — IntersectionObserver による段階的フェードイン

## 技術

- HTML / CSS（フレームワークなし）
- [Three.js](https://threejs.org/) r160（CDN / importmap）
- フォント: Shippori Mincho B1 / Zen Kaku Gothic New / Cormorant Garamond

## ローカル確認

```bash
python3 -m http.server 8765
# → http://localhost:8765/
```

## ディレクトリ

```
.
├── index.html          # 本体
├── css/style.css       # スタイル（和モダン・モバイルファースト）
├── js/scene.js         # Three.js 3Dシーン
└── assets/img/         # 商品画像
```

---

※ 本ページはデザイン提案用のリニューアル案です。商品画像・ブランドは YiEM SHOP に帰属します。
価格・仕様は提案時点の参考値であり、最新情報は[公式ストア](https://yiemshop.com/collections/sakurasakuri)をご確認ください。
