import { defineConfig } from 'tsup';

export default defineConfig({
  sourcemap: false,
  minify: false,
  dts: true,
  format: ['esm', 'cjs'],
  loader: {
    '.js': 'jsx',
  },
});
