import {export_model} from "./export_model";
import {export_animations} from "./export_animation";
import { VS_EditorSettings, VS_Shape } from "./vs_shape_def";

// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const fs = requireNativeModule('fs');
// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const path = requireNativeModule('path');

/**
 * Resolves texture location by searching in the textures folder relative to the shapes folder.
 * @param projectPath - The path to the .bbmodel file
 * @param textureName - The name of the texture (e.g., "fern.png")
 * @returns The VS-style texture path (e.g., "blocks/fern") or empty string if not found
 */
function resolveTextureLocation(projectPath: string | undefined, textureName: string): string {
    if (!projectPath || !textureName) {
        return "";
    }

    let texturesPath: string | null = null;

    // Check if path contains /shapes/ (project path)
    const shapesIndex = projectPath.indexOf(path.sep + "shapes" + path.sep);

    if (shapesIndex !== -1) {
        // Get the base path (up to and including the asset folder)
        const basePath = projectPath.substring(0, shapesIndex);
        texturesPath = path.join(basePath, "textures");
    } else {
        // Check if path contains /textures/ (texture source path)
        const texturesIndex = projectPath.indexOf(path.sep + "textures" + path.sep);

        if (texturesIndex !== -1) {
            texturesPath = projectPath.substring(0, texturesIndex + path.sep.length + "textures".length);
        } else {
            return "";
        }
    }

    if (!texturesPath) {
        return "";
    }

    // Check if textures folder exists
    if (!fs.existsSync(texturesPath)) {
        return "";
    }

    // Search recursively for the texture file
    const textureFile = findTextureFile(texturesPath, textureName);
    if (!textureFile) return "";

    // Build VS-style relative path (relative to textures folder, without extension)
    const relativePath = path.relative(texturesPath, textureFile);
    const withoutExt = relativePath.replace(/\.[^.]+$/, ""); // Remove extension
    // Convert backslashes to forward slashes for VS
    return withoutExt.split(path.sep).join("/");
}

/**
 * Recursively searches for a texture file in a directory.
 */
function findTextureFile(dir: string, textureName: string): string | null {
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                const found = findTextureFile(fullPath, textureName);
                if (found) return found;
            } else if (entry.isFile() && entry.name === textureName) {
                return fullPath;
            }
        }
    } catch (e) {
        // Directory read error, skip
    }

    return null;
}

export function ex(options) {

    if(!Project) {
        throw new Error("No project loaded during export");
    }

    // Populate Texture Sizes
    const textureSizes: Record<string, [number,number]> = {};
    for (const texture of Texture.all) {
        if (texture.getUVWidth() && texture.getUVHeight()) {
            textureSizes[texture.name] = [texture.uv_width, texture.uv_height];
        }
    }

    // Populate Textures
    const textures: Record<string, string> = {};
    for (const texture of Texture.all) {
        // Try using existing textureLocation first, then resolve from project path or texture source
        let location = texture.textureLocation;
        if (!location) {
            // Try project save path first
            location = resolveTextureLocation(Project.save_path, texture.name);
            // If no save path, try texture source path
            if (!location && texture.source) {
                location = resolveTextureLocation(texture.source, texture.name);
            }
        }
        textures[texture.name] = location;
    }
    
    // Populate Editor Info
    const editor: VS_EditorSettings = {};
    if (Project.backDropShape != undefined) editor.backDropShape = Project.backDropShape;
    if (Project.allAngles != undefined) editor.allAngles = Project.allAngles;
    if (Project.entityTextureMode != undefined) editor.entityTextureMode = Project.entityTextureMode;
    if (Project.collapsedPaths != undefined) editor.collapsedPaths = Project.collapsedPaths;
    if (Project.singleTexture != undefined) editor.singleTexture = Project.singleTexture;

    const data: VS_Shape = {
        editor: editor,
        textureWidth: Project.texture_width,
        textureHeight: Project.texture_height,
        textureSizes: textureSizes,
        textures: textures,
        elements: export_model(),
        animations: export_animations()
    };

    return autoStringify(data);
}