// @ts-expect-error: vector4 is missing in blockbench types here for some reason
export const windProp = new Property(Face, "vector4", "windMode");
// @ts-expect-error: vector4 is missing in blockbench types here for some reason
export const windDataProp = new Property(Face, "vector4", "windData");


export const textureLocationProp = new Property(Texture, "string", "textureLocation");

export const editor_backDropShapeProp= new Property(ModelProject, "string", "backDropShape", {exposed: false,});
export const editor_allAnglesProp= new Property(ModelProject, "boolean", "allAngles", {exposed: false,});
export const editor_entityTextureModeProp= new Property(ModelProject, "boolean", "entityTextureMode", {exposed: false,});
export const editor_collapsedPathsProp= new Property(ModelProject, "string", "collapsedPaths", {exposed: false,});
export const editor_vsFormatConvertedProp= new Property(ModelProject, "boolean", "vsFormatConverted", {exposed: false,});
export const editor_singleTextureProp= new Property(ModelProject, "boolean", "singleTexture", {exposed: false,});

export const stepParentProp= new Property(Group, "string", "stepParentName");
export const hologramGroupProp= new Property(Group, "string", "hologram");

export const hologramCubeProp= new Property(Cube, "string", "hologram");


/**
 * Extend Blockbench types with our custom properties
 */
declare global {
    interface Face {
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
        vsFormatConverted?: boolean;
        singleTexture?: boolean;
    }

    interface Group {
        stepParentName?: string;
        hologram?: string;
    }

    interface Cube {
        hologram?: string;
    }
}
