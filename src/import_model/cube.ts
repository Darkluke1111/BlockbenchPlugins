import { GroupExt, windProp } from "../property";
import { VS_Element } from "../vs_shape_def";
import {process_faces} from "./cube/faces";
import {create_cube} from "./cube/factory";

/**
 * Processes a Vintage Story element and creates a Blockbench Cube.
 * @param parent The parent Blockbench object (a Group).
 * @param object_space_pos The position in the object space.
 * @param vsElement The Vintage Story element to process.
 * @param path The file path.
 * @param asHologram Whether to import as a hologram.
 */
export function process_cube(parent: GroupExt | null, object_space_pos: [number,number,number], vsElement: VS_Element, path: string, asHologram: boolean) {
    const processed_faces = process_faces(vsElement.faces);
    const cube = create_cube(object_space_pos, vsElement, processed_faces);

    if (asHologram) {
        cube.hologram = path;
    }

    cube.addTo(parent ? parent : "root").init();

    for (const direction in cube.faces) {
        if (vsElement.faces && vsElement.faces[direction]?.windMode) {
            // @ts-expect-error: merge has wrong type
            windProp.merge(cube.faces[direction], { windMode: vsElement.faces[direction].windMode });
        }
    }
}