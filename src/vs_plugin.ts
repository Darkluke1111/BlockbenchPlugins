import { im } from "./import";
import { ex } from "./export";
import { get_format } from "./format_definition";
import { editor_backDropShapeProp, GroupExt } from './property';
import * as util from './util';
import * as props from './property';
import * as vs_schema from "./generated/vs_shape_schema";
import patchBoneAnimator from "./patches/boneAnimatorPatch";

import Ajv from "ajv";


const fs = requireNativeModule('fs');
const path = requireNativeModule('path');

import * as process from "process";




let exportAction;
let importAction;
let reExportAction;
let debugAction;
let onGroupAdd;

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
            if (parent && parent != "root" && (parent as GroupExt).hologram) {
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
                Blockbench.read(util.get_shape_location(null, backDropShape), {
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
                        g.addTo("root");
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
    }
});

function validate_json(content) {
    const ajv = new Ajv();
    const validate = ajv.compile(vs_schema);
    const valid = validate(content);
    if (!valid) console.log(validate.errors);
    return valid;
}