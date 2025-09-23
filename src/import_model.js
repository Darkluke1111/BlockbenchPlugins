const util = require("./util.js");
const props = require("./property.js");

/**
 * Recursively traverses the Vintage Story element tree and creates Blockbench groups and cubes.
 * @param {Array<object>} nodes The array of Vintage Story elements to process.
 * @param {string} path The file path, used for hologram identification.
 * @param {boolean} asHologram Whether to import the model as a hologram.
 */
module.exports = function importModel(nodes, path, asHologram) {
    function traverse(parent, object_space_pos, nodes) {
        for (const vsElement of nodes) {
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

            if (vsElement.faces && Object.keys(vsElement.faces).length > 0) {
                const reduced_faces = {};
                for (const direction of ['north', 'east', 'south', 'west', 'up', 'down']) {
                    const faceData = vsElement.faces[direction];
                    if (faceData) {
                        const texture_name = faceData.texture ? faceData.texture.substring(1) : null;
                        const texture = Texture.all.find(t => t.name === texture_name);
                        reduced_faces[direction] = { texture, uv: faceData.uv, rotation: faceData.rotation };
                    }
                }

                const cube = new Cube({
                    name: vsElement.name,
                    from: util.vector_add(vsElement.from, object_space_pos),
                    to: util.vector_add(vsElement.to, object_space_pos),
                    uv_offset: vsElement.uv,
                    origin: vsElement.rotationOrigin ? util.vector_add(vsElement.rotationOrigin, object_space_pos) : object_space_pos,
                    faces: reduced_faces,
                });

                if (asHologram) {
                    cube.hologram = path;
                }

                cube.addTo(group).init();

                for (const direction in cube.faces) {
                    if (vsElement.faces[direction]?.windMode) {
                        props.windProp.merge(cube.faces[direction], { windMode: vsElement.faces[direction].windMode });
                    }
                }
            }

            if (vsElement.children) {
                traverse(group, util.vector_add(vsElement.from, object_space_pos), vsElement.children);
            }
        }
    }
    traverse(null, [0, 0, 0], nodes);
}