# Claude Gate

A small independent Tauri/Rust launcher for the installed Claude Desktop app. On launch it checks the public IP country using two services. If either detects Iran, it asks the user to turn on a VPN and retry. If location cannot be established, it stays on the retry screen. When the IP is outside Iran, it launches the installed desktop app through the Windows Start app registration or macOS `open -a Claude`.

## Optional web protection

`browser-extension/` contains an optional Chrome/Edge Manifest V3 extension. Load it via `chrome://extensions` or `edge://extensions` → Developer mode → Load unpacked. Turn it on in the extension popup. It redirects `claude.ai` navigation to a local check page, then proceeds only when the public IP is outside Iran. The desktop settings panel records the user's web preference and explains installation; browser protection is actually controlled by the extension popup. Browsers do not permit a desktop app to silently install or toggle an extension.

The extension currently handles Chrome and Edge. Opening Claude Desktop directly, bypassing this launcher, is outside the launch check.

## Build

Install Rust and the [Tauri system prerequisites](https://v2.tauri.app/start/prerequisites/). On Windows, Microsoft C++ Build Tools with **Desktop development with C++** and WebView2 are required. From this folder, run `cargo build --release` to produce `target/release/claude-gate.exe`. The icon files are already generated. This first build needs access to crates.io to download Rust dependencies.

For an installer, install the Tauri CLI with `cargo install tauri-cli --version '^2' --locked`, then run `cargo tauri build`. Installers are in `target/release/bundle/`.

For macOS, build on a Mac with the same command. The `.app` and `.dmg` are in `target/release/bundle/`. Building macOS bundles directly on Windows is not supported; a macOS CI runner can do it.

The included GitHub Actions workflow builds Windows and macOS artifacts when manually triggered or when a `v*` tag is pushed. GitHub Actions must be enabled in the repository.

Test desktop app discovery and browser interception on each target OS before distributing. This app is not affiliated with Anthropic. Its app icon is original and distinct from the Claude mark.
