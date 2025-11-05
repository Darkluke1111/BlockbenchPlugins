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
    const rootGroup = topLevelNodes.filter(node => node instanceof Group).map(node => node as Group)[0];

    if (Project && Project.format && Project.format.id === 'formatVS') {
        // VS format: ensure root exports at (8,0,8)
        offset = (rootGroup && rootGroup.origin[0] === 8 && rootGroup.origin[1] === 0 && rootGroup.origin[2] === 8)
            ? [0, 0, 0]
            : [8, 0, 8];
    } else {
        // Non-VS format (legacy fallback)
        offset = (rootGroup && rootGroup.origin[0] === 8 && rootGroup.origin[1] === 0 && rootGroup.origin[2] === 8)
            ? [0, 0, 0]
            : [8, 0, 8];
    }

    traverse(null, topLevelNodes, elements, offset);
    return elements;
}