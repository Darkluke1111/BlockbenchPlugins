import { VS_Element } from "../vs_shape_def";
import {process_group} from "./group";
import {process_cube} from "./cube";
import * as util from "../util";


/**
 * Traverses the Vintage Story element tree.
 * @param parent The parent Blockbench object.
 * @param object_space_pos The position in the object space.
 * @param nodes The array of Vintage Story elements to process.
 * @param path The file path.
 * @param asHologram Whether to import as a hologram.
 */
export function traverse(parent: Group | null, object_space_pos: [number,number,number], vsElements: Array<VS_Element>, path: string, asHologram: boolean) {
    for (const vsElement of vsElements) {
        const group = process_group(parent, object_space_pos, vsElement, path, asHologram);

        if (vsElement.faces && Object.keys(vsElement.faces).length > 0) {
            process_cube(group, object_space_pos, vsElement, path, asHologram);
        }

        if (vsElement.children) {
            traverse(group, util.vector_add(vsElement.from, object_space_pos), vsElement.children, path, asHologram);
        }
    }
}