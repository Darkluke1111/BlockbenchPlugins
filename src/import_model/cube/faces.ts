import { VS_Direction, VS_Face } from "../../vs_shape_def";

/**
 * Processes the face data from a Vintage Story element.
 * @param faces The faces object from the VS element.
 * @returns The processed face data for Blockbench.
 */
export function process_faces(faces: Partial<Record<VS_Direction, VS_Face>> | undefined): Partial<Record<CardinalDirection, CubeFaceOptions>> {
    
    // If no faces are provided, return empty object
    if (!faces) {
        return {};
    }

    const processed_faces = {};

    for (const direction of Object.values(VS_Direction)) {
        const faceData = faces[direction];
        if (faceData) {
            const texture_name = faceData.texture ? faceData.texture.substring(1) : null;
            let texture = Texture.all.find(t => t.name === texture_name);

            if (!texture && texture_name) {
                // If the texture is not found, create a new blank 64x64 texture
                texture = new Texture({
                    name: texture_name
                });
                texture.fromDataURL(texture.getBase64()).add()
            }
            processed_faces[direction] = { texture, uv: faceData.uv, rotation: faceData.rotation };
        }
    }
    return processed_faces;
}