const util = require("../../util.js");

/**
 * Creates a new Blockbench Cube object.
 * @param {Array<number>} object_space_pos The position in the object space.
 * @param {object} vsElement The Vintage Story element to process.
 * @param {object} faces The processed face data.
 * @returns {object} The new Blockbench Cube object.
 */
function createCube(object_space_pos, vsElement, faces) {
    return new Cube({
        name: vsElement.name,
        from: util.vector_add(vsElement.from, object_space_pos),
        to: util.vector_add(vsElement.to, object_space_pos),
        uv_offset: vsElement.uv,
        origin: vsElement.rotationOrigin ? util.vector_add(vsElement.rotationOrigin, object_space_pos) : object_space_pos,
        faces: faces,
    });
}

module.exports = createCube;