import { im } from "./import";
import { ex } from "./export";
import { get_format } from "./format_definition";
import * as util from './util';
import * as props from './property';
import * as vs_schema from "./generated/vs_shape_schema";
import patchBoneAnimator from "./patches/boneAnimatorPatch";

import Ajv from "ajv";

// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const fs = requireNativeModule('fs');
// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const path = requireNativeModule('path');

import * as process from "process";




let exportAction;
let importAction;
let reExportAction;
let debugAction;
let onGroupAdd;
let onProjectLoad;

BBPlugin.register('vs_plugin', {
    title: 'Vintage Story Format Support',
    icon: 'icon',
    author: 'Darkluke1111, codename_B',
    description: 'Adds the Vintage Story format export/import options.',
    version: '0.9.1',
    variant: 'desktop',

    onload() {
        patchBoneAnimator();

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

        const auto_convert_vs_format_setting = new Setting("auto_convert_vs_format", {
            name: "Auto-Convert to VS Format",
            description: "Automatically convert projects to Vintage Story format when loading .bbmodel files",
            category: "Vintage Story",
            type: "toggle",
            value: true,
            onChange(_value: boolean) {
                Settings.save();
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

        const codecVS = new Codec("codecVS", {
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


        exportAction = new Action('exportVS', {
            name: 'Export into VS Format',
            icon: 'fa-cookie-bite',
            click: function () {
                if (!Project) {
                    throw new Error("No project loaded during export");
                }
                Blockbench.export({
                    name: Project.name,
                    type: 'json',
                    extensions: ['json'],
                    content: codecVS.compile(),
                });
            }
        });
        MenuBar.addAction(exportAction, 'file.export');

        importAction = new Action('importVS', {
            name: 'Import from VS Format',
            icon: 'fa-cookie-bite',
            click: function () {
                Blockbench.import({
                    type: 'json',
                    extensions: ['json'],
                }, function (files) {
                    codecVS.parse!(files[0].content, files[0].path);
                });
            }
        });
        MenuBar.addAction(importAction, 'file.import');

        const convertProjectToVSFormat = (): void => {
            if (!Project) return;
            if (Project.format && Project.format.id === 'formatVS') return;
            if (Project.vsFormatConverted) {
                // File already converted, just set format and display order
                Project.format = formatVS;

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

            // Update mesh display order
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

            Blockbench.showQuickMessage('Converted to VS format', 3000);
        };

        // Do everything together with delay for elements to load
        onProjectLoad = () => {
            if (auto_convert_vs_format_setting.value) {
                setTimeout(convertProjectToVSFormat, 1000);
            }
        };

        Blockbench.on('load_project', onProjectLoad);

        reExportAction = new Action("reExport", {
            name: 'Reexport Test',
            icon: 'fa-flask-vial',
            click: function () {
                new Dialog("folder_select", {
                    title: "Select Folder",
                    form: {
                        select_folder: {
                            label: "Select Folder to test",
                            description: "This Action is made for testing. If you don't know what it does, you probably should not use it.",
                            type: "folder",
                        }
                    },
                    onConfirm(form_result) {
                        const test_folder = form_result.select_folder;
                        console.log(test_folder);
                        const test_files = fs!.readdirSync(test_folder, { recursive: true, encoding: "utf-8" });
                        for (const test_file of test_files) {
                            if (!test_file.includes("reexport_")) {

                                const test_file_rel_path = test_folder + path.sep + path.dirname(test_file);
                                const test_file_name = path.basename(test_file);

                                const input_path = path.resolve(test_folder, test_file_rel_path, test_file_name);
                                const output_path = path.resolve(test_folder, test_file_rel_path, `reexport_${test_file_name}`);

                                if (!fs?.statSync(input_path).isFile()) continue;
                                try {


                                    Blockbench.readFile([input_path], {}, (files) => {
                                        //@ts-expect-error: Missing in type --- IGNORE ---
                                        loadModelFile(files[0],[]);

                                        const reexport_content = codecVS.compile();

                                        Blockbench.writeFile(output_path, {
                                            content: reexport_content,
                                            savetype: "text"
                                        });
                                    });

                                    

                                } catch (e) {
                                    console.error(e);
                                }
                                // project.close(true);
                            }
                        }
                    }
                }).show();
            }
        });
        MenuBar.addAction(reExportAction, "file");

        debugAction = new Action("printDebug", {
            name: 'Print Debug Info',
            icon: 'icon',
            click: function () {
                console.log(Outliner.selected);
            }
        });
        MenuBar.addAction(debugAction, "edit");
        Outliner.control_menu_group.push(debugAction.id);
    },
    onunload() {
        exportAction.delete();
        importAction.delete();
        reExportAction.delete();
        debugAction.delete();
        Blockbench.removeListener('add_group', onGroupAdd);
        Blockbench.removeListener('load_project', onProjectLoad);
    }
});

function validate_json(content) {
    const ajv = new Ajv();
    const validate = ajv.compile(vs_schema);
    const valid = validate(content);
    if (!valid) console.log(validate.errors);
    return valid;
}