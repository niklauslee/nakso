# Nakso

Nakso is a lightweight, offline-first desktop whiteboard designed for instant idea visualization.

## Release

### Checklist

- [ ] Update version
- `package.json`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`

### Build and publish

```sh
# build
npm run release:build

# publish (build + upload)
npm run release:publish
```

### Update Github

- Create a release
- Close milestone

### Update website

- Update version and changelog `config.json` in website

---

## Setup for Build

```sh
# for macOS (x86 and arm64)
rustup target add aarch64-apple-darwin
rustup target add x86_64-apple-darwin
```
