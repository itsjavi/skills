# Release targets for the app's Makefile (paste them in; recipes need tabs).
# Template from the macos-app-releases skill: replace <App>, <bundle id> and <profile> (the notarytool Keychain
# profile; any profile of the team works, so apps of one team can share it).
APP_NAME := <App>
BUNDLE_ID := <bundle id>
NOTARY_PROFILE_DEFAULT := <profile>

.PHONY: app release build-notarized install-notarized appcast bump

app:
	scripts/build-app.sh release

# Apple silicon app, zip, DMG and SHA256SUMS in build/release; signs and notarizes when DEVELOPER_ID and
# NOTARY_PROFILE are set, otherwise builds ad-hoc and lists what's missing (scripts/release.sh).
release:
	scripts/release.sh

# scripts/release.sh with this Mac's credentials: DEVELOPER_ID defaults to the Keychain's Developer ID Application
# identity and NOTARY_PROFILE to $(NOTARY_PROFILE_DEFAULT). Without an identity it stops instead of building ad-hoc.
# Notarization uploads the build to Apple.
build-notarized:
	@identity="$${DEVELOPER_ID:-$$(security find-identity -v -p codesigning | sed -n 's/.*"\(Developer ID Application: .*\)"/\1/p' | head -1)}"; \
	if [ -z "$$identity" ]; then echo "error: no Developer ID Application identity in the Keychain (docs/releasing.md)" >&2; exit 1; fi; \
	DEVELOPER_ID="$$identity" NOTARY_PROFILE="$${NOTARY_PROFILE:-$(NOTARY_PROFILE_DEFAULT)}" scripts/release.sh

# Replaces /Applications/<App>.app with the notarized build (quits the running copy first). The user's call.
install-notarized: build-notarized
	-osascript -e 'tell application id "$(BUNDLE_ID)" to quit' 2>/dev/null
	rm -rf "/Applications/$(APP_NAME).app"
	cp -R "build/release/$(APP_NAME).app" "/Applications/$(APP_NAME).app"

# Signs build/release's zip (Sparkle key from the login Keychain) and updates build/appcast/appcast.xml.
appcast:
	scripts/appcast.sh

# Bumps VERSION, commits and tags it: make bump V=patch|minor|major|X.Y.Z[-beta.N] [PUSH=1] (docs/releasing.md)
bump:
	scripts/bump-version.sh $(V) $(if $(PUSH),--push)
