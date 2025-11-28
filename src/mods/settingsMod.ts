import { createBlockbenchMod } from "../util/moddingTools";
import * as PACKAGE from "../../package.json";
import * as process from "process";

declare var Setting: any;
declare var Settings: any;
declare var Dialog: any;
declare var Interface: any;

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
    if(Settings.dialog[id]){
        delete Settings.structure[id];
        delete Settings.dialog.sidebar.pages[id];
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

createBlockbenchMod(
    `${PACKAGE.name}:attachment_preset_settings_mod`,
    {},
    _context => {
        const presetSetting = new Setting("attachment_preset", {
            name: "Attachment Preset",
            description: "Choose the clothing/attachment slot system to use. Glint for Glint character customization, Vintage Story for Seraph models, or Custom for your own slots.",
            category: "general",
            type: "select",
            value: "glint",
            options: {
                glint: "Glint (Outerwear, Top, Bottom, Boot, etc.)",
                vintage_story: "Vintage Story (Arm, Head, UpperBody, etc.)",
                custom: "Custom (configure your own slots)"
            },
            onChange() {
                // Refresh attachments panel when preset changes
                try {
                    if (Interface.Panels.attachments_panel && Interface.Panels.attachments_panel.vue) {
                        Interface.Panels.attachments_panel.vue.updateAttachments();
                    }
                } catch (e) {
                    console.warn('Could not refresh attachments panel:', e);
                }
            }
        });

        return presetSetting;
    },
    context => {
        //context?.delete();
    }
);

createBlockbenchMod(
    `${PACKAGE.name}:attachment_custom_slots_settings_mod`,
    {},
    _context => {
        const customSlotsSetting = new Setting("attachment_custom_slots", {
            name: "Custom Attachment Slots",
            description: "Define custom slot names (one per line) when using Custom preset. Example: Head, Torso, Legs, etc.",
            category: "general",
            type: "click",
            icon: "fa-list",
            value: "",
            condition: () => Settings.get("attachment_preset") === "custom",
            click() {
                new Dialog("customSlotsEdit", {
                    title: "Edit Custom Attachment Slots",
                    form: {
                        slots: {
                            label: "Slot Names (one per line)",
                            type: "textarea",
                            value: (Settings.get("attachment_custom_slots") || []).join("\n"),
                        }
                    },
                    onConfirm(formResult) {
                        // Split by newlines and filter out empty lines
                        const slots = formResult.slots
                            .split("\n")
                            .map((s: string) => s.trim())
                            .filter((s: string) => s.length > 0);

                        customSlotsSetting.set(slots);
                        Settings.save();

                        // Refresh attachments panel
                        try {
                            if (Interface.Panels.attachments_panel && Interface.Panels.attachments_panel.vue) {
                                Interface.Panels.attachments_panel.vue.updateAttachments();
                            }
                        } catch (e) {
                            console.warn('Could not refresh attachments panel:', e);
                        }
                    }
                }).show();
            }
        });

        return customSlotsSetting;
    },
    context => {
        //context?.delete();
    }
);


