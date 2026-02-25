---
title: "R16-1: 画面一覧・API一覧の最終更新"
description: "Phase 2-3 で追加した仕様書を一覧インデックスに反映"
---

あなたは OpsHub の設計ドキュメント担当です。
Phase 2-3 で追加された仕様書を、一覧インデックスファイルとサイドバーに反映してください。

## 対象ファイル

1. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/requirements/screens/index.md
2. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/screens/index.md
3. /home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/spec/apis/index.md
4. /home/garchomp-game/workspace/starlight-test/opsHub-doc/astro.config.mjs

## 追加すべきエントリ

### 画面仕様一覧 (spec/screens/index.md)
| 画面ID | 画面名称 | REQ |
|---|---|---|
| SCR-D03 | 経費集計 | REQ-D02 |
| SCR-F01 | ドキュメント管理 | REQ-F01 |
| SCR-G02 | 全文検索 | REQ-G02 |
| SCR-H01 | 請求一覧 | REQ-E01 |
| SCR-H02 | 請求書詳細/編集 | REQ-E01 |

### API仕様一覧 (spec/apis/index.md)
| API ID | API名称 | REQ |
|---|---|---|
| API-D02 | 経費集計API | REQ-D02 |
| API-F01 | ドキュメント管理API | REQ-F01 |
| API-G01 | 全文検索API | REQ-G02 |
| API-H01 | 請求API | REQ-E01 |

### 画面定義 (requirements/screens/index.md)
まず現在のファイルを読んで、Phase 2 の SCR-D03、Phase 3 の SCR-F01, SCR-G02, SCR-H01, SCR-H02 が欠けていないか確認し、不足分を追加。

### サイドバー (astro.config.mjs)
仕様書セクションに新規ファイルが表示されるよう確認。autogenerate を使っている場合は追加不要。手動リストの場合は追加。

## 手順

1. 各ファイルを読む
2. 既存のエントリを確認し、重複しないように追加
3. 一覧の採番順・Epic順にソート
4. ビルド確認

## 検証

```
cd /home/garchomp-game/workspace/starlight-test/opsHub-doc && npm run build
```

## ウォークスルー出力先

/home/garchomp-game/workspace/starlight-test/opsHub-doc/src/content/docs/logs/walkthroughs/r16-1-index-updates.md
