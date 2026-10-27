#!/bin/bash
# Builds a release of <App>.app for Apple silicon into ./build/release: the app, a zip (Sparkle's update archive),
# a DMG (the download) and SHA256SUMS.
#
# Credentials, all optional (without them the build is ad-hoc signed, and other Macs need
# System Settings ▸ Privacy & Security ▸ Open Anyway on first launch):
#   DEVELOPER_ID="Developer ID Application: Name (TEAMID)"   # signing identity in the Keychain
#   NOTARY_PROFILE=<profile>     # a notarytool Keychain profile, made once with
#                                # xcrun notarytool store-credentials <profile> --apple-id … --team-id …
#   NOTARY_KEYCHAIN=<path>       # the keychain holding that profile, if not the login keychain (CI)
# VERSION and BUILD override ./VERSION and the commit-count build number (see build-app.sh).
#
# Template from the macos-app-releases skill: replace <App>.
set -euo pipefail
cd "$(dirname "$0")/.."

APP_NAME="<App>"
OUT="build/release"
APP="build/$APP_NAME.app"
missing=()
if [ -z "${DEVELOPER_ID:-}" ]; then
  missing+=("DEVELOPER_ID (a Developer ID Application identity)")
elif ! security find-identity -v -p codesigning | grep -qF "$DEVELOPER_ID"; then
  echo "error: no signing identity matching \"$DEVELOPER_ID\" in the Keychain" >&2
  exit 1
fi
if [ -z "${NOTARY_PROFILE:-}" ]; then missing+=("NOTARY_PROFILE (a notarytool Keychain profile)"); fi
if [ ! -s Resources/SparklePublicKey.txt ] && [ -z "${SPARKLE_PUBLIC_KEY:-}" ]; then missing+=("Resources/SparklePublicKey.txt (Sparkle's public key: without it the app can't update itself)"); fi

ARCH=arm64 SIGN_IDENTITY="${DEVELOPER_ID:--}" ./scripts/build-app.sh release
# Fails fast on a signing-order mistake instead of after a notarization round trip.
codesign --verify --deep --strict "$APP"

VERSION="$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$APP/Contents/Info.plist")"
BUILD="$(/usr/libexec/PlistBuddy -c "Print :CFBundleVersion" "$APP/Contents/Info.plist")"
BASE="$APP_NAME-$VERSION"
rm -rf "$OUT"
mkdir -p "$OUT"

make_zip() { ditto -c -k --sequesterRsrc --keepParent "$APP" "$OUT/$BASE.zip"; }

notarize() {
  xcrun notarytool submit "$1" --keychain-profile "$NOTARY_PROFILE" \
    ${NOTARY_KEYCHAIN:+--keychain "$NOTARY_KEYCHAIN"} --wait
}

if [ -n "${DEVELOPER_ID:-}" ] && [ -n "${NOTARY_PROFILE:-}" ]; then
  # notarytool takes a zip, not an .app: notarize through a throwaway zip, then staple the app so it opens offline,
  # and zip the stapled app again below.
  make_zip
  notarize "$OUT/$BASE.zip"
  xcrun stapler staple "$APP"
  rm "$OUT/$BASE.zip"
fi
make_zip

STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT
cp -R "$APP" "$STAGE/"
ln -s /Applications "$STAGE/Applications"
hdiutil create -quiet -volname "$APP_NAME $VERSION" -srcfolder "$STAGE" -fs HFS+ -format UDZO "$OUT/$BASE.dmg"
if [ -n "${DEVELOPER_ID:-}" ]; then
  # The DMG is signed, notarized and stapled on its own.
  codesign --force --sign "$DEVELOPER_ID" --timestamp "$OUT/$BASE.dmg"
  if [ -n "${NOTARY_PROFILE:-}" ]; then
    notarize "$OUT/$BASE.dmg"
    xcrun stapler staple "$OUT/$BASE.dmg"
  fi
fi
cp -R "$APP" "$OUT/"
(cd "$OUT" && shasum -a 256 "$BASE.zip" "$BASE.dmg" > SHA256SUMS)

echo "✓ $APP_NAME $VERSION ($BUILD) in $OUT: $APP_NAME.app, $BASE.zip, $BASE.dmg, SHA256SUMS"
if [ ${#missing[@]} -gt 0 ]; then
  echo "⚠ Not ready to ship (ad-hoc builds need Open Anyway on other Macs on first launch). Missing:"
  for item in "${missing[@]}"; do echo "  - $item"; done
fi
