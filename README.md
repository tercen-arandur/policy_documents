# Tercen Policy Documents

The master of Tercen's policy documents, published at <https://policies.tercen.com>.

| Document | Source | URL |
|---|---|---|
| Privacy Policy | `docs/privacy.md` | `/privacy/` |
| Terms of Service | `docs/terms-of-service.md` | `/terms-of-service/` |
| Cookies and Sub-processors | `docs/cookies-and-subprocessors.md` | `/cookies-and-subprocessors/` |
| Professional Services T&C | `docs/professional-services-terms.md` | `/professional-services-terms/` |
| Licence | `docs/policy-licence.md` | `/policy-licence/` |

www.tercen.com links to the first three, so those file names must not change. Each URL always shows
the latest release.

## Build and check

```sh
pip install -r requirements.txt
mkdocs build --strict        # the site, in site/
npm ci
npm test                     # the "Back to tercen.com" link, with hostile inputs
npm run links                # every link between pages of site/
npm run links:external       # links out of the site (report only in CI)
mkdocs serve                 # preview at http://127.0.0.1:8000/
```

The theme is in `theme/` and `docs/assets/`: Tercen's design tokens (`tokens.css`, from tercen-style),
self-hosted Fira Sans, and one script, `docs/assets/js/back-link.js`.

## Back to tercen.com

Every page has a "← Back to tercen.com" link. www.tercen.com links here with the page it came from,
`/privacy/?from=/contact-us/`, and the link goes back there: `https://www.tercen.com/contact-us/`. `from`
is decoded once and must be a plain path on www.tercen.com, starting with a single `/`. Anything
else, or no `from`, links to `https://www.tercen.com/`, and so does the page without JavaScript.

## Publishing

A release tag (`1.2.3`) publishes the site through GitHub Pages; nothing else does. See
`ci-staging/README.md` until the workflows there are moved into `.github/workflows/`.
