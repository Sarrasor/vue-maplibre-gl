import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import path, { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	resolve     : {
		alias: [
			{ find: '@', replacement: path.resolve(__dirname, 'src') },
			{ find: /^~(.+)/, replacement: '$1' }
		]
	},
	plugins     : [ vue(), dts({ insertTypesEntry: true }) ],
	build       : {
		cssCodeSplit : true,
		target       : 'esnext',
		lib          : {
			entry   : resolve(__dirname, 'src/lib/main.ts'),
			name    : 'VueMaplibreGl',
			formats : [ 'es', 'cjs', 'umd' ],
			fileName: format => `vue-maplibre-gl.${format}.js`
		},
		rollupOptions: {
			// make sure to externalize deps that shouldn't be bundled
			// into your library
			input   : {
				main: resolve(__dirname, 'src/lib/main.ts')
			},
			external: [ 'vue', 'maplibre-gl' ],
			output  : {
				assetFileNames: (assetInfo) => {
					if (assetInfo.name === 'main.css') {
						return 'vue-maplibre-gl.css';
					}
					return assetInfo.name;
				},
				exports       : 'named',
				// Provide global variables to use in the UMD build
				// for externalized deps
				globals: {
					vue          : 'Vue',
					'maplibre-gl': 'maplibregl'
				},
			},
		}
	},
	server      : {
		watch: {
			// to avoid full page reloads on file changes
			ignored: [ /\.idea/, /ts\.timestamp-\d+\.mjs/, /\.git/, /node_modules/ ]
		}
	},
	optimizeDeps: {
		exclude: [ 'vue', 'maplibre-gl' ],
	}
});