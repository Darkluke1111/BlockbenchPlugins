import { createAction } from "./util/moddingTools";
import { codecVS } from "./vs_plugin";
import * as PACKAGE from "../package.json";


const export_action = createAction(`${PACKAGE.name}:export_vs`, {
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
MenuBar.addAction(export_action, 'file.export');

const import_action = createAction(`${PACKAGE.name}:import_vs`, {
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
MenuBar.addAction(import_action, 'file.import');