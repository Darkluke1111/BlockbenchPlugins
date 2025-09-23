const util = require("../util.js");
const props = require("../property.js");

/**
 * Processes a Vintage Story element and creates a Blockbench Group.
 * @param {object} parent The parent Blockbench object.
 * @param {Array<number>} object_space_pos The position in the object space.
 * @param {object} vsElement The Vintage Story element to process.
 * @param {string} path The file path.
 * @param {boolean} asHologram Whether to import as a hologram.
 * @returns {object} The created Blockbench Group.
 */
function processGroup(parent, object_space_pos, vsElement, path, asHologram) {
    const group = new Group({
        name: vsElement.name + '_group',
        origin: vsElement.rotationOrigin ? util.vector_add(vsElement.rotationOrigin, object_space_pos) : object_space_pos,
        rotation: util.xyz_to_zyx([vsElement.rotationX || 0, vsElement.rotationY || 0, vsElement.rotationZ || 0]),
    });

    if (asHologram) {
        group.hologram = path;
    }
    if (vsElement.stepParentName) {
        props.stepParentProp.merge(group, { stepParentName: vsElement.stepParentName });
    }

    group.addTo(parent).init();
    return group;
}

module.exports = processGroup;