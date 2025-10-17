const util = require("./util.js");
const props = require("./property.js");
const traverse = require("./import_model/traverse.js");

/**
 * Recursively traverses the Vintage Story element tree and creates Blockbench groups and cubes.
 * @param {Array<object>} nodes The array of Vintage Story elements to process.
 * @param {string} path The file path, used for hologram identification.
 * @param {boolean} asHologram Whether to import the model as a hologram.
 */
module.exports = function importModel(nodes, path, asHologram) {
    traverse(null, [0, 0, 0], nodes, path, asHologram);
}