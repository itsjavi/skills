import AppKit
import Sparkle
import SwiftUI

// Sparkle 2 wiring for a SwiftPM app (template from the macos-app-releases skill).
// Info.plist: SUFeedURL and SUEnableAutomaticChecks; build-app.sh adds SUPublicEDKey to release builds and removes
// the feed from Dev and Test builds, so they have no updater and never replace the installed release.

/// Checks the update feed and installs new versions.
enum AppUpdater {
    /// nil without a feed and a public key (Dev and Test builds): the menu item is disabled there.
    static let controller: SPUStandardUpdaterController? = {
        let info = Bundle.main.infoDictionary ?? [:]
        guard info["SUFeedURL"] is String, (info["SUPublicEDKey"] as? String)?.isEmpty == false else { return nil }
        return SPUStandardUpdaterController(startingUpdater: false, updaterDelegate: nil, userDriverDelegate: nil)
    }()

    /// Call from applicationDidFinishLaunching. Started a second later: Sparkle's first-run prompt, shown during
    /// launch, once kept the main window from ever opening.
    static func start() {
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            MainActor.assumeIsolated { controller?.startUpdater() }
        }
    }

    static var canCheckForUpdates: Bool { controller?.updater.canCheckForUpdates ?? false }

    static func checkForUpdates() {
        controller?.checkForUpdates(nil)
    }
}

/// SwiftUI: `.commands { UpdateCommands() }` puts it right after About in the app menu.
struct UpdateCommands: Commands {
    var body: some Commands {
        CommandGroup(after: .appInfo) {
            Button("Check for Updates…") { AppUpdater.checkForUpdates() }
                .disabled(AppUpdater.controller == nil)
        }
    }
}

// AppKit menu instead:
//
//     menu.addItem(NSMenuItem(title: "Check for Updates…", action: #selector(AppDelegate.checkForUpdates(_:)),
//                             keyEquivalent: ""))
//
//     @objc func checkForUpdates(_ sender: Any?) { AppUpdater.checkForUpdates() }
//
//     func validateMenuItem(_ menuItem: NSMenuItem) -> Bool {
//         if menuItem.action == #selector(checkForUpdates(_:)) { return AppUpdater.canCheckForUpdates }
//         return true
//     }
