import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr';
import autoprefixer from 'autoprefixer';


export default defineConfig ({
    plugins: [
        react(), tailwindcss(), svgr(),
    ],
    // css: {
    //     postcss: {
    //         plugins: [
    //             autoprefixer
    //     ]},
    // },
    server: {
        port: 9000,
        host: true,
    },
    optimizeDeps: {
        force: true,
    }
});