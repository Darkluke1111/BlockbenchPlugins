import * as props from "./property";
import {export_model} from "./export_model";
import {export_animations} from "./export_animation";
import { VS_Shape } from "./vs_shape_def";

export function ex(options) {
    const data: VS_Shape = {
        editor: {},
        textureWidth: Project.texture_width,
        textureHeight: Project.texture_height,
        textureSizes: {},
        textures: {},
        elements: [],
        animations: []
    };

    // Populate Texture Sizes
    for (const texture of Texture.all) {
        if (texture.getUVWidth() && texture.getUVHeight()) {
            data.textureSizes[texture.name] = [texture.uv_width, texture.uv_height];
        }
    }

    // Populate Textures
    for (const texture of Texture.all) {
        let tmp = {} as any;
        props.textureLocationProp.copy(texture as any, tmp as any);
        data.textures[texture.name] = tmp.textureLocation;
    }
    
    // Populate Editor Info
    if (Project.backDropShape) data.editor.backdropShape = Project.backdropShape;
    if (Project.allAngles) data.editor.allAngles = Project.allAngles;
    if (Project.entityTextureMode) data.editor.entityTextureMode = Project.entityTextureMode;
    if (Project.collapsedPaths) data.editor.collapsedPaths = Project.collapsedPaths;

    // Export Model Elements
    data.elements = export_model();

    // Export Animations
    data.animations = export_animations();

    return autoStringify(data);
}