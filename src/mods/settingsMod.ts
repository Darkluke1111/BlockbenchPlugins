import { createBlockbenchMod } from "../util/moddingTools";
import * as PACKAGE from "../../package.json";
import * as process from "process";

/*
 * Making a custom settinsg category errors out when loading the plugin upon the start of Blockbench 
 * (works fine when the plugin is loaded after Blockbench has alrady started).
 * Probably an issue where Blockbench loads the plugin when the Settings dialog isn't fully initialized yet... =/
 */
// 
// createBlockbenchMod(
//     `${PACKAGE.name}:vs_settings_category_mod`,
//     {},
//     _context => {
//         //@ts-expect-error: addCategory is not available in blockbench types yet
//         Settings.addCategory("vintage_story", {name: "Vintage Story"});
//     },
//     _context => {
//         removeSettingsCategory("vintage_story");
//     }

// );

function removeSettingsCategory(id: string) {
    //@ts-expect-error:  dialog is not available in blockbench types
    if(Settings.dialog[id]){
        delete Settings.structure[id];
        //@ts-expect-error:  dialog is not available in blockbench types
        delete Settings.dialog.sidebar.pages[id];
        //@ts-expect-error:  dialog is not available in blockbench types
        Settings.dialog.sidebar.build();
    }
}


createBlockbenchMod(
    `${PACKAGE.name}:vs_gamepath_settings_mod`,
    {},
    _context => {
        const setting =  new Setting("game_path", {
            name: "Game Path",
            description: "The path to your Vintage Story game folder. This is the folder that contains the assets, mods and lib folders.",
            category: "general",
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
                        setting.set(formResult.path);
                        console.log("setting and saving");
                        Settings.save();
                    }
                }).show();
            }
        });
        return setting;
    },
    context => {
        //context?.delete();
    }

);


