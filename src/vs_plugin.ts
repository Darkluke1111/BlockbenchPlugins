// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const fs = requireNativeModule('fs');
// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const path = requireNativeModule('path');

import { events } from "./util/events";
import PACKAGE from "../package.json";

// Actions
import "./debug_actions";
import "./actions";

// Mods
import "./mods/boneAnimatorMod";
import "./mods/formatMod";
import "./mods/settingsMod";


let onGroupAdd;

BBPlugin.register(PACKAGE.name, {
    title: PACKAGE.title,
    icon: 'icon',
    author: 'Darkluke1111, codename_B',
    description: 'Adds the Vintage Story format export/import options.',
    version: '0.9.1',
    variant: 'desktop',

    onload() {
        onGroupAdd = function () {

            const group = Group.first_selected;
            if (!group) return;
            const parent = group.parent;
            if (parent && parent != "root" && parent.hologram) {
                group.stepParentName = parent.name.substring(0, parent.name.length - 6);
            }
        };

        Blockbench.on('add_group', onGroupAdd);

        events.LOAD.dispatch();
    },
    onunload() {
        Blockbench.removeListener('add_group', onGroupAdd);
        events.UNLOAD.dispatch();
    },
    oninstall() {
		events.INSTALL.dispatch();
	},
	onuninstall() {
		events.UNINSTALL.dispatch();
	},
});