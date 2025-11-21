import {export_model} from "./export_model";
import {export_animations} from "./export_animation";
import { VS_EditorSettings, VS_Shape } from "./vs_shape_def";
import { VS_PROJECT_PROPS } from "./property";
import { export_textures } from "./export_textures";

export function ex(options): VS_Shape {

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

    const elements = export_model();
    const animations = export_animations();
    const textures = export_textures(elements);
    
    
    // Populate Editor Info
    const editor: VS_EditorSettings = {};

    for(const prop of VS_PROJECT_PROPS) {
        const prop_name = prop.name;
        editor[prop_name] = Project[prop_name];
    }

    const data: VS_Shape = {
        editor: editor,
        textureWidth: Project.texture_width,
        textureHeight: Project.texture_height,
        textureSizes: textureSizes,
        textures: textures,
        elements: elements,
        animations: animations,
    };

    return data;
}