import { VS_FACE_PROPS } from "../property";
import { VS_Element } from "../vs_shape_def";
import {process_faces} from "./cube/faces";
import {create_cube} from "./cube/factory";

/**
 * Processes a Vintage Story element and creates a Blockbench Cube.
 * @param parent The parent Blockbench object (a Group).
 * @param object_space_pos The position in the object space.
 * @param vsElement The Vintage Story element to process.
 * @param asBackdrop Whether to import as a backdrop.
 */
export function process_cube(parent: Group | null, object_space_pos: [number,number,number], vsElement: VS_Element, asBackdrop: boolean) {
    const processed_faces = process_faces(vsElement.faces);
    const cube = create_cube(object_space_pos, vsElement, processed_faces);

    

    cube.addTo(parent ? parent : undefined).init();

    if (asBackdrop) {
        cube.backdrop = true;
        cube.locked = true;
    }

    // Set face properties. Can't be done in process_faces because the Cube constructor isn't handling our properties.
    if (vsElement.faces) {
        for (const direction in vsElement.faces) {
            for(const prop of VS_FACE_PROPS) {
                const prop_name = prop.name;
                const cube_face = cube.faces[direction];
                const element_face = vsElement.faces[direction];
                cube_face[prop_name] = element_face[prop_name];
            }
        }
    }

    if(cube.stepParentName && cube.stepParentName != "") {
        const step_parent = Cube.all.find(c => c.name === `${cube.stepParentName}_geo`);
        if(step_parent) {
            step_parent.mesh.add(cube.mesh);
        }
    }
}