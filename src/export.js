const util = require("./util.js");
const props = require("./property.js");
const exportModel = require("./export_model.js");
const exportAnimations = require("./export_animation.js");

module.exports = function (options) {
    const data = {
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
        let tmp = {};
        props.textureLocationProp.copy(texture, tmp);
        data.textures[texture.name] = tmp.textureLocation;
    }
    
    // Populate Editor Info
    if (Project.backDropShape) data.editor.backDropShape = Project.backDropShape;
    if (Project.allAngles) data.editor.allAngles = Project.allAngles;
    if (Project.entityTextureMode) data.editor.entityTextureMode = Project.entityTextureMode;
    if (Project.collapsedPaths) data.editor.collapsedPaths = Project.collapsedPaths;

    // Export Model Elements
    data.elements = exportModel();

    // Export Animations
    data.animations = exportAnimations();

    return autoStringify(data);
}