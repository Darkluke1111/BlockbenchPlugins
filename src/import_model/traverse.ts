import { VS_Element } from "../vs_shape_def";
import {process_group} from "./group";
import {process_cube} from "./cube";
import * as util from "../util";
import { has_children, has_geometry, is_complex } from "../transform";


/**
 * Traverses the Vintage Story element tree.
 * @param parent The parent Blockbench object.
 * @param object_space_pos The position in the object space.
 * @param nodes The array of Vintage Story elements to process.
 * @param asBackdrop Whether to import as a backdrop.
 */
export function traverse(parent: Group | null, object_space_pos: [number,number,number], vsElements: Array<VS_Element>, asBackdrop: boolean) {
    for (const vsElement of vsElements) {

        if(!has_geometry(vsElement) && has_children(vsElement)) {
            const group = process_group(parent, object_space_pos, vsElement, asBackdrop);
            traverse(group, util.vector_add(vsElement.from, object_space_pos), vsElement.children!, asBackdrop);
        }
        

        if (has_geometry(vsElement) && !has_children(vsElement)) {
            process_cube(parent, object_space_pos, vsElement, asBackdrop);
        }
    }
}