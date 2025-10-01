/**
 * Processes the face data from a Vintage Story element.
 * @param {object} faces The faces object from the VS element.
 * @returns {object} The processed face data for Blockbench.
 */
function processFaces(faces) {
    const reduced_faces = {};
    for (const direction of ['north', 'east', 'south', 'west', 'up', 'down']) {
        const faceData = faces[direction];
        if (faceData) {
            const texture_name = faceData.texture ? faceData.texture.substring(1) : null;
            let texture = Texture.all.find(t => t.name === texture_name);

            if (!texture && texture_name) {
                // If the texture is not found, create a new blank 64x64 texture
                texture = new Texture({
                    name: texture_name
                });
                texture.fromDataURL(texture.getBase64(64, 64)).add()
            }
            reduced_faces[direction] = { texture, uv: faceData.uv, rotation: faceData.rotation };
        }
    }
    return reduced_faces;
}

module.exports = processFaces;