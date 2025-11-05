import { im } from "./import";
import { ex } from "./export";
import { get_format } from "./format_definition";
import * as vs_schema from "./generated/vs_shape_schema";

import PACKAGE from "../package.json";


import Ajv from "ajv";

// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const fs = requireNativeModule('fs');
// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const path = requireNativeModule('path');

import * as process from "process";
import { events } from "./util/events";


// Actions
import "./debug_actions";
import "./actions";

// Mods
import "./mods/boneAnimatorMod";


export let codecVS: Codec;

let onGroupAdd;



BBPlugin.register(PACKAGE.name, {
    title: PACKAGE.title,
    icon: 'icon',
    author: 'Darkluke1111, codename_B',
    description: 'Adds the Vintage Story format export/import options.',
    version: '0.9.1',
    variant: 'desktop',

    onload() {

        //Init additional Attribute Properties
        const game_path_setting = new Setting("game_path", {
            name: "Game Path",
            description: "The path to your Vintage Story game folder. This is the folder that contains the assets, mods and lib folders.",
            category: "Vintage Story",
            type: "click",
            icon: "fa-folder-plus",
            value: Settings.get("asset_path") || process.env.VINTAGE_STORY || "",
            click() {
                new Dialog("gamePathSelect", {
                    title: "Select Game Path",
                    form: {
                        path: {
                            label: "Path to your game folder",
                            type: "folder",
                            value: Settings.get("game_path") || process.env.VINTAGE_STORY || "",
                        }
                    },
                    onConfirm(formResult) {
                        game_path_setting.set(formResult.path);
                        Settings.save();
                    }
                }).show();
            }
        });

        onGroupAdd = function () {

            const group = Group.first_selected;
            if (!group) return;
            const parent = group.parent;
            if (parent && parent != "root" && parent.hologram) {
                group.stepParentName = parent.name.substring(0, parent.name.length - 6);
            }
        };

        Blockbench.on('add_group', onGroupAdd);

        codecVS = new Codec("codecVS", {
            name: "Vintage Story Codec",
            extension: "json",
            remember: true,
            load_filter: {
                extensions: ["json"],
                type: 'text',
                condition(model) {
                    const content = autoParseJSON(model);
                    return validate_json(content);
                }
            },
            compile(options) {
                // Removed for now since it doesn't work
                // resetStepparentTransforms();
                return ex(options);
            },
            parse(data, file_path, add) {
                im(data, file_path, false);
                // Removed for now since it doesn't work
                // loadBackDropShape();
                // resolveStepparentTransforms();
            },
        });

        function loadBackDropShape() {
            const backdrop = {};
            // @ts-expect-error: copy has wrong type
            editor_backDropShapeProp.copy(Project, backdrop);

            // @ts-expect-error: backDropShape is added by copy above
            const backDropShape = backdrop.backDropShape;
            if (backDropShape) {
                Blockbench.read([util.get_shape_location(null, backDropShape)], {
                    readtype: "text", errorbox: false
                }, (files) => {
                    im(files[0].content, files[0].path, true);
                });
            }
        }

        function resolveStepparentTransforms() {
            for (const g of Group.all) {
                const p = {};

                // @ts-expect-error: copy has wrong type
                props.stepParentProp.copy(g, p);
                // @ts-expect-error: stepParentName is added by copy above
                const stepParentName = p.stepParentName;
                if (stepParentName) {
                    const spg = Group.all.find(group => group.name === (stepParentName + "_group"));
                    if (spg) {
                        const sp = spg.children[0];
                        util.setParent(g, sp);
                        g.addTo(spg);
                    }
                }
            }
        }

        function resetStepparentTransforms() {
            for (const g of Group.all) {
                const p = {};
                // @ts-expect-error: copy has wrong type
                props.stepParentProp.copy(g, p);
                // @ts-expect-error: stepParentName is added by copy above
                const stepParentName = p.stepParentName;
                if (!g.hologram) {
                    const spg = Group.all.find(group => group.name === (stepParentName + "_group"));
                    if (spg) {
                        const sp = spg.children[0];

                        util.removeParent(g, sp);
                        g.addTo(undefined);
                    }
                }
            }
        }

        const formatVS = get_format(codecVS);
        codecVS.format = formatVS;

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

function validate_json(content) {
    const ajv = new Ajv();
    const validate = ajv.compile(vs_schema);
    const valid = validate(content);
    if (!valid) console.log(validate.errors);
    return valid;
}