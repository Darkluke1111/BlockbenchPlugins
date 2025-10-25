import { GroupExt } from "../property";
import { VS_Element } from "../vs_shape_def";
import {process_cube} from "./cube";
import {process_group} from "./group";

/**
 * Traverses the Blockbench outliner and processes nodes for export.
 * @param parent The parent node in the hierarchy.
 * @param nodes The array of nodes to process.
 * @param accu The accumulator for the VS elements.
 * @param offset The position offset to apply.
 */
export function traverse(parent: GroupExt | null, nodes: Array<OutlinerNode>, accu: Array<VS_Element>, offset: [number,number,number]) {
    for (const node of nodes) {
        if (node instanceof Group) {
            process_group(parent, node, accu, offset);
        } else if (node instanceof Cube) {
            process_cube(parent, node, accu, offset);
        }
    }
}