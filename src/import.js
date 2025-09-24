const util = require("./util.js");
const props = require("./property.js");
const importModel = require("./import_model.js");
const importAnimations = require("./import_animation.js");

module.exports = function (data, path, asHologram) {
    const content = autoParseJSON(data);

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
        props.textureLocationProp.merge(texture, { textureLocation: content.textures[name] });
    }

    // Load editor properties
    if (content.editor) {
        props.editor_backDropShapeProp.merge(Project, content.editor);
        props.editor_allAnglesProp.merge(Project, content.editor);
        props.editor_entityTextureModeProp.merge(Project, content.editor);
        props.editor_collapsedPathsProp.merge(Project, content.editor);
    }

    // Build the model structure using the dedicated module
    importModel(content.elements, path, asHologram);

    // Import animations using the dedicated module
    if (content.animations) {
        importAnimations(content.animations);
    }
}