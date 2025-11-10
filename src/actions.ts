import { createAction } from "./util/moddingTools";
import * as PACKAGE from "../package.json";
import { is_vs_project } from "./util";
import { im } from "./import";
import { is_backdrop_project } from "./util/misc";


const export_action = createAction(`${PACKAGE.name}:export_vs`, {
    name: 'Export into VS Format',
    icon: 'fa-cookie-bite',
    condition() {
        return is_vs_project();
    },
    click: function () {
        if (!Project) {
            throw new Error("No project loaded during export");
        }
        Blockbench.export({
            name: Project.name,
            type: 'json',
            extensions: ['json'],
            // codec should be valid if action condition is met
            content: Format.codec!.compile()
        });
    }
});
MenuBar.addAction(export_action, 'file.export');

const import_action = createAction(`${PACKAGE.name}:import_vs`, {
    name: 'Import from VS Format',
    icon: 'fa-cookie-bite',
    condition() {
        return is_vs_project();
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
        return is_vs_project();
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