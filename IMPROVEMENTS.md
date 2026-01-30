# Project Improvements

## Status: All Planned Improvements Completed! 🚀

### Completed Items

#### Web Application (`web`)
- [x] **Internationalization (i18n)**: Implemented dual-language support (FI/EN).
- [x] **Unit Testing**: Added Vitest with coverage for utils and components.
- [x] **E2E Testing**: Added Cypress for user flow verification.
- [x] **Error Handling**: Added visual error states for images.
- [x] **Skeleton Loading**: Added loading states for better UX.
- [x] **Dark Mode Toggle**: Fully functional light/dark theme.
- [x] **Accessibility (a11y)**: Improved ARIA labels and contrast.

#### Discord Bot (`bot`)
- [x] **Slash Commands**: Migrated locally to `/ping`, `/status`, `/force`.
- [x] **Resilience**: Added timeouts and error handling for network requests.
- [x] **Status Updates**: Bot now updates rich presence based on aurora activity.

#### General / DevOps
- [x] **CI/CD Pipeline**: Created GitHub Actions for linting/testing (`ci.yml`) and web deployment (`deploy_web.yml`).
- [x] **Documentation**: Created comprehensive `README.md`.
- [x] **Type Safety**: Enforced `strict: true` in TypeScript configs.
