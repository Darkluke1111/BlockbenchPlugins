
export default {
    windProp: new Property(Face, "array", "windMode"),
    textureLocationProp: new Property(Texture, "string", "textureLocation"),
    editor_backDropShapeProp: new Property(ModelProject, "string", "backDropShape", {
        exposed: false,
    }),
    editor_allAnglesProp: new Property(ModelProject, "boolean", "allAngles", {
        exposed: false,
    }),
    editor_entityTextureModeProp: new Property(ModelProject, "boolean", "entityTextureMode", {
        exposed: false,
    }),
    editor_collapsedPathsProp: new Property(ModelProject, "string", "collapsedPaths", {
        exposed: false,
    }),
    stepParentProp: new Property(Group, "string", "stepParentName"),
    hologramGroupProp: new Property(Group, "string", "hologram"),
    hologramCubeProp: new Property(Cube, "string", "hologram"),

    
}

export interface VS_Texture extends Texture {
    textureLocation: string
}

export interface VS_Face extends CubeFace {
    windMode: any[]
}

export interface VS_Group extends Group {
    hologram: boolean,
    stepParentName: string,
}

export interface VS_Cube extends Cube {
    hologram: boolean,
}

export interface VS_Project extends ModelProject {
    backDropShape: string,
    allAngles: boolean,
    entityTextureMode: boolean,
    collapsedPaths: string
}