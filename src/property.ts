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
    new Property(Group, "string", "stepParentName"),
];
new Property(Group, "string", "hologram");

export const VS_CUBE_PROPS = [
    new Property(Cube, "string", "climateColorMap"),
    new Property(Cube, "boolean", "gradientShade"),
    new Property(Cube, "number", "renderPass"),
    new Property(Cube, "string", "seasonColorMap"),
];
new Property(Cube, "string", "hologram");

export const VS_TEXTURE_PROPS = [
    new Property(Texture, "string", "textureLocation"),
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
        hologram?: string;
    }

    interface Cube {
        climateColorMap?: string;
        gradientShade?: boolean;
        renderPass?: number;
        seasonColorMap?: string;
        hologram?: string;
    }
}
