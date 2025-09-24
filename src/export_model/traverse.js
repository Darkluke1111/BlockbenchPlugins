const processGroup = require("./group.js");
const processCube = require("./cube.js");

/**
 * Traverses the Blockbench outliner and processes nodes for export.
 * @param {object} parent The parent node in the hierarchy.
 * @param {Array<object>} nodes The array of nodes to process.
 * @param {Array<object>} accu The accumulator for the VS elements.
 * @param {Array<number>} offset The position offset to apply.
 */
function traverse(parent, nodes, accu, offset) {
    for (const node of nodes) {
        if (node instanceof Group) {
            processGroup(parent, node, accu, traverse, offset);
        } else if (node instanceof Cube) {
            processCube(parent, node, accu, offset);
        }
    }
}

module.exports = traverse;