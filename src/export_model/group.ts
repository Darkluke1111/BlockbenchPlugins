import { VS_Element } from "../vs_shape_def";
import { traverse } from "./traverse";
import * as util from "../util";
import { VS_GROUP_PROPS } from "../property";
import { process_locators } from "./locator";
/**
 * Processes a Blockbench Group and converts it to a VS element.
 * @param parent The parent node in the hierarchy.
 * @param node The Group node to process.
 * @param accu The accumulator for the VS elements.
 * @param offset The position offset to apply.
 */
export function process_group(
    parent: Group | null,
    node: Group,
    accu: Array<VS_Element>,
    offset: [number,number,number]
) {
    if(node.backdrop) {
        return;
    }
    const parent_pos: [number,number,number] = parent ? parent.origin : [0, 0, 0];
    const converted_rotation = node.rotation;

    let from = util.vector_sub(node.origin, parent_pos);
    let to = util.vector_sub(node.origin, parent_pos);
    let rotationOrigin = util.vector_sub(node.origin, parent_pos);

    if (parent === null) {
        from = util.vector_add(from, offset);
        to = util.vector_add(to, offset);
        rotationOrigin = util.vector_add(rotationOrigin, offset);
    }

    const vsElement: VS_Element = {
        name: node.name,
        from: from,
        to: to,
        rotationOrigin: rotationOrigin,
        ...(converted_rotation[0] !== 0 && { rotationX: converted_rotation[0] }),
        ...(converted_rotation[1] !== 0 && { rotationY: converted_rotation[1] }),
        ...(converted_rotation[2] !== 0 && { rotationZ: converted_rotation[2] }),
        children: []
    };

    for(const prop of VS_GROUP_PROPS) {
        const prop_name = prop.name;
        const value = node[prop_name];

        // Skip properties with default/empty values
        if (value !== undefined && value !== null && value !== '' && value !== false) {
            vsElement[prop_name] = value;
        }
    }

    // Process child locators as attachment points
    const locators = node.children.filter(child => child instanceof Locator) as Array<Locator>;
    if (locators.length > 0) {
        const attachmentPoints = process_locators(node, locators);
        if (attachmentPoints.length > 0) {
            vsElement.attachmentpoints = attachmentPoints;
        }
    }

    accu.push(vsElement);
    traverse(node, node.children, vsElement.children!, offset);

}