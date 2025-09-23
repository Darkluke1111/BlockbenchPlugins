const util = require("../util.js");
const processFaces = require("./cube/faces.js");
const createVsElement = require("./cube/factory.js");

/**
 * Processes a Blockbench Cube and converts it to a VS element.
 * @param {object} parent The parent node in the hierarchy.
 * @param {object} node The Cube node to process.
 * @param {Array<object>} accu The accumulator for the VS elements.
 * @param {Array<number>} offset The position offset to apply.
 */
function processCube(parent, node, accu, offset) {
    const parent_pos = parent ? parent.origin : [0, 0, 0];
    const reduced_faces = processFaces(node.faces);
    const vsElement = createVsElement(parent, node, parent_pos, offset, reduced_faces);

    if (!node.hologram) {
        accu.push(vsElement);
    }
}

module.exports = processCube;