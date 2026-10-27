#!/usr/bin/env bash
# Assembles build/<App>.app from the SwiftPM build, embeds Sparkle and signs everything, nested code first.
#   scripts/build-app.sh [release|dev|test]
#   SIGN_IDENTITY="Developer ID Application: …"   # real identity: hardened runtime + secure timestamp
#                                                 # (default: ad-hoc; scripts/release.sh sets it)
#   ARCH=arm64                                    # one architecture (release.sh sets it; default: this Mac's)
#   VERSION=1.2.3 BUILD=456                       # override ./VERSION and the commit-count build number
#   EXTENSIONS=1                                  # embed the app extensions in a dev/test build too
#
# Template from the macos-app-releases skill: replace the <placeholders> and drop what the app doesn't have.
# Resources/Info.plist needs CFBundleExecutable = <App> (the SwiftPM product), SUFeedURL and SUEnableAutomaticChecks.
set -euo pipefail
cd "$(dirname "$0")/.."

PRODUCT="<App>"              # SwiftPM executable product, also the executable and .app name
BASE_ID="<bundle id>"
ENTITLEMENTS="Resources/$PRODUCT.entitlements"
# App extensions: "<SwiftPM product>:<Info.plist>:<entitlements>:<bundle id suffix>", one per .appex; empty if none.
APPEXES=()
# APPEXES=("<App>QuickLook:Resources/QuickLook/Info.plist:Resources/QuickLook/QuickLook.entitlements:quicklook")

VARIANT="${1:-release}"
case "$VARIANT" in
  release) CONFIG=release; NAME="$PRODUCT";      BUNDLE_ID="$BASE_ID" ;;
  dev)     CONFIG=debug;   NAME="$PRODUCT Dev";  BUNDLE_ID="$BASE_ID.dev" ;;
  test)    CONFIG=debug;   NAME="$PRODUCT Test"; BUNDLE_ID="$BASE_ID.test" ;;
  *) echo "unknown variant: $VARIANT (release, dev or test)" >&2; exit 64 ;;
esac
# Extensions register system-wide providers: only the release build embeds them, unless EXTENSIONS=1.
if [[ -z "${EXTENSIONS:-}" ]]; then EXTENSIONS=$([[ "$VARIANT" == release ]] && echo 1 || echo 0); fi

# ./VERSION is the marketing version; the build number counts commits, so it only grows (Sparkle compares it).
# CI needs a full clone (actions/checkout with fetch-depth: 0), or every build is number 1.
VERSION="${VERSION:-$(tr -d '[:space:]' < VERSION)}"
BUILD="${BUILD:-$(git rev-list --count HEAD 2>/dev/null || echo 1)}"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

SWIFT_FLAGS=(-c "$CONFIG" --disable-keychain)  # never a Keychain prompt when packages download
if [[ -n "${ARCH:-}" ]]; then SWIFT_FLAGS+=(--arch "$ARCH"); fi
swift build "${SWIFT_FLAGS[@]}" --product "$PRODUCT"
# ${a[@]+"${a[@]}"}: macOS's bash 3.2 treats an empty array as unbound under set -u.
if [[ "$EXTENSIONS" == 1 ]]; then
  for ext in ${APPEXES[@]+"${APPEXES[@]}"}; do swift build "${SWIFT_FLAGS[@]}" --product "${ext%%:*}"; done
fi
BIN="$(swift build "${SWIFT_FLAGS[@]}" --show-bin-path)"
APP="build/$NAME.app"
PLIST="$APP/Contents/Info.plist"

rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources" "$APP/Contents/Frameworks"
cp "$BIN/$PRODUCT" "$APP/Contents/MacOS/$PRODUCT"
# SwiftPM also adds this checkout's build folder as an rpath; the bundle only needs @-relative ones.
otool -l "$APP/Contents/MacOS/$PRODUCT" | awk '/LC_RPATH/ { getline; getline; print $2 }' | { grep '^/' || true; } |
  while read -r path; do install_name_tool -delete_rpath "$path" "$APP/Contents/MacOS/$PRODUCT" 2>/dev/null; done
# Sparkle; ditto keeps the framework's symlinks.
ditto "$BIN/Sparkle.framework" "$APP/Contents/Frameworks/Sparkle.framework"
# Sparkle ships universal; a one-architecture build keeps only that slice (signed again below).
if [[ -n "${ARCH:-}" ]]; then
  find "$APP/Contents/Frameworks/Sparkle.framework" -type f -perm -u+x | while read -r binary; do
    archs="$(lipo -archs "$binary" 2>/dev/null || true)"
    if [[ " $archs " == *" $ARCH "* && "$archs" != "$ARCH" ]]; then lipo -thin "$ARCH" "$binary" -output "$binary"; fi
  done
fi
cp Resources/Info.plist "$PLIST"
cp Resources/PrivacyInfo.xcprivacy "$APP/Contents/Resources/"

pb() { /usr/libexec/PlistBuddy -c "$1" "$PLIST"; }
put() { pb "Delete :$1" >/dev/null 2>&1 || true; pb "Add :$1 string $2"; }
put CFBundleIdentifier "$BUNDLE_ID"
put CFBundleName "$NAME"
put CFBundleDisplayName "$NAME"
put CFBundleShortVersionString "$VERSION"
put CFBundleVersion "$BUILD"
# Updates: SUFeedURL and SUEnableAutomaticChecks are in Info.plist; the public EdDSA key comes from
# Resources/SparklePublicKey.txt. Dev and Test builds lose the feed, so they never update over the installed release.
if [[ "$VARIANT" == release ]]; then
  # No key file yet is a warning, not a failure (set -e would stop at a failed read).
  SPARKLE_PUBLIC_KEY="${SPARKLE_PUBLIC_KEY:-$({ tr -d '[:space:]' < Resources/SparklePublicKey.txt; } 2>/dev/null || true)}"
  if [[ -n "$SPARKLE_PUBLIC_KEY" ]]; then
    put SUPublicEDKey "$SPARKLE_PUBLIC_KEY"
  else
    echo "⚠ No Resources/SparklePublicKey.txt: this build can't update itself" >&2
  fi
else
  pb "Delete :SUFeedURL" >/dev/null 2>&1 || true
  pb "Delete :SUEnableAutomaticChecks" >/dev/null 2>&1 || true
fi

# App icon: Icon Composer .icon → Assets.car + AppIcon.icns (the macos-app-icons skill). Absolute paths: actool hands
# them to a long-lived daemon that resolves relative ones elsewhere. It can exit 0 on failure, so check its output.
if [[ -d Resources/AppIcon.icon ]]; then
  if ! xcrun actool "$PWD/Resources/AppIcon.icon" --compile "$PWD/$APP/Contents/Resources" --app-icon AppIcon \
      --platform macosx --target-device mac --minimum-deployment-target 26.0 \
      --output-partial-info-plist "$WORK/icon.plist" --errors --warnings >"$WORK/actool.log" ||
    [[ ! -f "$APP/Contents/Resources/Assets.car" ]]; then
    cat "$WORK/actool.log" >&2
    echo "✗ actool couldn't compile Resources/AppIcon.icon" >&2
    exit 1
  fi
  pb "Merge $WORK/icon.plist"
fi

if [[ "$EXTENSIONS" == 1 ]]; then
  for ext in ${APPEXES[@]+"${APPEXES[@]}"}; do
    IFS=: read -r product info _ suffix <<< "$ext"
    appex="$APP/Contents/PlugIns/$product.appex"
    mkdir -p "$appex/Contents/MacOS"
    cp "$BIN/$product" "$appex/Contents/MacOS/$product"
    cp "$info" "$appex/Contents/Info.plist"
    /usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier $BUNDLE_ID.$suffix" "$appex/Contents/Info.plist"
    for key in CFBundleShortVersionString CFBundleVersion; do
      /usr/libexec/PlistBuddy -c "Set :$key $(pb "Print :$key")" "$appex/Contents/Info.plist"
    done
  done
fi

# Sandboxed apps name Sparkle's services by bundle id, which differs per variant: the entitlements file says
# $(PRODUCT_BUNDLE_IDENTIFIER) and this fills it in. Harmless for apps without it.
sed "s/\$(PRODUCT_BUNDLE_IDENTIFIER)/$BUNDLE_ID/g" "$ENTITLEMENTS" > "$WORK/app.entitlements"

SIGN_IDENTITY="${SIGN_IDENTITY:--}"
SIGN_FLAGS=(--force --sign "$SIGN_IDENTITY")
# Notarization needs the hardened runtime and a secure timestamp, which ad-hoc signatures can't have.
if [[ "$SIGN_IDENTITY" != "-" ]]; then SIGN_FLAGS+=(--options runtime --timestamp); fi
# codesign without its "replacing existing signature" note (Sparkle's parts come pre-signed).
sign() { codesign "$@" 2> >(grep -v ': replacing existing signature$' >&2); }

# Nested code before the bundle that contains it, innermost first (Sparkle's documented order). Never sign with
# --deep: it gives every nested binary the same entitlements. The Downloader service keeps its own.
SPARKLE="$APP/Contents/Frameworks/Sparkle.framework/Versions/B"
sign "${SIGN_FLAGS[@]}" "$SPARKLE/XPCServices/Installer.xpc"
sign "${SIGN_FLAGS[@]}" --preserve-metadata=entitlements "$SPARKLE/XPCServices/Downloader.xpc"
sign "${SIGN_FLAGS[@]}" "$SPARKLE/Autoupdate"
sign "${SIGN_FLAGS[@]}" "$SPARKLE/Updater.app"
sign "${SIGN_FLAGS[@]}" "$APP/Contents/Frameworks/Sparkle.framework"
# Extensions (sandboxed, each with its own entitlements) and any helpers in Contents/Helpers go here, before the app.
if [[ "$EXTENSIONS" == 1 ]]; then
  for ext in ${APPEXES[@]+"${APPEXES[@]}"}; do
    IFS=: read -r product _ entitlements _ <<< "$ext"
    sign "${SIGN_FLAGS[@]}" --entitlements "$entitlements" "$APP/Contents/PlugIns/$product.appex"
  done
fi
sign "${SIGN_FLAGS[@]}" --entitlements "$WORK/app.entitlements" "$APP"
echo "✓ Built $APP ($VERSION, build $BUILD)"
