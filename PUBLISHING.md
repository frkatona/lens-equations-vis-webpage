## GitHub Pages Publishing

This repository can publish itself directly as a GitHub Pages project site.

That means it stays fully separate from your `username.github.io` repository.
You do not need to copy files into your user Pages repo, sync between repos, or grant this repo write access to that other repo.

If this repository is named `lens-equations`, the Pages URL will be:

`https://<your-account>.github.io/lens-equations/`

### One-time setup

1. Push this repository to GitHub.
2. In this repository on GitHub, open `Settings` -> `Pages`.
3. Set the source to `GitHub Actions`.
4. Push to `main` or `master`, or run the `Deploy GitHub Pages` workflow manually.

### What gets published

The workflow publishes:

- `index.html`
- `styles.css`
- `app.js`
- `assets/` if that folder exists

### Notes

- This is a GitHub Pages project site, not a user site.
- Per GitHub’s Pages docs, project sites are served from the project repository and use the `/<repository>/` path on your `github.io` domain.
- The current app already uses relative asset paths, so it works correctly from a subpath.
