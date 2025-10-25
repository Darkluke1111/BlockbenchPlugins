import { VS_Element } from "../vs_shape_def";
import * as util from "../util";
import { GroupExt, stepParentProp } from "../property";


/**
 * Processes a Vintage Story element and creates a Blockbench Group.
 * @param parent The parent Blockbench object.
 * @param object_space_pos The position in the object space.
 * @param vsElement The Vintage Story element to process.
 * @param path The file path.
 * @param asHologram Whether to import as a hologram.
 * @returns The created Blockbench Group.
 */
export function process_group(parent: GroupExt | null, object_space_pos: [number,number,number], vsElement: VS_Element, path: string, asHologram: boolean): GroupExt {
    const group = new Group({
        name: vsElement.name + '_group',
        origin: vsElement.rotationOrigin ? util.vector_add(vsElement.rotationOrigin, object_space_pos) : object_space_pos,
        rotation: [vsElement.rotationX || 0, vsElement.rotationY || 0, vsElement.rotationZ || 0],
    });

    if (asHologram) {
        group.hologram = path;
    }
    if (vsElement.stepParentName) {
        // @ts-expect-error: merge has wrong type
        stepParentProp.merge(group, { stepParentName: vsElement.stepParentName });
    }

    group.addTo(parent ? parent : "root").init();
    return group;
}