import { VS_Direction, VS_Face } from "../../vs_shape_def";

/**
 * Passes through UV coordinates and rotation unchanged.
 * With XYZ euler order native support, no transformation is needed.
 * @param uv - The UV coordinates [x1, y1, x2, y2]
 * @param rotation - The face rotation in degrees (0, 90, 180, 270)
 * @returns Object with unchanged UV and rotation
 */
function transformUV(uv: [number,number,number,number], rotation: number): { uv: [number,number,number,number], rotation: number } {
    // Pass through unchanged to preserve flipped/mirrored UVs
    return { uv, rotation };
}

/**
 * Processes the face data from a Blockbench cube.
 * @param faces The faces object from the Blockbench cube.
 * @returns The processed face data for the VS element.
 */
export function process_faces(faces: Partial<Record<CardinalDirection, CubeFace>>): Partial<Record<VS_Direction, VS_Face>> {
    const reduced_faces = {};

    // Get first available texture as fallback
    const fallbackTexture = Texture.all.length > 0 ? Texture.all[0] : null;

    for (const direction of Object.values(VS_Direction)) {
        const face = faces[direction];

        // Skip disabled faces
        if (!face || face.enabled === false) {
            continue;
        }

        // Use face texture or fallback to first available texture
        const faceTexture = face.texture || (fallbackTexture ? fallbackTexture.uuid : null);

        // Skip if no texture available at all
        if (!faceTexture) {
            continue;
        }

        const isUvDefault = face.uv[0] === 0 && face.uv[1] === 0 && face.uv[2] === 0 && face.uv[3] === 0;

        const rotation = face.rotation || 0;
        const transformed = transformUV(face.uv, rotation);
        const transformedUV = transformed.uv;
        const transformedRotation = transformed.rotation;

        const texture_name = get_texture_name(faceTexture);
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