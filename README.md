# VGGallery — Gallery & Downloader for ViperGirls

Stop browsing photo threads the hard way. VGGallery transforms any ViperGirls thread into a smooth, full-screen gallery — and lets you download everything in one click.

## ✨ Features

- 🖼️ **Clean gallery viewer** — browse photos without the clutter
- 🔀 **Thread navigation** — jump between all galleries in a thread
- 📦 **One-click ZIP download** — grab everything at once

## 🌐 Supported Image Hosts

- Imx.to
- Pixhost.to
- Vipr.im

## 🎮 Gallery Controls

| Action | Control |
|--------|---------|
| Next image | Tap/click the right side |
| Previous image | Tap/click the left side |
| Toggle slideshow | Hold tap/click |
| Slideshow direction | Hold on right (forward) or left (backward) |
| Change slideshow speed | Tap the progress bar (1s · 3s · 10s) |
| Zoom & pan | Pinch or scroll |

## 📲 Installation

### 🍎 Safari — iOS & Mac

1. Install the [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) extension from the App Store
2. Go to the [Releases page](https://github.com/LubyDoumi/VGGallery/releases) and download **vggallery.user.js**
3. Place the file in your Userscripts folder (found in the extension settings under **Userscripts Directory**)

### 🦊 Firefox &nbsp;|&nbsp; 🌐 Chrome — Mac, Windows, Android

1. Install the [Tampermonkey](https://www.tampermonkey.net/) extension ([Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/) · [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo))
2. Go to the [Releases page](https://github.com/LubyDoumi/VGGallery/releases)
3. Click on the latest **vggallery.user.js** file — Tampermonkey will intercept it and prompt you to install
4. Confirm the installation in Tampermonkey

> Need help? See the [Tampermonkey FAQ](https://www.tampermonkey.net/faq.php).

> **Note:** On first use, both Userscripts and Tampermonkey will ask you to grant access to image host websites. This is required for the script to load images.

## ⚠️ Known issues

- **Large threads may be slow or crash** — if a thread has many posts, try opening it normally first and use the gallery page by page instead of all at once.
- **Zipping can be slow on Tampermonkey** — packaging a large download may take a moment after all images are fetched.
- **Progress bar glitch on Tampermonkey** — a visual issue with the download progress bar may occasionally appear.

## 🤝 Contribution

### Issues

Found a bug or want support for a new image host? [Open an issue](https://github.com/LubyDoumi/VGGallery/issues/new).

### Prerequisites

- [Node.js](https://nodejs.org/) — use the version pinned in `.nvmrc` (`nvm use`)
- [Userscripts for Safari](https://apps.apple.com/app/userscripts/id1463298887) — required to load and test the script in the browser

### Setup

```bash
npm install
```

### Building

```bash
npm run build
```

The compiled userscript is written to `dist/vggallery.user.js`. Install that file in Userscripts to test the production build.

### Automatic copy after build (optional)

Set `COPY_DEST` in a `.env.local` file to have the built script copied directly into your Userscripts folder after every build, skipping the manual install step.

```bash
# .env.local
COPY_DEST=/path/to/Userscripts/vggallery.user.js
```

The path to your Userscripts folder can be found in the Userscripts Safari extension settings under **Userscripts Directory**.

## 🤖 Usage of AI

AI assistance was used during development via [Claude Code](https://claude.ai/code).
