// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' // or react, depending on project
import postcss from './postcss.config.cjs'

export default defineConfig({
  plugins: [vue()],
  css: {
    postcss,
  },
})
