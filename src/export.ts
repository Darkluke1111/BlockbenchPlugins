import {export_model} from "./export_model";
import {export_animations} from "./export_animation";
import { VS_EditorSettings, VS_Shape } from "./vs_shape_def";

export function ex(options) {

    if(!Project) {
        throw new Error("No project loaded during export");
    }

    // Populate Texture Sizes
    const textureSizes: Record<string, [number,number]> = {};
    for (const texture of Texture.all) {
        if (texture.getUVWidth() && texture.getUVHeight()) {
            textureSizes[texture.name] = [texture.uv_width, texture.uv_height];
        }
    }

    // Populate Textures
    const textures: Record<string, string> = {};
    for (const texture of Texture.all) {
        textures[texture.name] = texture.textureLocation || "";
    }
    
    // Populate Editor Info
    const editor: VS_EditorSettings = {};
    if (Project.backDropShape != undefined) editor.backDropShape = Project.backDropShape;
    if (Project.allAngles != undefined) editor.allAngles = Project.allAngles;
    if (Project.entityTextureMode != undefined) editor.entityTextureMode = Project.entityTextureMode;
    if (Project.collapsedPaths != undefined) editor.collapsedPaths = Project.collapsedPaths;
    if (Project.singleTexture != undefined) editor.singleTexture = Project.singleTexture;

    const data: VS_Shape = {
        editor: editor,
        textureWidth: Project.texture_width,
        textureHeight: Project.texture_height,
        textureSizes: textureSizes,
        textures: textures,
        elements: export_model(),
        animations: export_animations()
    };

    return autoStringify(data);
}