import { VS_FACE_PROPS } from "../property";
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
export function process_cube(parent: Group | null, object_space_pos: [number,number,number], vsElement: VS_Element, path: string, asHologram: boolean) {
    const processed_faces = process_faces(vsElement.faces);
    const cube = create_cube(object_space_pos, vsElement, processed_faces);

    if (asHologram) {
        cube.hologram = path;
    }

    cube.addTo(parent ? parent : undefined).init();

    // Set windMode property for each face if it exists in the VS element. Can't be done in process_faces because the Cube constructor isn't handling our properties.
    if (vsElement.faces) {
        for (const direction in cube.faces) {
            for(const prop of VS_FACE_PROPS) {
                const prop_name = prop.name;
                const cube_face = cube.faces[direction];
                const element_face = vsElement.faces[direction];
                cube_face[prop_name] = element_face[prop_name];
            }
        }
    }
}