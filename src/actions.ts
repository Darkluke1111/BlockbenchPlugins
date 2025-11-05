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


const toggle_auto_convert_vs = createAction(`${PACKAGE.name}:toggle_auto_convert_vs`, {
            name: 'Toggle Auto-Convert to VS Format',
            icon: 'fa-rotate',
            keybind: new Keybind({key: 'k', ctrl: true, shift: true}),
            click: function () {
                const auto_convert_vs_format_setting = Settings.get("auto_convert_vs_format");
                auto_convert_vs_format_setting.value = !auto_convert_vs_format_setting.value;
                Settings.save();
                Blockbench.showQuickMessage(
                    `Auto-convert ${auto_convert_vs_format_setting.value ? 'enabled' : 'disabled'}`,
                    2000
                );
            }
        });
        MenuBar.addAction(toggle_auto_convert_vs, 'tools');