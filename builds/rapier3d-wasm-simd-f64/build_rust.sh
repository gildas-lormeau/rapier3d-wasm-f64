#!/bin/sh

# Cleaning rust because changing rust flags may lead to different build results.
cargo clean

RUSTFLAGS='-C target-feature=+simd128' npx wasm-pack build
sed -i.bak 's#dimforge_rapier3d_f64#@dimforge/rapier3d-f64#g' pkg/package.json
sed -i.bak 's/"rapier_wasm3d_bg.wasm"/"*"/g' pkg/package.json
(
    cd pkg
    npm pkg delete sideEffects
    npm pkg set 'sideEffects[0]'="./*.js"
)
rm pkg/*.bak
rm pkg/.gitignore
