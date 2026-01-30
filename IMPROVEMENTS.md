# Project Improvements

## Web Application (`web`)
- [ ] **Internationalization (i18n)**: Support multiple languages (e.g., English) using `i18next` instead of hardcoded Finnish strings.
- [ ] **Unit Testing**: Add `vitest` to test utility functions like `checkImageColor` and component logic.
- [ ] **E2E Testing**: Add `Cypress` for end-to-end testing of the user flow.
- [ ] **Error Handling**: Add visual error states for image loading failures (e.g., if FMI is down).
- [ ] **Skeleton Loading**: Add skeleton screens or spinners while images are fetching to improve perceived performance.
- [ ] **Dark Mode Toggle**: Although currently dark-themed, a toggle or system preference sync could be added for a light mode if desired.
- [ ] **Accessibility (a11y)**: Audit and improve keyboard navigation and screen reader support (ARIA labels) further.

## Discord Bot (`bot`)
- [ ] **Slash Commands**: Ensure all commands are implemented as modern Discord slash commands.
- [ ] **Resilience**: Improve error handling for network timeouts or API failures.
- [ ] **Status Updates**: Set the bot's rich presence status based on current aurora activity levels.

## General / DevOps
- [ ] **CI/CD Pipeline**: Create GitHub Actions workflows to:
    - Run linting and tests on pull requests.
    - Automatically build and deploy the web app (e.g., to GitHub Pages).
- [ ] **Documentation**: Expand `README.md` with development setup instructions for both `web` and `bot`.
- [ ] **Type Safety**: Stricter TypeScript configuration (e.g., `noImplicitAny`) where possible.
