const util = require("./util.js");
const traverse = require("./export_model/traverse.js");

/**
 * Exports the Blockbench model hierarchy to the Vintage Story element format.
 * @returns {Array<object>} An array of VS model elements.
 */
module.exports = function exportModel() {
    const elements = [];
    const topLevelNodes = Outliner.root.filter(node => !node.is_folder);

    let offset = [0, 0, 0];
    if (Project.format.id !== 'formatVS') {
        const rootGroup = topLevelNodes.find(node => node instanceof Group);
        if (rootGroup && rootGroup.origin[0] === 8 && rootGroup.origin[1] === 0 && rootGroup.origin[2] === 8) {
            offset = [0, 0, 0];
        } else {
            offset = [8, 0, 8];
        }
    }

    traverse(null, topLevelNodes, elements, offset);
    return elements;
}