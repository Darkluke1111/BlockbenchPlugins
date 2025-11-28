
import { VS_Shape } from '../vs_shape_def';
import * as util from '../util';
import { extractFilename } from '../util/path';

const DEBUG = false;

/**
 * Helper to create, add, and load a VS attachment texture with proper properties.
 * @param name The name of the texture.
 * @param path The path to the texture file (can be null, in which case Blockbench might prompt).
 * @param textureLocation The textureLocation string for the texture.
 * @param content The VS_Shape content object, used to get textureSizes.
 * @returns The created and loaded Texture instance.
 */
function createVSAttachmentTexture(
    name: string,
    path: string | null,
    textureLocation: string,
    content: VS_Shape
): Texture {
    const texture = new Texture({ name, path: path || undefined }).add().load();
    texture.textureLocation = textureLocation;
    if (content.textureSizes && content.textureSizes[name]) {
        texture.uv_width = content.textureSizes[name][0];
        texture.uv_height = content.textureSizes[name][1];
    }
    return texture;
}


/**
 * Intelligently handles textures for a Vintage Story attachment. It tries to find existing
 * textures to reuse before creating new ones.
 * @param content The VS_Shape data to merge.
 */
export function handleVSTextures(content: VS_Shape) {
    for (const name in content.textures) {
        const textureLocation = content.textures[name];
        const normalizedLocation = textureLocation?.toLowerCase().replace(/\\/g, '/');
        const locationFilename = extractFilename(textureLocation);

        const existingByName = Texture.all.find((t: any) => t.name === name);

        const existingByLocation = Texture.all.find((t: any) => {
            const tLoc = t.textureLocation?.toLowerCase().replace(/\\/g, '/');
            return tLoc && tLoc === normalizedLocation;
        });

        const existingByFilename = locationFilename ? Texture.all.find((t: any) => {
            const tName = (t.name || '').toLowerCase().replace(/\.[^.]+$/, '');
            if (tName === locationFilename) return true;
            const pathFilename = extractFilename(t.path);
            if (pathFilename === locationFilename) return true;
            return false;
        }) : null;

        if (DEBUG) {
            console.log(`[Import VS] Texture "${name}" -> location: "${textureLocation}" (filename: "${locationFilename}")`);
            console.log(`[Import VS]   existingByName: ${existingByName?.name || 'none'} (path: ${existingByName?.path || 'none'})`);
            console.log(`[Import VS]   existingByLocation: ${existingByLocation?.name || 'none'} (path: ${existingByLocation?.path || 'none'})`);
            console.log(`[Import VS]   existingByFilename: ${existingByFilename?.name || 'none'} (path: ${existingByFilename?.path || 'none'})`);
        }

        if (existingByName) {
            if (!existingByName.textureLocation) {
                existingByName.textureLocation = textureLocation;
            }
            if (!existingByName.loaded && existingByLocation?.path) {
                existingByName.path = existingByLocation.path;
                existingByName.load();
            } else if (!existingByName.loaded && existingByFilename?.path) {
                existingByName.path = existingByFilename.path;
                existingByName.load();
            } else if (!existingByName.loaded) {
                const texturePath = util.get_texture_location(null, textureLocation);
                if (texturePath) {
                    existingByName.path = texturePath;
                    existingByName.load();
                }
            }
        } else if (existingByLocation) {
            createVSAttachmentTexture(name, existingByLocation.path, textureLocation, content);
            if (DEBUG) console.log(`[Import VS] Created texture "${name}" using path from existing texture with same location (path: ${existingByLocation.path})`);
        } else if (existingByFilename) {
            createVSAttachmentTexture(name, existingByFilename.path, textureLocation, content);
            if (DEBUG) console.log(`[Import VS] Created texture "${name}" using path from existing texture with matching filename "${locationFilename}" (path: ${existingByFilename.path})`);
        } else {
            const texturePath = util.get_texture_location(null, textureLocation);
            createVSAttachmentTexture(name, texturePath, textureLocation, content);
        }
    }
}
