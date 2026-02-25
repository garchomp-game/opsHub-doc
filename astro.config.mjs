// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
	markdown: {
		syntaxHighlight: {
			excludeLangs: ['mermaid'],
		},
	},
	integrations: [
		starlight({
			title: 'OpsHub Docs',
			defaultLocale: 'root',
			locales: {
				root: { label: '日本語', lang: 'ja' },
			},
			sidebar: [
				{ label: 'START HERE', link: '/start-here/' },
				{
					label: '🚀 キャッチアップ',
					items: [
						{ label: '設計の要点（5つの軸）', link: '/catchup/design-pillars/' },
						{ label: '用語集', link: '/catchup/glossary/' },
						{ label: '混同しやすいポイント', link: '/catchup/confusion-points/' },
					],
				},
				{ label: '規約 (Conventions)', link: '/conventions/' },
				{
					label: '📘 ガイド (Guides)',
					items: [
						{ label: 'マルチエージェント開発', link: '/guides/multi-agent-workflow/' },
						{ label: 'Supabase クライアント (Archive)', link: '/guides/supabase-client/' },
					],
				},
				{
					label: '要件定義 (Requirements)',
					items: [
						{ label: '目次', link: '/requirements/' },
						{ label: 'プロジェクト概要', link: '/requirements/project-brief/' },
						{ label: 'ロール/権限', link: '/requirements/roles/' },
						{ label: 'REQ カタログ', link: '/requirements/req-catalog/' },
						{ label: '非機能要件 (NFR)', link: '/requirements/nfr/' },
						{ label: '画面一覧', link: '/requirements/screens/' },
					],
				},
				{
					label: '基本設計 (Spec)',
					items: [
						{ label: '目次', link: '/spec/' },
						{ label: 'アーキテクチャ概要', link: '/spec/architecture/' },
						{ label: '権限と認可', link: '/spec/authz/' },
						{ label: 'UIレイアウト設計', link: '/spec/ui-layout/' },
						{
							label: '画面仕様',
							collapsed: true,
							items: [
								{ label: '📋 一覧', link: '/spec/screens/' },
								{ label: 'SCR-001 ログイン', link: '/spec/screens/scr-001/' },
								{ label: 'SCR-002 ダッシュボード', link: '/spec/screens/scr-002/' },
								{ label: 'SCR-A01 テナント管理', link: '/spec/screens/scr-a01/' },
								{ label: 'SCR-A02 ユーザー管理', link: '/spec/screens/scr-a02/' },
								{ label: 'SCR-B01 申請一覧', link: '/spec/screens/scr-b01/' },
								{ label: 'SCR-B02 申請作成', link: '/spec/screens/scr-b02/' },
								{ label: 'SCR-B03 申請詳細/承認', link: '/spec/screens/scr-b03/' },
								{ label: 'SCR-C01-1 PJ一覧', link: '/spec/screens/scr-c01-1/' },
								{ label: 'SCR-C01-2 PJ詳細', link: '/spec/screens/scr-c01-2/' },
								{ label: 'SCR-C02 タスク管理', link: '/spec/screens/scr-c02/' },
								{ label: 'SCR-C03-1 工数入力', link: '/spec/screens/scr-c03-1/' },
								{ label: 'SCR-C03-2 工数集計', link: '/spec/screens/scr-c03-2/' },
								{ label: 'SCR-D01 経費管理', link: '/spec/screens/scr-d01/' },
								{ label: 'SCR-D03 経費集計', link: '/spec/screens/scr-d03/' },
								{ label: 'SCR-E01 通知システム', link: '/spec/screens/scr-e01/' },
								{ label: 'SCR-F01 ドキュメント管理', link: '/spec/screens/scr-f01/' },
								{ label: 'SCR-G02 全文検索', link: '/spec/screens/scr-g02/' },
								{ label: 'SCR-H01 請求一覧', link: '/spec/screens/scr-h01/' },
								{ label: 'SCR-H02 請求書詳細/編集', link: '/spec/screens/scr-h02/' },
								{ label: 'SCR-A03 監査ログ', link: '/spec/screens/scr-a03/' },
							],
						},
						{
							label: 'API仕様',
							collapsed: true,
							items: [
								{ label: '📋 一覧', link: '/spec/apis/' },
								{ label: 'API-A01 テナント管理', link: '/spec/apis/api-a01/' },
								{ label: 'API-A02 ユーザー管理', link: '/spec/apis/api-a02/' },
								{ label: 'API-B01 申請一覧取得', link: '/spec/apis/api-b01/' },
								{ label: 'API-B02 申請作成/更新', link: '/spec/apis/api-b02/' },
								{ label: 'API-B03 承認/差戻し', link: '/spec/apis/api-b03/' },
								{ label: 'API-C01 PJ CRUD', link: '/spec/apis/api-c01/' },
								{ label: 'API-C02 タスクCRUD', link: '/spec/apis/api-c02/' },
								{ label: 'API-C03-1 工数入力', link: '/spec/apis/api-c03-1/' },
								{ label: 'API-C03-2 工数集計', link: '/spec/apis/api-c03-2/' },
								{ label: 'API-D01 経費管理', link: '/spec/apis/api-d01/' },
								{ label: 'API-D02 経費集計', link: '/spec/apis/api-d02/' },
								{ label: 'API-E01 通知システム', link: '/spec/apis/api-e01/' },
								{ label: 'API-F01 ドキュメント管理', link: '/spec/apis/api-f01/' },
								{ label: 'API-G01 全文検索', link: '/spec/apis/api-g01/' },
								{ label: 'API-H01 請求API', link: '/spec/apis/api-h01/' },
							],
						},
						{ label: '例外/エラー方針', link: '/spec/errors/' },
						{ label: '監査ログ方針', link: '/spec/audit-logging/' },
						{ label: 'Supabase規約', link: '/spec/supabase-client/' },
					],
				},
				{
					label: '詳細設計 (Detail)',
					items: [
						{ label: '目次', link: '/detail/' },
						{ label: 'DB設計', link: '/detail/db/' },
						{ label: 'RLS設計', link: '/detail/rls/' },
						{ label: 'モジュール設計', link: '/detail/modules/' },
						{ label: '状態遷移/シーケンス', link: '/detail/sequences/' },
						{ label: 'テスト方針', link: '/detail/testing/' },
						{ label: '環境構築ガイド', link: '/detail/setup/' },
						{ label: '運用手順書', link: '/detail/operations/' },
						{ label: '調査メモ: profiles', link: '/detail/research/profiles-table/' },
					],
				},
				{
					label: 'ADR (意思決定ログ)',
					items: [
						{ label: '目次', link: '/adr/' },
						{ label: 'ADR-0001 RBAC/RLS', link: '/adr/adr-0001/' },
						{ label: 'ADR-0002 監査ログ方式', link: '/adr/adr-0002/' },
						{ label: 'ADR-0003 マルチテナント', link: '/adr/adr-0003/' },
						{ label: 'ADR-0004 profiles テーブル', link: '/adr/adr-0004/' },
						{ label: 'ADR-0005 CLI vs Compose', link: '/adr/adr-0005/' },
						{ label: 'ADR-0006 検索方式', link: '/adr/adr-0006/' },
						{ label: 'ADRテンプレ', link: '/adr/template/' },
					],
				},
				{
					label: '計画 (Plans)',
					items: [
						{ label: 'PLAN-2026-02-22', link: '/plans/plan-2026-02-22/' },
						{ label: 'Phase 2〜4 実行計画', link: '/plans/phase-2-4-plan/' },
						{ label: 'レビュー依頼テンプレ', link: '/plans/review-template/' },
					],
				},
				{
					label: '📒 開発ログ (Logs)',
					collapsed: true,
					items: [
						{ label: '目次', link: '/logs/' },
						{
							label: 'レビュー記録',
							collapsed: true,
							autogenerate: { directory: 'logs/reviews' },
						},
						{
							label: 'ウォークスルー',
							collapsed: true,
							autogenerate: { directory: 'logs/walkthroughs' },
						},
						{
							label: 'プロンプト',
							collapsed: true,
							autogenerate: { directory: 'logs/prompts' },
						},
						{
							label: 'QA',
							collapsed: true,
							autogenerate: { directory: 'logs/qa' },
						},
						{ label: 'ナレッジ', link: '/logs/knowledge/' },
					],
				},
				{
					label: '旧ドキュメント (Archive)',
					collapsed: true,
					items: [
						{ label: '概要', link: '/getting-started/overview/' },
						{ label: 'セットアップ', link: '/getting-started/setup/' },
						{ label: '技術スタック', link: '/architecture/tech-stack/' },
						{ label: 'ディレクトリ構成', link: '/architecture/directory-structure/' },
						{ label: 'Supabase 構成', link: '/architecture/supabase/' },
						{ label: 'Supabase クライアント', link: '/guides/supabase-client/' },
					],
				},
			],
		}),
		mermaid(),
	],
});
