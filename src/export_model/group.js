const util = require("../util.js");

/**
 * Processes a Blockbench Group and converts it to a VS element.
 * @param {object} parent The parent node in the hierarchy.
 * @param {object} node The Group node to process.
 * @param {Array<object>} accu The accumulator for the VS elements.
 * @param {function} traverse The traverse function to process child nodes.
 * @param {Array<number>} offset The position offset to apply.
 */
function processGroup(parent, node, accu, traverse, offset) {
    const parent_pos = parent ? parent.origin : [0, 0, 0];
    const converted_rotation = util.zyx_to_xyz(node.rotation);

    let from = util.vector_sub(node.origin, parent_pos);
    let to = util.vector_sub(node.origin, parent_pos);
    let rotationOrigin = util.vector_sub(node.origin, parent_pos);

    if (parent === null) {
        from = util.vector_add(from, offset);
        to = util.vector_add(to, offset);
        rotationOrigin = util.vector_add(rotationOrigin, offset);
    }

    const vsElement = {
        name: node.name.replace('_group', ''),
        from: from,
        to: to,
        rotationOrigin: rotationOrigin,
        ...(converted_rotation[0] !== 0 && { rotationX: converted_rotation[0] }),
        ...(converted_rotation[1] !== 0 && { rotationY: converted_rotation[1] }),
        ...(converted_rotation[2] !== 0 && { rotationZ: converted_rotation[2] }),
        children: []
    };

    if (node.stepParentName) {
        vsElement.stepParentName = node.stepParentName;
    }

    if (!node.hologram) {
        accu.push(vsElement);
        traverse(node, node.children, vsElement.children, offset);
    } else {
        traverse(node, node.children, accu, offset);
    }
}

module.exports = processGroup;