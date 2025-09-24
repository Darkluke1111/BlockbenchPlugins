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
            const texture = Texture.all.find(t => t.name === texture_name);
            reduced_faces[direction] = { texture, uv: faceData.uv, rotation: faceData.rotation };
        }
    }
    return reduced_faces;
}

module.exports = processFaces;