import * as util from "./util";
import {import_model} from "./import_model";
import {import_animations} from "./import_animation";
import { VS_Shape } from "./vs_shape_def";

export function im(data, path, asHologram) {
    const content = autoParseJSON(data) as VS_Shape;

    if(!Project) {
        throw new Error("No project loaded during import");
    }
    
    // Set project texture dimensions
    Project.texture_width = content.textureWidth || 16;
    Project.texture_height = content.textureHeight || 16;

    // Load textures
    for (const name in content.textures) {
        const texturePath = util.get_texture_location(null, content.textures[name]);
        const texture = new Texture({ name, path: texturePath }).add().load();
        if (content.textureSizes && content.textureSizes[name]) {
            texture.uv_width = content.textureSizes[name][0];
            texture.uv_height = content.textureSizes[name][1];
        }

        texture.textureLocation = content.textures[name];
    }

    // Load editor properties
    if (content.editor) {
        Project.backDropShape = content.editor.backDropShape;
        Project.allAngles = content.editor.allAngles;
        Project.entityTextureMode = content.editor.entityTextureMode;
        Project.collapsedPaths = content.editor.collapsedPaths;
    }

    // Build the model structure using the dedicated module
    import_model(content.elements, path, asHologram);

    // Import animations using the dedicated module
    if (content.animations) {
        import_animations(content.animations);
    }
}