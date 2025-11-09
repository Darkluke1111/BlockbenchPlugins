import { VS_Element } from "../vs_shape_def";
import * as util from "../util";
import { VS_CUBE_PROPS } from "../property";


/**
 * Processes a Vintage Story element and creates a Blockbench Group.
 * @param parent The parent Blockbench object.
 * @param object_space_pos The position in the object space.
 * @param vsElement The Vintage Story element to process.
 * @param path The file path.
 * @param asHologram Whether to import as a hologram.
 * @returns The created Blockbench Group.
 */
export function process_group(parent: Group | null, object_space_pos: [number,number,number], vsElement: VS_Element, path: string, asHologram: boolean): Group {
    const group = new Group({
        name: vsElement.name,
        origin: vsElement.rotationOrigin ? util.vector_add(vsElement.rotationOrigin, object_space_pos) : object_space_pos,
        rotation: [vsElement.rotationX || 0, vsElement.rotationY || 0, vsElement.rotationZ || 0],
    });

    if (asHologram) {
        group.hologram = path;
    }
    
    for(const prop of VS_CUBE_PROPS) {
        const prop_name = prop.name;
        group[prop_name] = vsElement[prop_name];
    }

    group.addTo(parent ? parent : undefined).init();
    return group;
}