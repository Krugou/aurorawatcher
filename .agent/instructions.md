# Agent Instructions - Aurora Watcher

## Testing & Synchronization

- **NEVER sync/push without testing**. Always ensure that all local checks pass before pushing to the remote repository.
- **GitHub Actions Parity**: Before committing, you MUST ensure that the same checks performed in `.github/workflows/pipeline.yml` would pass locally. This includes:
  - **Linting**: `npm run lint -w aurorawatcher-web`
  - **Unit Tests**: `npm run test -w aurorawatcher-web`
  - **Type Checking**: `npx tsc -p web/tsconfig.json --noEmit`
  - **Build**: `npm run build` (Ensures both web and bot projects compile correctly)
- **Husky Integration**: The project uses Husky and `lint-staged` to enforce these checks. Do not bypass these hooks unless absolutely necessary for infrastructure reasons (and document why).

## Internationalization (i18n)

- **Every word via i18n**: All user-facing text must be internationalized using `react-i18next`.
- **Sync Locales**: When adding a new translation key, ensure it is added to both `en.json` and `fi.json`.

## Coding Standards

- **Neobrutalist Design**: Follow the established design patterns (bold borders, high contrast, vibrant colors).
- **TypeScript**: Maintain strict type safety. Avoid `any` where possible.
