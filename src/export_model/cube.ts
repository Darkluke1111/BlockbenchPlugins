import { VS_Element } from "../vs_shape_def";
import {process_faces} from "./cube/faces";
import {create_VS_element} from "./cube/factory";

/**
 * Processes a Blockbench Cube and converts it to a VS element.
 * @param parent The parent node in the hierarchy.
 * @param node The Cube node to process.
 * @param accu The accumulator for the VS elements.
 * @param offset The position offset to apply.
 */
export function process_cube(parent: Group | null, node: Cube, accu: Array<VS_Element>, offset: [number,number,number]) {
    const parent_pos: [number,number,number] = parent ? parent.origin : [0, 0, 0];
    const reduced_faces = process_faces(node.faces);
    const vsElement = create_VS_element(parent, node, parent_pos, offset, reduced_faces);

    if (!node.hologram) {
        accu.push(vsElement);
    }
}