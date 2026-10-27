# Releasing <App>

<!-- Template from the macos-app-releases skill: replace <App>, <app>, <owner>/<repo> and <profile>, and link the
     project's decision record. -->

For maintainers. Releases and the update feed live on GitHub Releases. There are two routes: from the Release workflow
once the `release` environment has the secrets below, or from a Mac with the credentials already in its Keychain (no
GitHub secrets).

## From the Release workflow

```bash
make bump V=0.1.0 PUSH=1          # first release: tags the current VERSION (no bump), pushes main and v0.1.0
make bump V=patch PUSH=1          # bump VERSION, tag vX.Y.Z on main, push → the Release workflow publishes it
make bump V=0.2.0-beta.1 PUSH=1   # a GitHub pre-release: no update feed, installed copies never get it
```

Pushing a `vX.Y.Z` tag runs `.github/workflows/release.yml`: it tests, builds for Apple silicon, signs with Developer
ID, notarizes and staples the app and the DMG, and publishes a GitHub Release named after the tag with
`<App>-X.Y.Z.dmg`, `<App>-X.Y.Z.zip`, `SHA256SUMS` and `appcast.xml`. The tag must match `./VERSION`. Without `PUSH=1`,
`make bump` only commits and tags locally and prints the push command.

A `vX.Y.Z-<pre-release>` tag publishes a GitHub pre-release with the same files except `appcast.xml`. GitHub never marks
a pre-release as the latest release, so the feed, the website and the README's download link skip it. After a
pre-release, name the next version (`make bump V=0.2.0` or `V=0.2.0-beta.2`): `major`, `minor` and `patch` need an X.Y.Z
`VERSION`.

`./VERSION` is the app's version (`CFBundleShortVersionString`); the build number (`CFBundleVersion`) is the commit
count, so it only grows and Sparkle can compare builds. `scripts/build-app.sh` sets both.

## From a Mac (no secrets)

```bash
make bump V=X.Y.Z                 # tag locally (V=patch etc. bumps VERSION first); nothing is pushed
make build-notarized              # Developer ID + the <profile> notarytool profile from the Keychain
make appcast                      # signs the feed with the Sparkle key in the Keychain (account <app>)
git push --atomic origin main vX.Y.Z
gh release create vX.Y.Z build/release/<App>-X.Y.Z.dmg build/release/<App>-X.Y.Z.zip \
  build/release/SHA256SUMS build/appcast/appcast.xml --title vX.Y.Z --verify-tag \
  --notes-file <(scripts/changelog.sh notes X.Y.Z)
```

The pushed tag still starts the Release workflow, but it leaves an existing release alone. Create the release right
after pushing: the workflow tests and builds for several minutes before it would publish its own.

## Release notes

`make bump` adds the release's section to `CHANGELOG.md` (`scripts/changelog.sh`) and commits it with `VERSION`: the
Conventional Commits since the previous release (a stable release counts from the previous stable one), grouped as
breaking changes (`feat!:` or a `BREAKING CHANGE:` footer), features (`feat`), fixes (`fix`) and performance (`perf`).
Other types (`chore`, `build`, `ci`, `docs`, `refactor`, `style`, `test`) are left out, so write user-facing changes as
`feat`, `fix` or `perf` with a subject that reads well in a list. That section is the GitHub release's description and,
embedded in `appcast.xml`, what Sparkle's update window shows.

To reword the notes before releasing: `make bump V=patch` (no `PUSH`), edit `CHANGELOG.md`, `git commit --amend`,
`git tag -fa vX.Y.Z`, then `git push --atomic origin main vX.Y.Z`.

## Update feed

Info.plist's `SUFeedURL` is `https://github.com/<owner>/<repo>/releases/latest/download/appcast.xml`, the feed attached
to the newest release. `make appcast` (`scripts/appcast.sh`) downloads that feed, adds the new build and signs it, so it
lists every release; each item links to the zip in its own release (`releases/download/vX.Y.Z/`). It refuses
pre-releases and a key that doesn't match the app's public key. Only release builds have an updater (<App> ▸ Check for
Updates…, and automatic checks); the Dev and Test builds never update themselves.

Sparkle's private EdDSA key lives in the login Keychain under the account `<app>` (never in the repo); the public key is
`Resources/SparklePublicKey.txt`. They were made once, before the first release, with:

```bash
swift package resolve
.build/artifacts/sparkle/Sparkle/bin/generate_keys --account <app>
```

Export the private key (`generate_keys --account <app> -x <app>-sparkle.key`) for the `SPARKLE_PRIVATE_KEY` secret and
keep a backup outside the repo. Losing it means installed copies can't accept updates signed with a new key. Without the
public key file, release builds can't update themselves (`make release` warns).

## Credentials

The workflow's secrets live in the `release` environment (Settings ▸ Environments), which only `v*` tags can use. Every
one is optional: without them the build is ad-hoc signed (other Macs need System Settings ▸ Privacy & Security ▸ Open
Anyway on first launch) and has no feed, and the release notes say so.

| Secret                      | What it is                                                                     |
| --------------------------- | ------------------------------------------------------------------------------ |
| `DEVELOPER_ID_P12`          | The Developer ID Application certificate and its private key, as a base64 .p12 |
| `DEVELOPER_ID_P12_PASSWORD` | The password the .p12 was exported with                                        |
| `APPLE_ID`                  | The Apple Account that notarizes                                               |
| `APPLE_APP_PASSWORD`        | An app-specific password for it (account.apple.com ▸ Sign-In and Security)     |
| `APPLE_TEAM_ID`             | The team that owns the certificate                                             |
| `SPARKLE_PRIVATE_KEY`       | The exported Sparkle private key (account `<app>`)                             |

## Building a release locally

```bash
DEVELOPER_ID="Developer ID Application: Name (TEAMID)" NOTARY_PROFILE=<profile> make release
```

`make release` (`scripts/release.sh`) writes `<App>.app`, the zip, the DMG and `SHA256SUMS` to `build/release`. It signs
and notarizes when `DEVELOPER_ID` (from `security find-identity -v -p codesigning`) and `NOTARY_PROFILE` are set; any
notarytool profile for the team works (`xcrun notarytool store-credentials <name> --apple-id … --team-id …`). Otherwise
it builds ad-hoc and lists what's missing. Check a build with `spctl -a -vv build/release/<App>.app` and
`xcrun stapler validate build/release/<App>-X.Y.Z.dmg`.

`make build-notarized` does the same with the Keychain's Developer ID identity and the `<profile>` profile (override
them with `DEVELOPER_ID` and `NOTARY_PROFILE`); without an identity it stops instead of building ad-hoc.
`make install-notarized` then installs that app to `/Applications`.
