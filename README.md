<p align="center">
  <img src="src-tauri/icons/128x128@2x.png" width="96" alt="Nakso icon" />
</p>

<h1 align="center">Nakso</h1>

<p align="center">
  Your desktop sketchpad — visualize your ideas instantly.<br/>
  No subscription, works offline, small and fast.
</p>

<p align="center">
  <a href="https://nakso.app">https://nakso.app</a>
</p>

![Nakso screenshot](https://github.com/niklauslee/nakso/blob/main/docs/screenshot.png?raw=true)

## Features

- **Open source** — Nakso is open source, built on the [DGM.js](https://dgmjs.dev)
- **Local-first** — all your files are stored locally on your device; no cloud, no third-party servers
- **Cloud sync, your way** — keep files in sync across devices with Dropbox, iCloud, Google Drive, OneDrive, or similar services
- **Fast** — millisecond-level responses since everything is stored and read on your local device
- **Familiar UX** — file preview and folder management similar to modern SaaS apps
- **Cross-platform** — available on macOS, Windows, and Linux

## Download

Grab the latest build for your platform from [nakso.app/#download](https://nakso.app/#download).

| Platform                      | Requirement   |
| ----------------------------- | ------------- |
| macOS (Apple Silicon / Intel) | macOS 15+     |
| Windows (x86)                 | Windows 10+   |
| Linux (AppImage, x86)         | Ubuntu 24.04+ |

## Tech stack

- **Frontend** — React 19, TypeScript, Vite, [`@dgmjs`](https://dgmjs.dev) drawing engine, Zustand, Tailwind CSS v4
- **Shell** — [Tauri 2](https://tauri.app) (Rust)

## Development

```sh
# install dependencies
npm i

# start the desktop app
npm run tauri dev

# type-check and build
npm run build
```

## Contribution

Please note that this project is **not open contribution**, so we do not accept any pull requests.

## License

Nakso is distributed under the GPLv3 license.
