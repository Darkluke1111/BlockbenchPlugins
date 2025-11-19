// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const fs = requireNativeModule('fs');
// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const path = requireNativeModule('path');

import { events } from "./util/events";
import PACKAGE from "../package.json";

// Actions
import "./debug_actions";
import "./actions";

// Properties
import "./property";

// Mods
import "./mods/boneAnimatorMod";
import "./mods/formatMod";
import "./mods/settingsMod";
import "./mods/legacyFormatConverterMod";
import "./mods/nodePreviewControllerMod";

BBPlugin.register(PACKAGE.name, {
    title: PACKAGE.title,
    icon: 'fa-cookie-bite',
    author: PACKAGE.author.name,
    contributors: PACKAGE.contributors.map(x => x.name),
    description: PACKAGE.description,
    version: PACKAGE.version,
    variant: 'desktop',
    min_version: "5.0.0",
    repository: PACKAGE.repository.url,
    tags: ["Vintage Story"],
    about: PACKAGE.description,
    onload() {
        events.LOAD.dispatch();
    },
    onunload() {
        events.UNLOAD.dispatch();
    },
    oninstall() {
		events.INSTALL.dispatch();
	},
	onuninstall() {
		events.UNINSTALL.dispatch();
	},
});