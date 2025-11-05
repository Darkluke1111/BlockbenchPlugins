// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const fs = requireNativeModule('fs');
// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const path = requireNativeModule('path');

import { events } from "./util/events";
import PACKAGE from "../package.json";
import * as util from './util';
import { formatVS } from "./mods/formatMod";

// Actions
import "./debug_actions";
import "./actions";

// Mods
import "./mods/boneAnimatorMod";
import "./mods/formatMod";
import "./mods/settingsMod";


let toggleAutoConvertAction;
let onGroupAdd;
let onProjectLoad;

BBPlugin.register(PACKAGE.name, {
    title: PACKAGE.title,
    icon: 'icon',
    author: 'Darkluke1111, codename_B',
    description: 'Adds the Vintage Story format export/import options.',
    version: '0.9.1',
    variant: 'desktop',

    onload() {


        const auto_convert_vs_format_setting = new Setting("auto_convert_vs_format", {
            name: "Auto-Convert to VS Format",
            description: "Automatically convert projects to Vintage Story format when loading .bbmodel files",
            category: "Vintage Story",
            type: "toggle",
            value: true,
            onChange() {
                Settings.save();
            }
        });

        toggleAutoConvertAction = new Action('toggleAutoConvertVS', {
            name: 'Toggle Auto-Convert to VS Format',
            icon: 'fa-rotate',
            keybind: new Keybind({key: 'k', ctrl: true, shift: true}),
            click: function () {
                auto_convert_vs_format_setting.value = !auto_convert_vs_format_setting.value;
                Settings.save();
                Blockbench.showQuickMessage(
                    `Auto-convert ${auto_convert_vs_format_setting.value ? 'enabled' : 'disabled'}`,
                    2000
                );
            }
        });
        MenuBar.addAction(toggleAutoConvertAction, 'tools');

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


        const convertProjectToVSFormat = (): void => {
            if (!Project) return;

            // If already VS format, just ensure mesh orders are correct
            if (Project.format && Project.format.id === 'formatVS') {
                for (const group of Group.all) {
                    if (group.mesh && group.mesh.rotation) {
                        group.mesh.rotation.order = 'XYZ';
                    }
                }
                for (const cube of Cube.all) {
                    if (cube.preview_controller && cube.preview_controller.mesh && cube.preview_controller.mesh.rotation) {
                        cube.preview_controller.mesh.rotation.order = 'XYZ';
                    }
                }
                Canvas.updateAllBones();
                Canvas.updateAllPositions();
                Canvas.updateAll();
                return;
            }

            if (Project.vsFormatConverted) {
                // File already converted, just set format and display order
                Project.format.id = "formatVS";

                for (const group of Group.all) {
                    if (group.mesh && group.mesh.rotation) {
                        group.mesh.rotation.order = 'XYZ';
                    }
                }
                for (const cube of Cube.all) {
                    if (cube.preview_controller && cube.preview_controller.mesh && cube.preview_controller.mesh.rotation) {
                        cube.preview_controller.mesh.rotation.order = 'XYZ';
                    }
                }

                Canvas.updateAllBones();
                Canvas.updateAllPositions();
                Canvas.updateAll();
                return;
            }

            const old_format = Project.format?.id || 'unknown';
            // @ts-expect-error: euler_order is missing in blockbench types --- IGNORE ---
            const old_euler_order = Project.format?.euler_order || 'ZYX';

            // Convert rotation values for VS export
            if (old_euler_order !== 'XYZ') {
                for (const group of Group.all) {
                    if (group.rotation && (group.rotation[0] !== 0 || group.rotation[1] !== 0 || group.rotation[2] !== 0)) {
                        const old_rotation = [group.rotation[0], group.rotation[1], group.rotation[2]] as [number, number, number];
                        const new_rotation = util.zyx_to_xyz(old_rotation);
                        group.rotation = new_rotation;
                    }
                }

                for (const cube of Cube.all) {
                    if (cube.rotation && (cube.rotation[0] !== 0 || cube.rotation[1] !== 0 || cube.rotation[2] !== 0)) {
                        const old_rotation = [cube.rotation[0], cube.rotation[1], cube.rotation[2]] as [number, number, number];
                        const new_rotation = util.zyx_to_xyz(old_rotation);
                        cube.rotation = new_rotation;
                    }
                }
            }

            // Switch to VS format
            Project.format = formatVS;
            Project.vsFormatConverted = true;

            // Update canvas to create all meshes
            Canvas.updateAllBones();
            Canvas.updateAllPositions();
            Canvas.updateAll();

            // Force cube geometry update
            Canvas.updateView({
                elements: Cube.all,
                element_aspects: {
                    geometry: true,
                    transform: true
                }
            });

            // Set XYZ rotation order on all group meshes
            for (const group of Group.all) {
                if (group.mesh && group.mesh.rotation) {
                    group.mesh.rotation.order = 'XYZ';
                }
            }

            // Set XYZ rotation order on all cube meshes
            for (const cube of Cube.all) {
                if (cube.mesh && cube.mesh.rotation) {
                    cube.mesh.rotation.order = 'XYZ';
                }
            }

            // Refresh canvas with correct rotation orders
            Canvas.updateAllBones();
            Canvas.updateAllPositions();
            Canvas.updateAll();

            Blockbench.showQuickMessage('Converted to VS format', 3000);
        };

        // Do everything together with delay for elements to load
        onProjectLoad = () => {
            if (auto_convert_vs_format_setting.value) {
                setTimeout(convertProjectToVSFormat, 1000);
            }
        };

        Blockbench.on('load_project', onProjectLoad);

    },
    onunload() {
        toggleAutoConvertAction.delete();
        Blockbench.removeListener('add_group', onGroupAdd);
        Blockbench.removeListener('load_project', onProjectLoad);
        events.UNLOAD.dispatch();
    },
    oninstall() {
		events.INSTALL.dispatch();
	},
	onuninstall() {
		events.UNINSTALL.dispatch();
	},
});