
const { debug } = require('console');
const path = require('node:path');
const ex = require("./export.js");
const im = require("./import.js");
const format_definition = require("./format_definition.js");
const { editor_backDropShapeProp } = require('./property.js');
const util = require('./util.js');
const props = require('./property.js');



let exportAction
let importAction
let reExportAction
let debugAction

Plugin.register('vs_plugin', {
    title: 'Vintage Story Format Support',
    icon: 'icon',
    author: 'Darkluke1111',
    description: 'Adds the Vintage Story format export/import options.',
    version: '1.0.0',
    variant: 'desktop',

    onload() {
        //Init additional Attribute Properties
        let game_path_setting = new Setting("game_path", {
            name: "Game Path",
            description: "The path to your Vintage Story game folder. This is the folder that contains the assets, mods and lib folders.",
            type: "click",
            icon: "fa-folder-plus",
            value: Settings.get("asset_path") || process.env.VINTAGE_STORY || null,
            click() {

                new Dialog("gamePathSelect", {
                    title: "Select Game Path",
                    form: {
                        path: {
                            label: "Path to your texture folder",
                            type: "folder",
                            value: Settings.get("game_path") || process.env.VINTAGE_STORY || null,
                        }

                    },
                    onConfirm(formResult) {
                        game_path_setting.set(formResult.path);
                        Settings.save()
                    }
                }).show();

            }
        })

        let codecVS = new Codec("codecVS", {
            name: "Vintage Story Codec",
            extension: "json",
            remember: true,
            load_filter: {
                extensions: ["json"],
                type: 'text',
            },
            compile(options) {
                return ex(options)
            },
            parse(data, file_path, add) {
                im(data, file_path, false)
                loadBackDropShape()
                resolveStepparentTransforms()
            },
        })

        function loadBackDropShape() {
            let backDrop = {}
            editor_backDropShapeProp.copy(Project, backDrop)
            console.log(backDrop.backDropShape)
            if (backDrop.backDropShape) {
                Blockbench.read(util.get_shape_location(null, backDrop.backDropShape), {
                    readtype: "text", errorbox: false
                }, (files) => {
                    im(files[0].content, files[0].path, true)
                })

            }
        }



        function resolveStepparentTransforms() {
            for (var g of Group.all) {
                let p = {}
                props.stepParentProp.copy(g, p)
                if (p.stepParentName) {
                    let spg = Group.all.find(g => g.name === (p.stepParentName + "_group"))
                    let sp = spg.children[0]
                    console.log(sp)

                    util.setParent(g, sp)
                    g.addTo(spg);
                }
            }
        }

        let formatVS = format_definition(codecVS)
        codecVS.format = formatVS


        exportAction = new Action('exportVS', {
            name: 'Export into VS Format',
            icon: 'fa-cookie-bite',
            click: function () {

                Blockbench.export({
                    name: Project.name,
                    type: 'json',
                    extensions: ['json'],
                    content: codecVS.compile(),
                });
            }

        })
        MenuBar.addAction(exportAction, 'file.export');



        importAction = new Action('importVS', {
            name: 'Import from VS Format',
            icon: 'fa-cookie-bite',
            click: function () {
                Blockbench.import({
                    type: 'json',
                    extensions: ['json'],
                }, function (files) {
                    codecVS.parse(files[0].content)
                });
            }

        })
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
                        let test_folder = form_result.select_folder;

                        let test_files = fs.readdirSync(test_folder);
                        for (var test_file of test_files) {
                            if (!test_file.includes("reexport")) {
                                let project = new ModelProject({ format: formatVS })
                                project.select()
                                try {
                                    let = Blockbench.read(test_folder + path.sep + test_file, { readtype: "text", errorbox: false }, (files) => {
                                        console.log("Importing " + test_file)
                                        codecVS.parse(files[0].content, test_folder + path.sep + test_file, false);
                                        console.log("Exporting " + test_file)
                                        let reexport_content = codecVS.compile()
                                        let reexport_path = test_folder + path.sep + "reexport_" + path.basename(test_file)
                                        Blockbench.writeFile(reexport_path, {
                                            content: reexport_content,
                                            savetype: "text"
                                        })
                                    });
                                    //fs.writeFileSync(test_folder + path.sep  + "diff_" + path.basename(test_file), jsonDiff.diffString(JSON.parse(content),JSON.parse(reexport_content), { precision: 3}))
                                } catch (e) {
                                    console.error(e);
                                }
                                project.close(true)
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
                console.log(Outliner.selected)
            }
        });
        MenuBar.addAction(debugAction, "edit");
        Outliner.control_menu_group.push(debugAction.id);
    },
    onunload() {
        exportAction.delete();
        importAction.delete();
        reExportAction.delete();
        debugAction.delete()
    }
});