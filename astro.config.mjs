// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Starlight App Docs',
			defaultLocale: 'ja',
			locales: {
				ja: { label: '日本語', lang: 'ja' },
			},
			sidebar: [
				{
					label: 'はじめに',
					items: [
						{ label: '概要', link: '/getting-started/overview/' },
						{ label: 'セットアップ', link: '/getting-started/setup/' },
					],
				},
				{
					label: 'アーキテクチャ',
					items: [
						{ label: '技術スタック', link: '/architecture/tech-stack/' },
						{ label: 'ディレクトリ構成', link: '/architecture/directory-structure/' },
						{ label: 'Supabase 構成', link: '/architecture/supabase/' },
					],
				},
				{
					label: 'ガイド',
					items: [
						{ label: 'Supabase クライアント', link: '/guides/supabase-client/' },
					],
				},
			],
		}),
	],
});
