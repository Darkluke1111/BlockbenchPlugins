import { VS_AttachmentPoint } from "../vs_shape_def";
import * as util from "../util";

/**
 * Processes VS attachment points and creates Blockbench Locators.
 * @param parent The parent Blockbench Group.
 * @param object_space_pos The position in object space.
 * @param attachmentPoints Array of VS attachment points to convert.
 * @param asBackdrop Whether to import as a backdrop.
 */
export function process_attachment_points(
    parent: Group,
    object_space_pos: [number, number, number],
    attachmentPoints: Array<VS_AttachmentPoint>,
    asBackdrop: boolean
) {
    for (const ap of attachmentPoints) {
        // Parse string values to numbers
        const posX = parseFloat(ap.posX);
        const posY = parseFloat(ap.posY);
        const posZ = parseFloat(ap.posZ);
        const rotX = parseFloat(ap.rotationX);
        const rotY = parseFloat(ap.rotationY);
        const rotZ = parseFloat(ap.rotationZ);

        // Calculate absolute position from relative position
        const absolute_pos = util.vector_add(
            [posX, posY, posZ],
            parent.origin
        );

        const locator = new Locator({
            name: ap.code,
            from: absolute_pos
        });

        // Set rotation
        (locator as any).rotation = [rotX, rotY, rotZ];

        if (asBackdrop) {
            locator.locked = true;
        }

        locator.addTo(parent).init();
    }
}
