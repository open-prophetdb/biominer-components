import { defineConfig } from 'dumi';

export default defineConfig({
    outputPath: 'docs-dist',
    apiParser: {},
    resolve: {
        entryFile: './src/index.ts',
    },
    themeConfig: {
        name: "UI4NM",
        // logo: "https://drugs.3steps.cn/assets/gene.png",
        footer: 'Open Source - MIT Licensed | Copyright©2020 <br /> Powered by <a href="https://biominer.3steps.cn">OpenProphetDB Team</a>',
    },
});