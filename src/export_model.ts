import {traverse} from "./export_model/traverse";
import { VS_Element } from "./vs_shape_def";

/**
 * Exports the Blockbench model hierarchy to the Vintage Story element format.
 * @returns An array of VS model elements.
 */
export function export_model(): Array<VS_Element> {
    const elements = [];
    const topLevelNodes = Outliner.root;

    let offset: [number,number,number] = [0, 0, 0];

    traverse(null, topLevelNodes, elements, offset);
    return elements;
}