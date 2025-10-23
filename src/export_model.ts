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
    if (Project.format.id !== 'formatVS') {
        const rootGroup = topLevelNodes.filter(node => node instanceof Group).map(node => node as Group)[0];
        if (rootGroup && rootGroup.origin[0] === 8 && rootGroup.origin[1] === 0 && rootGroup.origin[2] === 8) {
            offset = [0, 0, 0];
        } else {
            offset = [8, 0, 8];
        }
    }

    traverse(null, topLevelNodes, elements, offset);
    return elements;
}