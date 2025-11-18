import { VS_AttachmentPoint } from "../vs_shape_def";
import * as util from "../util";

/**
 * Processes Blockbench Locators and converts them to VS attachment points.
 * @param parent The parent node in the hierarchy.
 * @param locators Array of locator nodes to process.
 * @returns Array of VS_AttachmentPoint objects.
 */
export function process_locators(
    parent: Group | null,
    locators: Array<Locator>
): Array<VS_AttachmentPoint> {
    const attachmentPoints: Array<VS_AttachmentPoint> = [];

    if (locators.length === 0) {
        return attachmentPoints;
    }

    const parent_pos: [number, number, number] = parent ? parent.origin : [0, 0, 0];

    for (const locator of locators) {
        if (!locator.export) continue;

        // Get locator position
        const locator_pos: [number, number, number] = (locator as any).position || [0, 0, 0];

        // Calculate position relative to parent
        const relative_pos = util.vector_sub(locator_pos, parent_pos);

        // Get rotation (Blockbench uses degrees, VS uses degrees too)
        const rotation: [number, number, number] = (locator as any).rotation || [0, 0, 0];

        const attachmentPoint: VS_AttachmentPoint = {
            code: locator.name,
            posX: relative_pos[0].toString(),
            posY: relative_pos[1].toString(),
            posZ: relative_pos[2].toString(),
            rotationX: rotation[0].toString(),
            rotationY: rotation[1].toString(),
            rotationZ: rotation[2].toString()
        };

        attachmentPoints.push(attachmentPoint);
    }

    return attachmentPoints;
}
