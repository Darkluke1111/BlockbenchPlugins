

export const windProp = new Property(Face, "vector4", "windMode");
export type FaceExt = Face & { windMode?: [number,number,number,number] };


export const textureLocationProp = new Property(Texture, "string", "textureLocation");
export type TextureExt = Texture & { textureLocation?: string };


export const editor_backDropShapeProp= new Property(ModelProject, "string", "backDropShape", {exposed: false,});
export const editor_allAnglesProp= new Property(ModelProject, "boolean", "allAngles", {exposed: false,});
export const editor_entityTextureModeProp= new Property(ModelProject, "boolean", "entityTextureMode", {exposed: false,});
export const editor_collapsedPathsProp= new Property(ModelProject, "string", "collapsedPaths", {exposed: false,});
export type ModelProjectExt = ModelProject & { backDropShape?: string, allAngles?: boolean, entityTextureMode?: boolean, collapsedPaths?: string };

export const stepParentProp= new Property(Group, "string", "stepParentName");
export const hologramGroupProp= new Property(Group, "string", "hologram");
export type GroupExt = Group & { stepParentName?: string, hologram?: string };

export const hologramCubeProp= new Property(Cube, "string", "hologram");
export type CubeExt = Cube & { hologram?: string };
