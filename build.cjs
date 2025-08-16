const esbuild = require("esbuild");
const args = process.argv.slice(2);
const isWatch = args.includes("--watch");

const commonOptions = {
	entryPoints: ["./source/index.ts"],
	bundle: true,
	sourcemap: true,
	logLevel: "info"
};

const presets = [
	{
		format: "cjs",
		outfile: "dist/cascade.cjs.js",
		platform: "node"
	},
	{

		format: "esm",
		outfile: "dist/cascade.esm.js",
		platform: "neutral",
	},
	{
		minify: false,
		format: "iife",
		outfile: "dist/cascade.global.js",
		globalName: "cascade",
		platform: "browser"
	}
];

for (const preset of presets) {
	const options = { ...commonOptions, ...preset };
	(async () => {
		const ctx = await esbuild.context(options);
		if (isWatch) {
			await ctx.watch();
			console.log(`Watching to outfile: ${options.outfile}`);
		} else {
			await ctx.rebuild();
			await ctx.dispose();
			console.log(`Built outfile: ${options.outfile}`);
		}
	})();
}