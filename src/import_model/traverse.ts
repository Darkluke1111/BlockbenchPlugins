import { VS_Element } from "../vs_shape_def";
import {process_group} from "./group";
import {process_cube} from "./cube";
import * as util from "../util";
import { has_children, has_attachments, has_geometry, is_complex } from "../transform";


/**
 * Traverses the Vintage Story element tree.
 * @param parent The parent Blockbench object.
 * @param object_space_pos The position in the object space.
 * @param nodes The array of Vintage Story elements to process.
 * @param asBackdrop Whether to import as a backdrop.
 */
export function traverse(parent: Group | null, object_space_pos: [number,number,number], vsElements: Array<VS_Element>, asBackdrop: boolean) {
    for (const vsElement of vsElements) {

        // Elements with children or attachments (but no geometry) become groups
        if(!has_geometry(vsElement) && (has_children(vsElement) || has_attachments(vsElement))) {
            const group = process_group(parent, object_space_pos, vsElement, asBackdrop);
            // Recursively traverse child elements if they exist
            if (has_children(vsElement)) {
                traverse(group, util.vector_add(vsElement.from, object_space_pos), vsElement.children!, asBackdrop);
            }
        }

        // Elements with geometry but no children/attachments become cubes
        if (has_geometry(vsElement) && !has_children(vsElement) && !has_attachments(vsElement)) {
            process_cube(parent, object_space_pos, vsElement, asBackdrop);
        }
    }
}