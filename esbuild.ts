import * as esbuild from "esbuild"

if (process.argv.includes("--mode=dev")) {
	process.env.NODE_ENV = "development"
} else {
	process.env.NODE_ENV = "production"
}

const CONFIG: esbuild.BuildOptions = {
    entryPoints: ["./src/vs_plugin.ts"],
    bundle: true,
    platform: "node",
    outfile: "./dist/vs_plugin.js",
    plugins: [

    ],
    format: "iife",
};

const PROD_CONFIG: esbuild.BuildOptions = {
    ...CONFIG,
    minify: true,
};

const DEV_CONFIG: esbuild.BuildOptions = {
    ...CONFIG,
    minify: false,
    sourcemap: 'inline',
};

async function build() {
    if(process.env.NODE_ENV === "development") {
        console.log("Building in development mode")
        await esbuild.build(DEV_CONFIG);
        return;
    } else {
        console.log("Building in production mode")
        await esbuild.build(PROD_CONFIG);
        return;
    }
}

build()
