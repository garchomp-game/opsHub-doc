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
						{ label: '画面仕様一覧', link: '/spec/screens/' },
						{ label: 'API仕様一覧', link: '/spec/apis/' },
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
					],
				},
				{
					label: 'ADR (意思決定ログ)',
					items: [
						{ label: '目次', link: '/adr/' },
						{ label: 'ADR-0001 RBAC/RLS', link: '/adr/adr-0001/' },
						{ label: 'ADR-0003 マルチテナント', link: '/adr/adr-0003/' },
						{ label: 'ADRテンプレ', link: '/adr/template/' },
					],
				},
				{
					label: '計画 (Plans)',
					items: [
						{ label: 'PLAN-2026-02-22', link: '/plans/plan-2026-02-22/' },
						{ label: 'レビュー依頼テンプレ', link: '/plans/review-template/' },
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
