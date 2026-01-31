## [1.10.2](https://github.com/Krugou/aurorawatcher/compare/v1.10.1...v1.10.2) (2026-01-31)

### Bug Fixes

- **ci:** handle race conditions in aurora image save step ([802b8d0](https://github.com/Krugou/aurorawatcher/commit/802b8d0e986365300d459fc496ee43ccdad03e53))

## [1.10.1](https://github.com/Krugou/aurorawatcher/compare/v1.10.0...v1.10.1) (2026-01-31)

### Bug Fixes

- **ci:** grant write permissions to github-actions bot ([c15cb11](https://github.com/Krugou/aurorawatcher/commit/c15cb11a40609b2cf0deb5c6bfd0b684684a4300))

# [1.10.0](https://github.com/Krugou/aurorawatcher/compare/v1.9.0...v1.10.0) (2026-01-31)

### Features

- cyclic 24h image history and history viewer UI ([0146468](https://github.com/Krugou/aurorawatcher/commit/0146468b40e7feebf5e9dca02c464e9de021c7e3))

# [1.9.0](https://github.com/Krugou/aurorawatcher/compare/v1.8.0...v1.9.0) (2026-01-30)

### Features

- Implement image history management for the bot and add corresponding display components to the web application. ([0760f8f](https://github.com/Krugou/aurorawatcher/commit/0760f8ff10584333e7f9c2bc4aebb837cd70fac0))

# [1.8.0](https://github.com/Krugou/aurorawatcher/compare/v1.7.0...v1.8.0) (2026-01-30)

### Features

- **web:** add helsinki test location and proof for fmi fetch ([2025347](https://github.com/Krugou/aurorawatcher/commit/2025347b62d077f16d51cee33a128ab924b9ebf0))

# [1.7.0](https://github.com/Krugou/aurorawatcher/compare/v1.6.0...v1.7.0) (2026-01-30)

### Features

- **web:** move accordion button to right and persist state in localStorage ([48dc008](https://github.com/Krugou/aurorawatcher/commit/48dc0083d4df1408a2a972d6befc65fcdd044594))

# [1.6.0](https://github.com/Krugou/aurorawatcher/compare/v1.5.0...v1.6.0) (2026-01-30)

### Features

- Add services for fetching FMI magnetic and weather data, and NOAA solar wind data. ([db54a50](https://github.com/Krugou/aurorawatcher/commit/db54a50df030492feb60c206c5ebdb15930d74e2))

# [1.5.0](https://github.com/Krugou/aurorawatcher/compare/v1.4.0...v1.5.0) (2026-01-30)

### Features

- integrate proxy for CORS fix and add Husky pre-commit hooks ([f27cea9](https://github.com/Krugou/aurorawatcher/commit/f27cea9027497a537027b76ffe8ed87eee09d39a))

# [1.4.0](https://github.com/Krugou/aurorawatcher/compare/v1.3.0...v1.4.0) (2026-01-30)

### Features

- add AuroraMap component for displaying aurora activity with image analysis and notifications, alongside a new hook for image metadata. ([1a7d34a](https://github.com/Krugou/aurorawatcher/commit/1a7d34a68302d74e21395b64ab107ac2626aeffa))

# [1.3.0](https://github.com/Krugou/aurorawatcher/compare/v1.2.0...v1.3.0) (2026-01-30)

### Features

- Implement data fetching services for FMI and NOAA, alongside a new AuroraMap component and image metadata hook. ([3f6e3cc](https://github.com/Krugou/aurorawatcher/commit/3f6e3ccbbe1da1cc0a6d9450d04d073c2b62e5b0))

# [1.2.0](https://github.com/Krugou/aurorawatcher/compare/v1.1.0...v1.2.0) (2026-01-30)

### Features

- Add core UI components for space weather, magnetic disturbance, solar wind graphs, and theme management. ([2fe8efd](https://github.com/Krugou/aurorawatcher/commit/2fe8efd63b58e6358918e414cd9614b0026dd555))
- Add GitHub Actions workflow for automated semantic releases. ([a696adc](https://github.com/Krugou/aurorawatcher/commit/a696adc5f0453461d35f2d823c080c352ec6aef4))
- Add GitHub Actions workflows for CI, semantic release, and web deployment to GitHub Pages. ([41ad97a](https://github.com/Krugou/aurorawatcher/commit/41ad97a914be4e5c3c2cec44a5e7bb772a989d6a))
- Add GitHub Actions workflows for CI, web deployment, scheduled bot runs, and semantic releases, along with related package updates. ([85aa6bb](https://github.com/Krugou/aurorawatcher/commit/85aa6bbe74ebfa200b4b973da646346d98f1ba6a))
- add i18n, unit tests, e2e config, and UX improvements ([fd2fc80](https://github.com/Krugou/aurorawatcher/commit/fd2fc80daf3744a1417ba714dc9c4cfe14842bf9))
- add PWA support and fix UI centering ([42f33a4](https://github.com/Krugou/aurorawatcher/commit/42f33a4aad0f824238b857e6f5b02c0896fe2c56))
- add red aurora detection, toast notifications, and 5min refresh ([08987cc](https://github.com/Krugou/aurorawatcher/commit/08987cc3fbbef2f5f481cd1a15c6edf88dbb9de4))
- complete web and bot enhancements ([b964b22](https://github.com/Krugou/aurorawatcher/commit/b964b2287bf07ff1d58738b8071cb51ae147c82b))
- Implement initial web application UI with components for camera display, space weather, and data graphs. ([ab050c0](https://github.com/Krugou/aurorawatcher/commit/ab050c0a48533668fb5997b53e65e8ca74f2b717))
- Implement initial web project setup including package.json and GitHub Actions for CI/CD, release management, and bot scheduling. ([0acff84](https://github.com/Krugou/aurorawatcher/commit/0acff84a0089e357e86e938a04bae9972935eae9))
- Implement real-time local weather and magnetic conditions using geolocation, and display live space weather data. ([a34efde](https://github.com/Krugou/aurorawatcher/commit/a34efde47e503608b9c3213d0592cc16d8deb4da))
- Initialize the main application structure, integrating theme and language toggles, and setting up various data display components. ([15db057](https://github.com/Krugou/aurorawatcher/commit/15db057b5f2a6a651da759602a527bc7cc1ff541))
- Initialize web frontend project with its package.json and dependencies. ([19c60e6](https://github.com/Krugou/aurorawatcher/commit/19c60e6eb86077cb4e083ca99bea116061ccb913))
- Initialize web frontend project with React, Vite, and essential development tooling. ([37b3543](https://github.com/Krugou/aurorawatcher/commit/37b3543a908d140fdfc6c78a27d11d8319690eb4))
- restructure project into monorepo with web interface and bot automation ([d47d067](https://github.com/Krugou/aurorawatcher/commit/d47d0673325a4691fd4cff67c1b13f08f1beebb9))

# [1.1.0](https://github.com/Krugou/aurorawatcher/compare/v1.0.0...v1.1.0) (2026-01-30)

### Features

- Initialize React application with Vite and Tailwind CSS to display aurora and webcam data. ([7563a4d](https://github.com/Krugou/aurorawatcher/commit/7563a4dc8dda69fb0ea88d92727bb68af4d22018))

# 1.0.0 (2026-01-30)

### Features

- Add Dependabot configuration for npm and GitHub Actions dependency updates. ([819713c](https://github.com/Krugou/aurorawatcher/commit/819713c157fca26125d1d7dcd4c379eba2a71aea))
