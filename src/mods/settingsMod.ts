import { createBlockbenchMod } from "../util/moddingTools";
import * as PACKAGE from "../../package.json";
import * as process from "process";


createBlockbenchMod(
    `${PACKAGE.name}:vs_gamepath_settings_mod`,
    {
        game_path_setting: undefined as any
    },
    context => {
        context.game_path_setting = new Setting("game_path", {
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
                        context.game_path_setting.set(formResult.path);
                        Settings.save();
                    }
                }).show();
            }
        });
        return context;
    },
    context => {
        context.game_path_setting?.delete();
    }

);



