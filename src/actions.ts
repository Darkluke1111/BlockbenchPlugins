import { createAction } from "./util/moddingTools";
import * as PACKAGE from "../package.json";
import { is_vs_project } from "./util";
import { im } from "./import";
import { is_backdrop_project } from "./util/misc";
import { codecVS } from "./codec";
import { ex } from "./export";

// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const fs = requireNativeModule('fs');
// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const path = requireNativeModule('path');

const export_action = createAction(`${PACKAGE.name}:export_vs`, {
    name: 'Export into VS Format',
    icon: 'fa-cookie-bite',
    condition() {
        return is_vs_project(Project);
    },
    click: function () {
        if (!Project) {
            throw new Error("No project loaded during export");
        }

        // Use Blockbench's file save dialog
        Blockbench.export({
            name: Project.name,
            type: 'json',
            extensions: ['json'],
            savetype: 'text',
            content: ''  // We'll save manually after getting the path
        }, (exportPath) => {
            // This callback receives the path where the user wants to save
            if (!exportPath) return;

            // Get the export directory
            const exportDir = path.dirname(exportPath);

            // Call ex() with the export directory
            const data = ex({ path: exportPath, exportDir: exportDir });

            // Save the JSON file
            const jsonContent = autoStringify(data);
            fs.writeFileSync(exportPath, jsonContent);

            Blockbench.showQuickMessage('Model and textures exported successfully');
        });
    }
});
MenuBar.addAction(export_action, 'file.export');

const import_action = createAction(`${PACKAGE.name}:import_vs`, {
    name: 'Import from VS Format',
    icon: 'fa-cookie-bite',
    condition() {
        return is_vs_project(Project);
    },
    click: function () {
        Blockbench.import({
            type: 'json',
            extensions: ['json'],
        }, function (files) {
            // codec and parse should be valid if action condition is met
            im(autoParseJSON(files[0].content as string), files[0].path, false);
        });
    }
});
MenuBar.addAction(import_action, 'file.import');

const import_backdrop_action = createAction(`${PACKAGE.name}:import_backdrop_action`, {
    name: 'Import Backdrop from VS Format',
    icon: 'fa-cookie-bite',
    condition() {
        return is_vs_project(Project);
    },
    click: function () {
        Blockbench.import({
            type: 'json',
            extensions: ['json'],
        }, function (files) {
            if (is_backdrop_project()) {
                Blockbench.showQuickMessage("There is already a backdrop in this project.");
            } else {
                im(autoParseJSON(files[0].content as string), files[0].path, true);
            }
        });
    }
});
MenuBar.addAction(import_backdrop_action, 'file.import');