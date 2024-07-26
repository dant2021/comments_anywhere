# Page Commenter

Page Commenter is a Chrome extension that allows users to leave comments on any part of a webpage for demo purposes.

## Features

- Add text comments to any part of a webpage
- Comments are visible only to the user who added them
- Comments disappear upon page refresh (not persistent)

## Installation

1. Clone this repository
2. (Optional) If you want to modify the code:
   - Install Node.js
   - Run `npx tsc` to compile TypeScript files
3. Load the `dist` folder as an unpacked extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked" and select the `dist` folder

## Usage

After installation, click on the extension icon in your browser toolbar to use Page Commenter.

## Permissions

As specified in the manifest, this extension requires:
- `activeTab`
- `scripting`

## Known Issues

- Some websites may display comments in incorrect locations or fail to show them at all
- This is a demo project and may have limitations or unexpected behaviors

## Future Plans

This project is primarily for personal use and may receive improvements in the future.

## License

This project is licensed under the MIT License.
