import { createAction } from "./util/moddingTools";
import * as PACKAGE from "../package.json";
import { is_vs_project } from "./util";


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
            Format.codec!.parse!(files[0].content, files[0].path);
        });
    }
});
MenuBar.addAction(import_action, 'file.import');