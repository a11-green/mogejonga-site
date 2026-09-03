# mogejonga-site
mogejonga on firebase用のリポジトリ

## URL
https://mogejonga-site.web.app/


## Deploy
GitHub上でPRを作成しmergeすると自動的に自動的にfirebaseにデプロイされる．
またPRを作成した時点でプレビュー用ページが作成される（URLは毎回異なる）．


コマンド例：
```
git checkout dev
～コード変更～
git add .
git commit -m "ほげほげ"
git push -u origin dev
```


## ページ構成

| ページ | パス | 概要 |
|--------|------|------|
| Home | `public/index.html` | トップページ |
| Data | `public/data/index.html` | 年を選択すると各ゲームのA卓・B卓の結果を一覧表示。Firestoreからリアルタイムに取得。 |
| Stats | `public/stats/index.html` | プレイヤー別の予選得点合計・着順分布を動的集計。Firestoreから全データを取得してブラウザで集計。 |
| Regulation | `public/regulation/index.html` | 大会ルール・レギュレーション（静的ページ） |
| Stats（旧） | `public/stats/archive.html` | 旧Statsページ（数値ハードコード版）。参照用にアーカイブ。 |

---

## データ追加手順

新しい大会の結果をサイトに反映する手順。

### 1. 生データCSVを用意する

`db/csv/data{YEAR}.csv` として配置する。  
YEARの命名規則: `2016`, `2017`, ..., `202205`（年4桁＋月2桁）, `202212`, `2023`, ...

CSVフォーマット（ヘッダーなし）:
```
year, game, groups, status, name, point
```

### 2. 前処理スクリプトを実行する

```bash
cd preprocess
python preprocess_csv.py
```

`db/csv/data{YEAR}_processed.csv` が生成される。  
前処理でランク（rank）・累計ポイント（cumsum）が付与される。

### 3. Firestoreにインポートする

`db/firestore/addCSV.js` の `YEARS` 配列に新しい年を追加する:

```js
const YEARS = [
  "2016", "2017", ..., "202412", "新しいYEAR",  // ← 追加
];
```

サービスアカウントキー（`db/firestore/mogejonga-site-firebase-adminsdk.json`）を配置した上で実行:

```bash
cd db/firestore
node addCSV.js
```

> **注意**: 実行すると `gameResult` コレクションを一度クリアして全年分を再インポートする。

### 4. Dataページのドロップダウンに追加する

`public/data/index.html` の `<select>` に新しい年のオプションを追加する:

```html
<option value="新しいYEAR">表示名</option>
```

> Statsページは Firestore のデータから年一覧を自動検出するため変更不要。

### 5. デプロイする

`main` ブランチにマージすると GitHub Actions が自動で Firebase Hosting にデプロイする。

---

## スクリプト説明

### `preprocess/preprocess_csv.py`

生データCSV（`db/csv/data{YEAR}.csv`）を読み込み、前処理済みCSV（`db/csv/data{YEAR}_processed.csv`）を生成するPythonスクリプト。

- 各ゲームの着順（rank）を計算
- プレイヤーごとの累計ポイント（cumsum）を計算

### `preprocess/get_vs_data.py`

対戦データを取得・集計するPythonスクリプト。

### `db/firestore/addCSV.js`

前処理済みCSVをFirestoreの `gameResult` コレクションにインポートするNode.jsスクリプト。

- 既存データを全件削除してから再インポート（冪等）
- 500件ごとのバッチ書き込みでFirestoreの制限に対応
- 依存: `firebase-admin`, `csv-parse`（`npm install` で導入）
- 必要なファイル: `db/firestore/mogejonga-site-firebase-adminsdk.json`（gitignore済み。Firebase Consoleから取得）

**Firestoreのデータ構造（`gameResult` コレクション）**:

| フィールド | 型 | 例 | 説明 |
|-----------|----|----|------|
| `year` | string | `"2021"` | 大会年 |
| `game` | number | `1` | ゲーム番号 |
| `groups` | string | `"A"` / `"B"` | 卓 |
| `status` | string | `"Q"` / `"SF"` / `"F"` | 予選 / セミファイナル / 決勝 |
| `name` | string | `"浅野"` | プレイヤー名 |
| `point` | number | `-17.5` | そのゲームのポイント |
| `rank` | number | `3` | 着順（1〜4） |

> `cumsum`（累計）はCSVには含まれるがFirestoreには格納しない。フロントエンドで必要な場合は都度計算する。

---

## Reference
### Hosting
- [Firebase公式のGitHubとHostingのインテグレーションが熱い](https://zenn.dev/watarukun/articles/8f3e318bacf97cabf879)
- [GitHub Actionsの編集ができなくなったときの対応方法 (トークン認証の設定方法)](https://qiita.com/kter/items/84f3ece9a41a2bec535f)
  - [mac キーチェーンアクセスが削除できないときの対処法](https://took.jp/mac-keychain/)
- [FirestoreにCSVをImportする方法](https://orangelog.site/firebase/firestore-csv-import/)
- [Firebase Cloud Firestoreの使い方](https://qiita.com/subaru44k/items/a88e638333b8d5cc29f2)

### html, js
- [javascriptでテーブルの行を追加する方法](https://shanabrian.com/web/javascript/table-insertrow.php)
- [js node 実行時エラー　ERR_PACKAGE_PATH_NOT_EXPORTED](https://teratail.com/questions/4rwqp3rtv6ev0b)

### Database
- [PlanetScaleというサーバレスDBが凄く勢いのあるサービスらしいのでQuick Startやってみた](https://qiita.com/tak001/items/cfbaa9dcb542929ff235)

### GAS
- [Google スプレッドシートのデータを JS で fetch したい！](https://qiita.com/otchy/items/9acf845314e06c9971bc)
- [第15回.複数のスプレッドシートを扱う](https://excel-ubara.com/apps_script1/GAS015.html)

### git, github
- [SSHでpush](https://qiita.com/uki66/items/d6e13c4e160071458f3a)
- [公開鍵認証](https://qiita.com/shizuma/items/2b2f873a0034839e47ce)
  - [github/鍵の設定](https://github.com/settings/keys)  