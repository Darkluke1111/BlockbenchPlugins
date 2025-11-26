import { VS_EditorSettings, VS_ReflectiveMode } from "./vs_shape_def";

export const VS_PROJECT_PROPS = [
    new Property(ModelProject, "string", "backDropShape", { exposed: false, }),
    new Property(ModelProject, "string", "collapsedPaths", { exposed: false, }),
    new Property(ModelProject, "boolean", "allAngles", { exposed: false, }),
    new Property(ModelProject, "boolean", "entityTextureMode", { exposed: false, }),
    new Property(ModelProject, "boolean", "singleTexture", { exposed: false, }),
    new Property(ModelProject, "boolean", "vsFormatConverted", { exposed: false, }),
];

export const VS_GROUP_PROPS = [
    new Property(Group, "string", "stepParentName", {
        default: '',
        label: "Step Parent",
        exposed: true,
        onChange() {
            Canvas.updateAllBones();
            Canvas.updateAllPositions();
        },
    }),
];

// Blockbench-only properties (not exported to VS JSON format)
new Property(Group, "string", "clothingSlot", {
    default: '',
    label: "Clothing Slot",
    exposed: true,
    options: () => {
        const { getActiveSlotNames } = require('./attachments/presets');
        const slots = getActiveSlotNames();
        const options: {[key: string]: string} = { '': 'None' };
        slots.forEach((slot: string) => {
            options[slot] = slot;
        });
        return options;
    },
    inputs: {
        element_panel: {
            input: {
                label: 'Clothing Slot',
                type: 'select',
                options: () => {
                    const { getActiveSlotNames } = require('./attachments/presets');
                    const slots = getActiveSlotNames();
                    const options: {[key: string]: string} = { '': 'None' };
                    slots.forEach((slot: string) => {
                        options[slot] = slot;
                    });
                    return options;
                }
            }
        }
    },
    onChange() {
        try {
            if ((Interface as any).Panels?.attachments_panel?.vue) {
                (Interface as any).Panels.attachments_panel.vue.updateAttachments();
            }
        } catch (e) {
            console.warn('Could not refresh attachments panel:', e);
        }
    },
});

new Property(Group, "boolean", "backdrop");

export const VS_CUBE_PROPS = [
    new Property(Cube, "string", "stepParentName", {
        default: '',
        label: "Step Parent",
        exposed: true,
        onChange() {
            Canvas.updateAllBones();
            Canvas.updateAllPositions();
        },
    }),
    new Property(Cube, "boolean", "shade", {
        default: true,
        label: "Shade",
        exposed: true,
        inputs: {
            element_panel: {
                input: {
                    label: 'Shade',
                    type: 'checkbox'
                }
            }
        },
    }),
    new Property(Cube, "string", "climateColorMap", {
        default: '',
        label: "Climate Color Map",
        exposed: true,
        inputs: {
            element_panel: {
                input: {
                    label: 'Climate Color Map',
                    type: 'text'
                }
            }
        },
    }),
    new Property(Cube, "boolean", "gradientShade", {
        default: false,
        label: "Gradient Shade",
        exposed: true,
        inputs: {
            element_panel: {
                input: {
                    label: 'Gradient Shade',
                    type: 'checkbox'
                }
            }
        },
    }),
    new Property(Cube, "number", "renderPass", {
        default: 0,
        label: "Render Pass",
        exposed: true,
        inputs: {
            element_panel: {
                input: {
                    label: 'Render Pass',
                    type: 'number',
                    min: 0,
                    step: 1
                }
            }
        },
    }),
    new Property(Cube, "string", "seasonColorMap", {
        default: '',
        label: "Season Color Map",
        exposed: true,
        inputs: {
            element_panel: {
                input: {
                    label: 'Season Color Map',
                    type: 'text'
                }
            }
        },
    }),
];

// Blockbench-only properties (not exported to VS JSON format)
new Property(Cube, "string", "clothingSlot", {
    default: '',
    label: "Clothing Slot",
    exposed: true,
    options: () => {
        const { getActiveSlotNames } = require('./attachments/presets');
        const slots = getActiveSlotNames();
        const options: {[key: string]: string} = { '': 'None' };
        slots.forEach((slot: string) => {
            options[slot] = slot;
        });
        return options;
    },
    inputs: {
        element_panel: {
            input: {
                label: 'Clothing Slot',
                type: 'select',
                options: () => {
                    const { getActiveSlotNames } = require('./attachments/presets');
                    const slots = getActiveSlotNames();
                    const options: {[key: string]: string} = { '': 'None' };
                    slots.forEach((slot: string) => {
                        options[slot] = slot;
                    });
                    return options;
                }
            }
        }
    },
    onChange() {
        try {
            if ((Interface as any).Panels?.attachments_panel?.vue) {
                (Interface as any).Panels.attachments_panel.vue.updateAttachments();
            }
        } catch (e) {
            console.warn('Could not refresh attachments panel:', e);
        }
    },
});

new Property(Cube, "boolean", "backdrop");

export const VS_TEXTURE_PROPS = [
    new Property(Texture, "string", "textureLocation", {
        default: '',
        label: "Texture Location",
        exposed: true,
        inputs: {
            element_panel: {
                input: {
                    label: 'Texture Location',
                    type: 'text'
                }
            }
        },
    }),
];

export const VS_FACE_PROPS = [
    new Property(Face, "number", "glow"),
    new Property(Face, "number", "reflectiveMode"),
    // @ts-expect-error: vector4 is missing in blockbench types here for some reason
    new Property(Face, "vector4", "windMode"),
    // @ts-expect-error: vector4 is missing in blockbench types here for some reason
    new Property(Face, "vector4", "windData"),
];

/**
 * Extend Blockbench types with our custom properties
 */
declare global {
    interface Face {
        glow: boolean;
        reflectiveMode?: VS_ReflectiveMode;
        windMode?: [number, number, number, number];
        windData?: [number, number, number, number];
    }

    interface Texture {
        textureLocation?: string;
    }

    interface ModelProject {
        backDropShape?: string;
        allAngles?: boolean;
        entityTextureMode?: boolean;
        collapsedPaths?: string;
        singleTexture?: boolean;
        vsFormatConverted?: boolean;
    }

    interface Group {
        stepParentName?: string;
        clothingSlot?: string;
        backdrop?: boolean;
    }

    interface Cube {
        stepParentName?: string;
        clothingSlot?: string;
        climateColorMap?: string;
        gradientShade?: boolean;
        renderPass?: number;
        seasonColorMap?: string;
        backdrop?: boolean;
    }
}