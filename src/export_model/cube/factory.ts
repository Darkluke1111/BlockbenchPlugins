import { VS_Direction, VS_Element, VS_Face } from "../../vs_shape_def";
import * as util from "../../util";

/**
 * Creates a new Vintage Story element from a Blockbench cube.
 * @param parent The parent node in the hierarchy.
 * @param node The Cube node to process.
 * @param parent_pos The position of the parent object.
 * @param offset The position offset to apply.
 * @param faces The processed face data.
 * @returns The new VS element.
 */
export function create_VS_element(parent: Group | null, node: Cube, parent_pos: [number,number,number], offset: [number,number,number], faces: Partial<Record<VS_Direction, VS_Face>>): VS_Element {
    const converted_rotation = node.rotation;

    let from = util.vector_sub(node.from, parent_pos);
    let to = util.vector_sub(node.to, parent_pos);
    let rotationOrigin = util.vector_sub(node.origin, parent_pos);

    // Apply inflate value - expands the cube equally in all directions
    if (node.inflate && node.inflate !== 0) {
        from = [from[0] - node.inflate, from[1] - node.inflate, from[2] - node.inflate];
        to = [to[0] + node.inflate, to[1] + node.inflate, to[2] + node.inflate];
    }

    if (parent === null) {
        from = util.vector_add(from, offset);
        to = util.vector_add(to, offset);
        rotationOrigin = util.vector_add(rotationOrigin, offset);
    }

    return {
        name: node.name,
        from: from,
        to: to,
        rotationOrigin: rotationOrigin,
        ...((node.uv_offset[0] !== 0 || node.uv_offset[1] !== 0) && { uv: node.uv_offset }),
        faces: faces,
        ...(converted_rotation[0] !== 0 && { rotationX: converted_rotation[0] }),
        ...(converted_rotation[1] !== 0 && { rotationY: converted_rotation[1] }),
        ...(converted_rotation[2] !== 0 && { rotationZ: converted_rotation[2] }),
    };
}