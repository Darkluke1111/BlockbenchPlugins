const util = require("../../util.js");

/**
 * Creates a new Vintage Story element from a Blockbench cube.
 * @param {object} parent The parent node in the hierarchy.
 * @param {object} node The Cube node to process.
 * @param {Array<number>} parent_pos The position of the parent object.
 * @param {Array<number>} offset The position offset to apply.
 * @param {object} faces The processed face data.
 * @returns {object} The new VS element.
 */
function createVsElement(parent, node, parent_pos, offset, faces) {
    const converted_rotation = util.zyx_to_xyz(node.rotation);
    
    let from = util.vector_sub(node.from, parent_pos);
    let to = util.vector_sub(node.to, parent_pos);
    let rotationOrigin = util.vector_sub(node.origin, parent_pos);

    if (parent === null) {
        from = util.vector_add(from, offset);
        to = util.vector_add(to, offset);
        rotationOrigin = util.vector_add(rotationOrigin, offset);
    }

    return {
        name: node.name,
        from: from,
        to: to,
        rotationOrigin: rotationOrigin,
        uv: node.uv,
        faces: faces,
        ...(converted_rotation[0] !== 0 && { rotationX: converted_rotation[0] }),
        ...(converted_rotation[1] !== 0 && { rotationY: converted_rotation[1] }),
        ...(converted_rotation[2] !== 0 && { rotationZ: converted_rotation[2] }),
    };
}

module.exports = createVsElement;