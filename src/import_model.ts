import { VS_Element } from "./vs_shape_def";

import {traverse} from "./import_model/traverse";

/**
 * Recursively traverses the Vintage Story element tree and creates Blockbench groups and cubes.
 * @param nodes The array of Vintage Story elements to process.
 * @param path The file path, used for hologram identification.
 * @param asHologram Whether to import the model as a hologram.
 */
export function import_model(nodes: Array<VS_Element>, path: string, asHologram: boolean) {
    traverse(null, [0, 0, 0], nodes, path, asHologram);
}