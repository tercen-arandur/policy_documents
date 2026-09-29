# Staged workflows

Workflow files the builder can't push to `.github/workflows/`. To put them in place:

1. Move `ci.yml` and `release.yml` to `.github/workflows/`.
2. Delete `.github/workflows/docs_ci.yaml` and `.github/workflows/docs_release.yaml`. They build with
   `mike` and publish by pushing to `gh-pages`, which `release.yml` replaces.
3. Delete this directory.

Repository settings `release.yml` needs (the maintainer's, not a file):

- **Pages → Source:** GitHub Actions. **Custom domain:** `policies.tercen.com`, with HTTPS enforced.
  (`docs/CNAME` names the domain too, but a Pages artifact deployment takes it from the setting.)
- **Environments → github-pages → Deployment branches and tags:** allow tags matching `*.*.*`. By default
  the environment only accepts the default branch, and a tag deployment would be refused.
- The DNS record: `policies.tercen.com` CNAME to `tercen-arandur.github.io`.
