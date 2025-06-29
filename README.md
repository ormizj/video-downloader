# Video Downloader

A desktop application for downloading videos from various websites using yt-dlp.

<img src="src/renderer/assets/icon.svg" alt="Video Downloader Icon" width="128" height="128" />

## Features

- Simple and intuitive user interface
- Download videos from YouTube, Vimeo, and many other platforms
- Real-time download progress tracking
- Cross-platform desktop application (Windows, macOS, Linux)
- Built with Electron, and Vue.js

## Installation

### Download the Executable

Download the latest release for your operating system from
the [Releases](https://github.com/yourusername/video-downloader/releases) page.

### Build from Source

If you prefer to build the application from source:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/video-downloader.git
   cd video-downloader
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

   This will create executables in the `dist` directory.

## Development

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### Setup Development Environment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## How to Use

1. Launch the application
2. Enter the URL of the video you want to download
3. Click the "Download Video" button
4. Wait for the download to complete
5. The video will be saved to your downloads folder

## Technologies

- [Electron](https://www.electronjs.org/) - Desktop application framework
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Video downloader engine
- [FFmpeg](https://ffmpeg.org/) - Media processing framework

## License

MIT

## Acknowledgements

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) for the powerful video downloading capabilities
- [FFmpeg](https://ffmpeg.org/) for media processing and conversion functionality
