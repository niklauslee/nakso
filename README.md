# Nakso

## Release

### Checklist

- [ ] Update version
- `package.json`
- `tauri.conf.json`
- `src-tauri/Cargo.toml`

### Build and publish

```sh
# build
npm run release:build

# publish (build + upload)
npm run release:publish
```

## Setup for Build

```sh
# for macOS (x86 and arm64)
rustup target add aarch64-apple-darwin
rustup target add x86_64-apple-darwin
```
