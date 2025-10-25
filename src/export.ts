import * as props from "./property";
import {export_model} from "./export_model";
import {export_animations} from "./export_animation";
import { VS_EditorSettings, VS_Shape } from "./vs_shape_def";
import { text } from "stream/consumers";

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
        const tmp = {};
        // @ts-expect-error: copy has wrong type
        props.textureLocationProp.copy(texture, tmp);
        // @ts-expect-error: textureLocation is added by copy above
        textures[texture.name] = tmp.textureLocation;
    }
    
    // Populate Editor Info
    const editor: VS_EditorSettings = {};
    if (Project.backDropShape) editor.backDropShape = Project.backDropShape;
    if (Project.allAngles) editor.allAngles = Project.allAngles;
    if (Project.entityTextureMode) editor.entityTextureMode = Project.entityTextureMode;
    if (Project.collapsedPaths) editor.collapsedPaths = Project.collapsedPaths;

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