# Nakso

## Release

### Checklist

- [] Update version
  - `package.json`
  - `tauri.conf.json`
  - `src-tauri/Cargo/toml`

### Build and publish

```sh
# macOS (aarch64)
npm run publish

# macOS (x86_64)
npm run publish -- -arch=?

# Windows (x86_64)
npm run publish

# Linux (x86_64)
npm run publish
```
