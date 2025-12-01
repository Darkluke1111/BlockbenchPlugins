import { VS_Shape } from '../vs_shape_def';
import * as util from '../util';
import { extractFilename } from '../util/path';

const DEBUG = false;

/**
 * Result of searching for existing textures that match the import criteria.
 */
interface TextureMatch {
    /** Texture with exact name match */
    byName?: Texture;
    /** Texture with matching textureLocation */
    byLocation?: Texture;
    /** Texture with matching filename (extracted from path or name) */
    byFilename?: Texture;
}

/**
 * Updates the UV dimensions of a texture based on the VS_Shape content.
 * Checks textureSizes first, then falls back to global textureWidth/textureHeight.
 *
 * @param texture The texture to update
 * @param name The texture name key in the content
 * @param content The VS_Shape content containing size information
 * @returns true if UV size was updated, false otherwise
 */
function updateTextureUVSize(texture: Texture, name: string, content: VS_Shape): boolean {
    if (content.textureSizes && content.textureSizes[name]) {
        const [width, height] = content.textureSizes[name];
        if (typeof width === 'number' && typeof height === 'number') {
            texture.uv_width = width;
            texture.uv_height = height;
            return true;
        }
    } else if (content.textureWidth && content.textureHeight) {
        texture.uv_width = content.textureWidth;
        texture.uv_height = content.textureHeight;
        return true;
    }

    return false;
}

/**
 * Searches for existing textures that could be reused for the given texture name and location.
 * Performs a single-pass search for efficiency.
 *
 * Strategy:
 * 1. byName: Exact name match (highest priority - same texture reference)
 * 2. byLocation: Same textureLocation (same asset, different reference name)
 * 3. byFilename: Matching filename (likely same asset, needs validation)
 *
 * @param name The texture name from the attachment
 * @param textureLocation The Vintage Story texture location path
 * @returns TextureMatch object with any found matches
 */
function findExistingTextures(name: string, textureLocation: string): TextureMatch {
    const normalizedLocation = textureLocation?.toLowerCase().replace(/\\/g, '/') || '';
    const locationFilename = extractFilename(textureLocation)?.toLowerCase() || '';

    const match: TextureMatch = {};

    // Single pass through all textures for efficiency
    for (const texture of Texture.all) {
        // Skip if we've already found all possible matches
        if (match.byName && match.byLocation && match.byFilename) {
            break;
        }

        // Check for exact name match
        if (!match.byName && texture.name === name) {
            match.byName = texture;
            continue; // Name match is definitive, no need to check other criteria
        }

        // Check for location match
        if (!match.byLocation && normalizedLocation) {
            const texLoc = texture.textureLocation?.toLowerCase().replace(/\\/g, '/');
            if (texLoc && texLoc === normalizedLocation) {
                match.byLocation = texture;
            }
        }

        // Check for filename match
        if (!match.byFilename && locationFilename) {
            const texName = (texture.name || '').toLowerCase().replace(/\.[^.]+$/, '');
            if (texName === locationFilename) {
                match.byFilename = texture;
                continue;
            }

            const pathFilename = extractFilename(texture.path)?.toLowerCase();
            if (pathFilename === locationFilename) {
                match.byFilename = texture;
            }
        }
    }

    if (DEBUG) {
        console.log(`[Import VS] Texture "${name}" -> location: "${textureLocation}" (filename: "${locationFilename}")`);
        console.log(`[Import VS]   byName: ${match.byName?.name || 'none'}`);
        console.log(`[Import VS]   byLocation: ${match.byLocation?.name || 'none'}`);
        console.log(`[Import VS]   byFilename: ${match.byFilename?.name || 'none'}`);
    }

    return match;
}

/**
 * Creates and configures a new VS attachment texture.
 *
 * @param name The name for the texture
 * @param path The file path (can be null if not available)
 * @param textureLocation The Vintage Story texture location
 * @param content The VS_Shape content for UV size information
 * @returns The created texture
 */
function createVSAttachmentTexture(
    name: string,
    path: string | null,
    textureLocation: string,
    content: VS_Shape
): Texture {
    const texture = new Texture({ name, path: path || undefined }).add();
    texture.textureLocation = textureLocation;

    // Set UV size
    updateTextureUVSize(texture, name, content);

    // Only load if we have a valid path
    if (path && path.length > 0 && !path.startsWith('data:')) {
        texture.load();
    }

    return texture;
}

/**
 * Handles texture reuse when an exact name match is found.
 * Updates the texture's properties and attempts to load it if not already loaded.
 */
function handleExistingTextureByName(
    texture: Texture,
    name: string,
    textureLocation: string,
    content: VS_Shape,
    match: TextureMatch
): void {
    // Update textureLocation if not set
    if (!texture.textureLocation) {
        texture.textureLocation = textureLocation;
    }

    // Always update UV size
    updateTextureUVSize(texture, name, content);

    // Only attempt to load if not already loaded
    if (!texture.loaded) {
        // Try to find a valid path from other matches
        if (match.byLocation?.path) {
            texture.path = match.byLocation.path;
            texture.load();
        } else if (match.byFilename?.path) {
            texture.path = match.byFilename.path;
            texture.load();
        } else {
            const texturePath = util.get_texture_location(null, textureLocation);
            if (texturePath && texturePath.length > 0) {
                texture.path = texturePath;
                texture.load();
            }
        }
    }
}

/**
 * Handles texture reuse when a location match is found but name differs.
 * Creates a new texture reference or reuses the existing one.
 */
function handleExistingTextureByLocation(
    texture: Texture,
    name: string,
    textureLocation: string,
    content: VS_Shape
): void {
    if (texture.name === name) {
        // Same texture, just update UV size
        updateTextureUVSize(texture, name, content);
    } else {
        // Different name, create new texture reference pointing to same location
        createVSAttachmentTexture(name, texture.path, textureLocation, content);
    }
}

/**
 * Handles texture reuse when a filename match is found.
 * Renames the existing texture and updates its properties.
 */
function handleExistingTextureByFilename(
    texture: Texture,
    name: string,
    textureLocation: string,
    locationFilename: string,
    content: VS_Shape
): void {
    // Rename and update the existing texture
    texture.name = name;
    texture.textureLocation = textureLocation;

    updateTextureUVSize(texture, name, content);
}

/**
 * Intelligently handles textures for a Vintage Story attachment.
 *
 * Resolution Strategy (in priority order):
 * 1. Exact name match - Reuse and update UV size, load if needed
 * 2. Location match - Reuse if same name, else create new reference
 * 3. Filename match - Rename and update existing texture
 * 4. No match - Create new texture and attempt to load from disk
 *
 * This prevents texture duplication and handles base64/cached textures correctly.
 *
 * @param content The VS_Shape data to merge
 */
export function handleVSTextures(content: VS_Shape) {
    // Validate input
    if (!content || !content.textures) {
        return;
    }

    for (const name in content.textures) {
        const textureLocation = content.textures[name];

        // Skip empty or invalid texture locations
        if (!textureLocation || typeof textureLocation !== 'string' || textureLocation.trim().length === 0) {
            continue;
        }

        // Find potential texture matches
        const match = findExistingTextures(name, textureLocation);
        const locationFilename = extractFilename(textureLocation) || '';

        // Resolution strategy: name > location > filename > create new
        if (match.byName) {
            handleExistingTextureByName(match.byName, name, textureLocation, content, match);
        } else if (match.byLocation) {
            handleExistingTextureByLocation(match.byLocation, name, textureLocation, content);
        } else if (match.byFilename) {
            handleExistingTextureByFilename(match.byFilename, name, textureLocation, locationFilename, content);
        } else {
            // No existing texture found, create new one
            const texturePath = util.get_texture_location(null, textureLocation);
            createVSAttachmentTexture(name, texturePath, textureLocation, content);
        }
    }
}
