import { nodeResolve } from "@rollup/plugin-node-resolve";
import { base64 } from "rollup-plugin-base64";

export default {
    input: "pkg/rapier.js",
    output: {
        file: "pkg/rapier3d-bundle.js",
        format: "es",
        sourcemap: true,
    },
    external: [],
    plugins: [
        base64({
            include: "**/*.wasm",
        }),
        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),
    ],
};
