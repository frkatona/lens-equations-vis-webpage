## User Pages Subpage Publishing

This repo includes a workflow that can publish the app into a subfolder of the account's existing `username.github.io` repository.

### What it does

- On push to `main` or `master`, `.github/workflows/publish-to-user-pages.yml` clones `${owner}.github.io`.
- It copies the files listed in `pages-subpage.manifest` into a subfolder.
- By default, that subfolder is this repository's name, so the resulting URL is usually:
  `https://<owner>.github.io/<this-repo-name>/`

### One-time setup

1. Create a fine-grained personal access token that can read and write `Contents` on your `username.github.io` repository.
2. Add that token to this repository as a secret named `PAGES_PUBLISH_TOKEN`.
3. Make sure the `username.github.io` repository itself is already configured to serve GitHub Pages from its default publishing source.

### Optional repository variables

- `PAGES_SUBPAGE`
  Use this if you want a custom subfolder name instead of this repository's name.

- `PAGES_TARGET_ROOT`
  Use this only if your Pages repository publishes from a subdirectory such as `docs`.
  Leave it unset to publish into the root of `username.github.io`.

### Published file list

The workflow publishes the paths listed in `pages-subpage.manifest`.
Right now that list is:

- `index.html`
- `styles.css`
- `app.js`

If you add assets later, add them to the manifest too.
