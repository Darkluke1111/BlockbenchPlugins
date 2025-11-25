import { VS_CUBE_PROPS } from "../property";
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
    if(node.backdrop) {
        return;
    }
    const parent_pos: [number,number,number] = parent ? parent.origin : [0, 0, 0];
    const reduced_faces = process_faces(node.faces);
    const vsElement = create_VS_element(parent, node, parent_pos, offset, reduced_faces);

    for(const prop of VS_CUBE_PROPS) {
        const prop_name = prop.name;
        const value = node[prop_name];

        // Skip properties with default/empty values
        if (value !== undefined && value !== null && value !== '' && value !== false) {
            // For renderPass, skip if it's 0 (the default value)
            if (prop_name === 'renderPass' && value === 0) {
                continue;
            }
            vsElement[prop_name] = value;
        }
    }
    accu.push(vsElement);
}