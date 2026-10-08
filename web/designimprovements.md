# Design Improvements & Feature Proposals

**Implementation status:** Implemented for the bilingual public dashboard and verified locally on 2026-10-08. See `docs/website-improvements-plan.md` for browser and test evidence. Deployment verification is recorded there after publishing.

## 1. Neobrutalist Aesthetic Refinements

The current design uses smooth gradients (`from-slate-950 via-slate-900`) which leans towards "Glassmorphism" or standard "Dark Mode". To fully embrace **Neobrutalism**, we should introduce:

- **Hard Borders**: Replace soft shadows with thick, black (or high-contrast) borders (e.g., `border-2 border-black` or `border-white` in dark mode).
- **Stark Color Blocking**: Instead of gradients, use solid, vibrant colors for headers and sections (e.g., `#FF4800` International Orange, `#00FF9D` Neon Mint, `#FFDE00` Cyber Yellow).
- **Brutal Typography**: Use monospaced fonts (like `JetBrains Mono`, `Space Mono`) for data points and distinct, heavy sans-serifs (like `Oswald` or `Archivo Black`) for headers.
- **"Card" Stacking**: UI elements (Observatory Cards) should look like physical cards stacked with offset shadows (`box-shadow: 4px 4px 0px 0px #000`).

## 2. "Status Board" Visuals

Transform the observatory data into a mission-control style interface:

- **Marquee Alerts**: A scrolling text ticker at the top for "Live Solar Wind Speed" or "Alert Status" (using `<marquee>` or CSS equivalent).
- **Retro Indicators**: Use "LED" style signaling lights (Red/Green/Yellow circles with glowing CSS) for observatory status (Online/Offline).
- **Raw Data Blocks**: Display raw JSON or data streams in a terminal-like window for the "nerd stats" (Magnetometer readings).

## 3. Interactive UX Enhancements

- **Haptic Visuals**: Buttons that physically depress (translate X/Y) when clicked, giving a tactile feel.
- **Custom Cursor**: A crosshair or specific "target" cursor to emphasize the "Watcher" theme.
- **Glitch Effects**: Subtle CSS glitch animations on headers or during high-activity alerts (Kp > 5).
- **Hover states**: Invert colors completely on hover for buttons.

## 4. Mobile & PWA Experience

- **"App-like" Navigation**: A bottom sticky bar for mobile for quick switching between `Map`, `Stats`, and `Cams`.
- **Gestures**: Swipe between observatory cameras in the fullscreen view.
- **Install Prompt**: Explicit UI to install as PWA for quick access to notifications.

## 5. Feature Additions

- **"Last Seen" Time Travel**: A slider to quickly scrub through the last 6-12 hours of camera images (if historical data is available).

## 6. Performance & Accessibility

- **High Contrast Toggle**: A specific toggle for a B&W high-contrast mode for maximum readability.
- **Reduced Motion**: Respect `prefers-reduced-motion` to disable glitch effects and heavy animations.

## Delivery status

- [x] Aurora hybrid styling: solid surfaces, strong borders, offset card shadows, clearer data typography, tactile button states, and inverted hover styling while retaining the teal/violet brand colors.
- [x] Live NOAA status board: current Kp, solar-wind speed, and Bz share a five-minute snapshot with the alert state; statuses distinguish loading, stale, and unavailable data.
- [x] Space-weather graphs expose collapsed recent raw samples; webcam LEDs distinguish checking, online, and offline.
- [x] Crosshair pointer on fine-pointer devices and Kp > 5 heading glitch; reduced-motion rules suppress marquee, glitch, aurora animation, and transitions; keyboard focus remains visible.
- [x] Mobile Cams, Stats, and Map bar expands and scrolls to its target; fullscreen cameras support horizontal swipes and keep visible labeled controls.
- [x] PWA install action uses the browser install event and presents localized manual guidance when unavailable.
- [x] Existing history scrubber and 6-hour through 30-day presets retained with accessible labels.
- [x] Persistent black-and-white high-contrast mode and English/Finnish labels.
- [x] Admin and the scheduled GitHub Action scan the latest 80 archive images, rank by detected aurora-colored pixels, retain up to 30 strongest matches in `aurora_gallery.json`, and deploy the public gallery with full localized place names.
