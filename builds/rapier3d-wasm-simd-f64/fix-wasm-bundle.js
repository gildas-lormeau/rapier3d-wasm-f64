#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { minify } from "terser";

const BUNDLE_PATH = "pkg/rapier3d-bundle.js";
const PKG_JSON_PATH = "pkg/package.json";

const WASM_INIT_CODE = `
(function initWasm() {
    try {
        let wasmBytes;
        if (typeof atob === 'undefined') {
            wasmBytes = Buffer.from(rapier_wasm3d_bg, 'base64');
        } else {
            wasmBytes = Uint8Array.from(atob(rapier_wasm3d_bg), c => c.charCodeAt(0));
        }
        
        const wasmModule = new WebAssembly.Module(wasmBytes);
        
        const imports = {
            './rapier_wasm3d_bg.js': {
                __wbindgen_number_new: function(v) { return addHeapObject(v); },
                __wbindgen_boolean_get: function(idx) { return getObject(idx) === true ? 1 : 0; },
                __wbindgen_object_drop_ref: function(idx) { dropObject(idx); },
                __wbindgen_number_get: function(idx) { return getObject(idx); },
                __wbindgen_is_function: function(idx) { return typeof getObject(idx) === 'function' ? 1 : 0; },
                __wbg_rawraycolliderintersection_new: function() { return addHeapObject({}); },
                __wbg_rawcontactforceevent_new: function() { return addHeapObject({}); },
                __wbg_call_7cccdd69e0791ae2: function(arg0, arg1, arg2) { 
                    try {
                        return addHeapObject(getObject(arg0).call(getObject(arg1), getObject(arg2)));
                    } catch(e) { return addHeapObject(e); }
                },
                __wbg_call_833bed5770ea2041: function(arg0, arg1) { 
                    try {
                        return addHeapObject(getObject(arg0).call(getObject(arg1)));
                    } catch(e) { return addHeapObject(e); }
                },
                __wbg_call_b8adc8b1d0a0d8eb: function(arg0, arg1, arg2) { 
                    try {
                        return addHeapObject(getObject(arg0).call(getObject(arg1), getObject(arg2)));
                    } catch(e) { return addHeapObject(e); }
                },
                __wbg_bind_c8359b1cba058168: function(arg0, arg1) { 
                    return addHeapObject(getObject(arg0).bind(getObject(arg1)));
                },
                __wbg_buffer_609cc3eee51ed158: function(arg0) { 
                    return addHeapObject(getObject(arg0).buffer);
                },
                __wbg_newwithbyteoffsetandlength_d97e637ebe145a9a: function(arg0, arg1, arg2) { 
                    return addHeapObject(new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0));
                },
                __wbg_new_a12002a7f91c75be: function(arg0) { 
                    return addHeapObject(new Uint8Array(getObject(arg0)));
                },
                __wbg_set_65595bdd868b3009: function(arg0, arg1, arg2) { 
                    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
                },
                __wbg_length_a446193dc22c12f8: function(arg0) { 
                    return getObject(arg0).length;
                },
                __wbg_newwithbyteoffsetandlength_93c8e0c1a479fa1a: function(arg0, arg1, arg2) { 
                    return addHeapObject(new Float64Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0));
                },
                __wbg_set_29b6f95e6adb667e: function(arg0, arg1, arg2) { 
                    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
                },
                __wbg_length_c67d5e5c3b83737f: function(arg0) { 
                    return getObject(arg0).length;
                },
                __wbg_newwithlength_5ebc38e611488614: function(arg0) { 
                    return addHeapObject(new Uint8Array(arg0 >>> 0));
                },
                __wbindgen_throw: function(ptr, len) { throw new Error(getStringFromWasm0(ptr, len)); },
                __wbindgen_memory: function() { return addHeapObject(wasm.memory); }
            }
        };
        
        const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
        __wbg_set_wasm(wasmInstance.exports);
    } catch (error) {
        console.error('Failed to initialize WASM:', error);
        __wbg_set_wasm(wasm$1);
    }
})();
`;

async function minifyBundle(filePath) {
    console.log("🗜️  Minifying bundle...");

    try {
        const content = await readFile(filePath, "utf8");

        const result = await minify(content, {
            compress: {
                drop_console: false,
                drop_debugger: true,
                pure_funcs: [],
                passes: 2,
            },
            mangle: {
                keep_classnames: true,
                keep_fnames: false,
            },
            format: {
                comments: false,
                semicolons: true,
            },
        });

        if (result.error) {
            console.error("❌ Minification failed:", result.error);
            return false;
        }

        await writeFile(filePath, result.code, "utf8");

        const originalSize = content.length;
        const minifiedSize = result.code.length;
        const savings = ((originalSize - minifiedSize) / originalSize * 100)
            .toFixed(1);

        console.log(`✅ Bundle minified successfully!`);
        console.log(`   Original size: ${originalSize.toLocaleString()} bytes`);
        console.log(`   Minified size: ${minifiedSize.toLocaleString()} bytes`);
        console.log(`   Space saved: ${savings}%`);

        return true;
    } catch (error) {
        console.error("❌ Minification failed:", error.message);
        return false;
    }
}

async function fixPackageJson() {
    console.log("📦 Fixing package.json module type...");

    if (!existsSync(PKG_JSON_PATH)) {
        console.error(`❌ Package.json not found: ${PKG_JSON_PATH}`);
        return false;
    }

    try {
        const content = await readFile(PKG_JSON_PATH, "utf8");
        const packageJson = JSON.parse(content);

        if (!packageJson.type) {
            packageJson.type = "module";
            await writeFile(
                PKG_JSON_PATH,
                JSON.stringify(packageJson, null, 2),
                "utf8",
            );
            console.log("✅ Added 'type': 'module' to package.json");
        } else {
            console.log("✅ Package.json already has module type specified");
        }

        return true;
    } catch (error) {
        console.error("❌ Failed to fix package.json:", error.message);
        return false;
    }
}

async function fixWasmBundle() {
    console.log("🔧 Fixing WASM bundle initialization...");

    if (!existsSync(BUNDLE_PATH)) {
        console.error(`❌ Bundle file not found: ${BUNDLE_PATH}`);
        process.exit(1);
    }

    let content = await readFile(BUNDLE_PATH, "utf8");

    if (
        content.includes("Initialize WASM module with required imports") ||
        content.includes("initWasm()")
    ) {
        console.log("✅ Bundle already patched, skipping");
        return;
    }

    const patterns = [
        "__wbg_set_wasm(wasm$1);", // Non-minified
        "__wbg_set_wasm(wasm$1)", // Minified without semicolon
        /(__wbg_set_wasm\(wasm\$1\);?)/, // Regex pattern for flexibility
    ];

    let foundPattern = null;
    let matchIndex = -1;

    for (const pattern of patterns) {
        if (typeof pattern === "string") {
            matchIndex = content.indexOf(pattern);
            if (matchIndex !== -1) {
                foundPattern = pattern;
                break;
            }
        } else {
            const match = content.match(pattern);
            if (match) {
                foundPattern = match[0];
                matchIndex = content.indexOf(foundPattern);
                break;
            }
        }
    }

    if (!foundPattern) {
        console.error(
            "❌ Could not find the original WASM initialization line",
        );
        process.exit(1);
    }

    console.log("Found pattern");

    const newContent = content.replace(foundPattern, WASM_INIT_CODE);

    if (newContent === content) {
        console.error("❌ Failed to replace the WASM initialization");
        process.exit(1);
    }

    await writeFile(BUNDLE_PATH, newContent, "utf8");

    console.log("✅ WASM bundle fixed successfully!");

    await fixPackageJson();

    await minifyBundle(BUNDLE_PATH);

    console.log("🧪 Testing the fix...");

    try {
        const rapier = await import(resolve(BUNDLE_PATH));
        const params = new rapier.IntegrationParameters();
        console.log(
            "✅ Test passed! IntegrationParameters created successfully",
        );
    } catch (error) {
        console.error("❌ Test failed:", error.message);
        process.exit(1);
    }
}

fixWasmBundle().catch((error) => {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
});
