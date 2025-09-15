import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		lib: {
			entry: 'src/lib/index.js',
			name: 'PureAdminKit',
			fileName: 'pure-admin-kit'
		},
		rollupOptions: {
			external: ['svelte'],
			output: {
				globals: {
					svelte: 'Svelte'
				}
			}
		}
	}
});