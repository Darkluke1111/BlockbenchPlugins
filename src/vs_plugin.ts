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
    icon: 'icon',
    author: 'Darkluke1111, codename_B',
    description: 'Adds the Vintage Story format export/import options.',
    version: '0.9.1',
    variant: 'desktop',

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