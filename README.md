# VGGallery — Gallery and Downloader for ViperGirls

This userscript lets you browse photo threads in a clean gallery view and download them easily.

## Features

- Gallery viewer
- Navigate between all galleries in a thread
- Download photos as a ZIP file

## Supported Image Hosts

- Imx.to
- Pixhost.to
- Vipr.im

## Gallery

- Zoom and pan the image
- Tap/click the right side of the screen to go to the next image
- Tap/click the left side of the screen to go to the previous image
- Hold touch/click to toggle the slideshow
  - On the right, it moves forward
  - On the left, it moves backward
- Tap/click the slideshow progress bar to change the speed (1s, 3s, or 10s)

## Contribution

### Issues

Open a new issue to report a bug or to request support for a new image host.

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

## Usage of AI

AI assistance was used during development via [Claude Code](https://claude.ai/code).
