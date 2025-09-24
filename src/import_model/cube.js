const util = require("../util.js");
const props = require("../property.js");
const processFaces = require("./cube/faces.js");
const createCube = require("./cube/factory.js");

/**
 * Processes a Vintage Story element and creates a Blockbench Cube.
 * @param {object} parent The parent Blockbench object (a Group).
 * @param {Array<number>} object_space_pos The position in the object space.
 * @param {object} vsElement The Vintage Story element to process.
 * @param {string} path The file path.
 * @param {boolean} asHologram Whether to import as a hologram.
 */
function processCube(parent, object_space_pos, vsElement, path, asHologram) {
    const reduced_faces = processFaces(vsElement.faces);
    const cube = createCube(object_space_pos, vsElement, reduced_faces);

    if (asHologram) {
        cube.hologram = path;
    }

    cube.addTo(parent).init();

    for (const direction in cube.faces) {
        if (vsElement.faces[direction]?.windMode) {
            props.windProp.merge(cube.faces[direction], { windMode: vsElement.faces[direction].windMode });
        }
    }
}

module.exports = processCube;