import * as props from "../../property";
import { VS_Direction, VS_Face } from "../../vs_shape_def";

/**
 * Transforms UV coordinates for up/down faces to match VS coordinate space.
 * BlockBench and VS use different UV orientations for top/bottom faces.
 * @param uv - The UV coordinates [x1, y1, x2, y2]
 * @param rotation - The face rotation in degrees (0, 90, 180, 270)
 * @returns Object with transformed UV and rotation
 */
function transformUV(uv: [number,number,number,number], rotation: number): { uv: [number,number,number,number], rotation: number } {
    // For up/down faces with 90° or 270° rotation, normalize UVs
    if (rotation === 90 || rotation === 270) {
        // Check if UV is mirrored/flipped
        const isXFlipped = uv[0] > uv[2];
        const isYFlipped = uv[1] > uv[3];

        // Normalize UV to [minX, minY, maxX, maxY]
        const minX = Math.min(uv[0], uv[2]);
        const minY = Math.min(uv[1], uv[3]);
        const maxX = Math.max(uv[0], uv[2]);
        const maxY = Math.max(uv[1], uv[3]);

        // Rotation mapping depends on UV flipping
        // For BB 90°: Use XOR logic (X-only flip or Y-only flip = effectively flipped)
        // For BB 270°: Use inverted X-flip
        let outputRotation;
        if (rotation === 270) {
            // BB 270° → VS 270° (not X-flipped) or VS 90° (X-flipped)
            outputRotation = isXFlipped ? 90 : 270;
        } else {
            // BB 90° → VS 270° (not effectively flipped) or VS 90° (effectively flipped)
            const effectivelyFlipped = isXFlipped !== isYFlipped; // XOR
            outputRotation = effectivelyFlipped ? 90 : 270;
        }

        return {
            uv: [minX, minY, maxX, maxY],
            rotation: outputRotation
        };
    }

    // For other cases, return as-is
    return { uv, rotation };
}

/**
 * Processes the face data from a Blockbench cube.
 * @param faces The faces object from the Blockbench cube.
 * @returns The processed face data for the VS element.
 */
export function process_faces(faces: Partial<Record<CardinalDirection, CubeFace>>): Partial<Record<VS_Direction, VS_Face>> {
    const reduced_faces = {};

    for (const direction of Object.values(VS_Direction)) {
        const face = faces[direction];

        // Skip disabled faces - they should not be exported
        if (!face || face.enabled === false) {
            continue;
        }

        // Skip faces with no texture - they shouldn't be exported at all
        if (!face.texture) {
            continue;
        }

        const isUvDefault = face.uv[0] === 0 && face.uv[1] === 0 && face.uv[2] === 0 && face.uv[3] === 0;

        const rotation = face.rotation || 0;
        const transformed = transformUV(face.uv, rotation);
        const transformedUV = transformed.uv;
        const transformedRotation = transformed.rotation;

        // Export face with texture
        const texture_name = get_texture_name(face.texture);
        reduced_faces[direction] = new oneLiner({
            texture: `#${texture_name}`,
            ...(!isUvDefault && { uv: transformedUV }),
            ...(transformedRotation !== 0 && { rotation: transformedRotation }),
            autoUv: false,
            snapUv: false,
            windMode: face.windMode,
        });
    }
    return reduced_faces;
}

/**
 * Tries to get the texture name from a face texture UUID.
 * @param face_texture The UUID of the face texture.
 * @returns The name of the texture, or 'missing_texture' if not found.
 */
function get_texture_name(face_texture: string): string {
    const texture = Texture.all.find(t => t.uuid === face_texture);
    if(texture) {
        return texture.name;
    } else
        {
        console.error("Texture not found for UUID:", face_texture);
        return 'missing_texture';
    }
}