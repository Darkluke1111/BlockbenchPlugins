import { createAction } from "./util/moddingTools";
import { codecVS } from "./vs_plugin";
import * as PACKAGE from "../package.json";

// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const path = requireNativeModule('path');


const reExportAction = createAction(`${PACKAGE.name}:reExport`, {
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
                                loadModelFile(files[0], []);

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

const debugAction = createAction(`${PACKAGE.name}:printDebug`, {
    name: 'Print Debug Info',
    icon: 'icon',
    click: function () {
        console.log(Outliner.selected);
    }
});
MenuBar.addAction(debugAction, "edit");