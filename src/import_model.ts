import { VS_Element, VS_Shape } from "./vs_shape_def";

import {traverse} from "./import_model/traverse";
import { expand_complex_elements, transform_tree } from "./transform";

/**
 * Recursively traverses the Vintage Story element tree and creates Blockbench groups and cubes.
 * @param shape The VS_Shape object which elements should be imported
 * @param path The file path, used for hologram identification.
 * @param asHologram Whether to import the model as a hologram.
 */
export function import_model(shape: VS_Shape, path: string, asHologram: boolean) {

    
    const expanded =  expand_complex_elements(shape);
    
    traverse(null, [0, 0, 0], expanded.elements, path, asHologram);
}