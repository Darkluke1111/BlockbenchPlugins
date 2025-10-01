const props = require("../../property.js");

/**
 * Processes the face data from a Blockbench cube.
 * @param {object} faces The faces object from the Blockbench cube.
 * @returns {object} The processed face data for the VS element.
 */
function processFaces(faces) {
    const reduced_faces = {};

    for (const direction of ['north', 'east', 'south', 'west', 'up', 'down']) {
        const face = faces[direction];
        if (face.texture) {
            const texture = Texture.all.find(t => t.uuid === face.texture);
            reduced_faces[direction] = {
                texture: `#${texture.name}`,
                uv: face.uv,
                ...(face.rotation !== 0 && { rotation: face.rotation })
            };
            props.windProp.copy(face, reduced_faces[direction]);
        } else {
            reduced_faces[direction] = {
                uv: face.uv,
                ...(face.rotation !== 0 && { rotation: face.rotation })
            };
            props.windProp.copy(face, reduced_faces[direction]);           
        }
    }
    return reduced_faces;
}

module.exports = processFaces;