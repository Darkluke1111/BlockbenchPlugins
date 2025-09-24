const processGroup = require("./group.js");
const processCube = require("./cube.js");
const util = require("../util.js");

/**
 * Traverses the Vintage Story element tree.
 * @param {object} parent The parent Blockbench object.
 * @param {Array<number>} object_space_pos The position in the object space.
 * @param {Array<object>} nodes The array of Vintage Story elements to process.
 * @param {string} path The file path.
 * @param {boolean} asHologram Whether to import as a hologram.
 */
function traverse(parent, object_space_pos, nodes, path, asHologram) {
    for (const vsElement of nodes) {
        const group = processGroup(parent, object_space_pos, vsElement, path, asHologram);

        if (vsElement.faces && Object.keys(vsElement.faces).length > 0) {
            processCube(group, object_space_pos, vsElement, path, asHologram);
        }

        if (vsElement.children) {
            traverse(group, util.vector_add(vsElement.from, object_space_pos), vsElement.children, path, asHologram);
        }
    }
}

module.exports = traverse;