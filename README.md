# Nakso

## Release

### Checklist

- [ ] Update version
- `package.json`
- `tauri.conf.json`
- `src-tauri/Cargo/toml`

### Build and publish

```sh
# macOS (aarch64)
source .env
npm run tauri build -- --target=aarch64-apple-darwin
node build/publish -- --arch=aarch64

# macOS (x86_64)
source .env
npm run tauri build -- --target=x86_64-apple-darwin
node build/publish -- --arch=x86_64

# Windows (x86_64)
.env ???
npm run tauri build -- --target=x86_64-pc-windows-msvc
node build/publish -- --arch=x86_64

# Linux (x86_64)
source .env
npm run tauri build -- --target=x86_64-unknown-linux-gnu
node build/publish -- --arch=x86_64
```

## Setup for Build

```sh
# for macOS (x86 and arm64)
rustup target add aarch64-apple-darwin
rustup target add x86_64-apple-darwin
```
