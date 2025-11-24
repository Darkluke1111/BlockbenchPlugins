import { VS_Element } from "../vs_shape_def";
import * as util from "../util";
import {VS_GROUP_PROPS } from "../property";
import { process_attachment_points } from "./locator";
import { getActiveSlotNames } from "../attachments/presets";


/**
 * Processes a Vintage Story element and creates a Blockbench Group.
 * @param parent The parent Blockbench object.
 * @param object_space_pos The position in the object space.
 * @param vsElement The Vintage Story element to process.
 * @param asBackdrop Whether to import as a backdrop.
 * @param filePath The path to the file being imported (for clothing slot inference)
 * @returns The created Blockbench Group.
 */
export function process_group(parent: Group | null, object_space_pos: [number,number,number], vsElement: VS_Element, asBackdrop: boolean, filePath?: string): Group {
    const group = new Group({
        name: vsElement.name,
        origin: vsElement.rotationOrigin ? util.vector_add(vsElement.rotationOrigin, object_space_pos) : object_space_pos,
        rotation: [vsElement.rotationX || 0, vsElement.rotationY || 0, vsElement.rotationZ || 0],
    });

    if (asBackdrop) {
        group.backdrop = true;
        group.locked = true;
    }

    for(const prop of VS_GROUP_PROPS) {
        const prop_name = prop.name;
        if (vsElement[prop_name] !== undefined) {
            group[prop_name] = vsElement[prop_name];
        }
    }

    // If this is a top-level group with stepParentName and no clothingSlot set, infer from path
    if (vsElement.stepParentName && !group.clothingSlot && filePath && !parent) {
        const inferredSlot = getActiveSlotNames().includes(vsElement.stepParentName)
            ? vsElement.stepParentName
            : require('../attachments/presets').inferClothingSlotFromPath(filePath);

        if (inferredSlot) {
            group.clothingSlot = inferredSlot;
            console.log(`[Import] Inferred clothingSlot "${inferredSlot}" for group "${group.name}" from path`);
        }
    }

    group.addTo(parent ? parent : undefined).init();
    
    // Process attachment points as locators
    if (vsElement.attachmentpoints && vsElement.attachmentpoints.length > 0) {
        process_attachment_points(group, object_space_pos, vsElement.attachmentpoints, asBackdrop);
    }

    return group;
}