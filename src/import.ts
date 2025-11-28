import * as util from "./util";
import { import_model } from "./import_model";
import { import_animations } from "./import_animation";
import { VS_Shape } from "./vs_shape_def";
import { VS_PROJECT_PROPS } from "./property";
import { load_back_drop_shape } from "./util/misc";

export function im(content: VS_Shape, _path: string, asBackdrop: boolean) {

    if (!Project) {
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
    if (!asBackdrop) {
        if (content.editor) {
            for (const prop of VS_PROJECT_PROPS) {
                const prop_name = prop.name;
                Project[prop_name] = content.editor[prop_name];
            }
        }

        if (Project.backDropShape && Project.backDropShape !== "") {
            load_back_drop_shape(Project.backDropShape);
        }
    }




    // Build the model structure using the dedicated module
    import_model(content, asBackdrop, _path);

    // Import animations using the dedicated module
    if (content.animations) {
        import_animations(content.animations);
    }
}