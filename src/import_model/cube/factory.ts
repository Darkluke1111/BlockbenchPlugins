import { VS_Element } from "../../vs_shape_def";
import * as util from "../../util";
import { VS_CUBE_PROPS } from "../../property";

/**
 * Creates a new Blockbench Cube object.
 * @param object_space_pos The position in the object space.
 * @param vsElement The Vintage Story element to process.
 * @param faces The processed face data.
 * @returns The new Blockbench Cube object.
 */
export function create_cube(object_space_pos: [number,number,number], vsElement: VS_Element, faces: Partial<Record<CardinalDirection, CubeFaceOptions>>): Cube {
    const cube_options: ICubeOptions = {
        name: vsElement.name,
        from: util.vector_add(vsElement.from, object_space_pos),
        to: util.vector_add(vsElement.to, object_space_pos),
        uv_offset: vsElement.uv,
        shade: vsElement.shade,
        rotation: [vsElement.rotationX || 0, vsElement.rotationY || 0, vsElement.rotationZ || 0],
        origin: vsElement.rotationOrigin ? util.vector_add(vsElement.rotationOrigin, object_space_pos) : object_space_pos,
        faces: faces,
    };
    const cube = new Cube(cube_options);

    for (const cube_prop of VS_CUBE_PROPS) {
        const prop_name =  cube_prop.name;
        cube[prop_name] = vsElement[prop_name];
    }

    return cube;
}