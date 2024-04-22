import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import { copy } from "esbuild-plugin-copy";

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit https://github.com/unxok/obsidian-starter-react
*/`;

// const prod = process.argv[2] === "production";

esbuild
	.build({
		banner: {
			js: banner,
		},
		entryPoints: ["src/main.tsx"],
		bundle: true,
		external: [
			"obsidian",
			"electron",
			"@codemirror/autocomplete",
			"@codemirror/closebrackets",
			"@codemirror/collab",
			"@codemirror/commands",
			"@codemirror/comment",
			"@codemirror/fold",
			"@codemirror/gutter",
			"@codemirror/highlight",
			"@codemirror/history",
			"@codemirror/language",
			"@codemirror/lint",
			"@codemirror/matchbrackets",
			"@codemirror/panel",
			"@codemirror/rangeset",
			"@codemirror/rectangular-selection",
			"@codemirror/search",
			"@codemirror/state",
			"@codemirror/stream-parser",
			"@codemirror/text",
			"@codemirror/tooltip",
			"@codemirror/view",
			...builtins,
		],
		plugins: [
			copy({
				assets: [
					{
						from: ["./manifest.json"],
						to: [
							"./test-vault/.obsidian/plugins/my-obsidian-plugin/manifest.json",
						],
					},
					{
						from: ["./main.js"],
						to: [
							"./test-vault/.obsidian/plugins/my-obsidian-plugin/main.js",
						],
					},
				],
			}),
		],
		format: "cjs",
		target: "esnext",
		logLevel: "info",
		treeShaking: true,
		outfile: "main.js",
	})
	.catch(() => process.exit(1));
