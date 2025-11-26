import {export_model} from "./export_model";
import {export_animations} from "./export_animation";
import { VS_EditorSettings, VS_Element, VS_Shape } from "./vs_shape_def";
import { VS_PROJECT_PROPS } from "./property";

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

/**
 * Saves a texture to disk, respecting VS folder structure (shapes -> textures).
 * @param texture - The Blockbench texture object
 * @param textureDir - The directory where the texture should be saved
 * @param textureSubPath - The subdirectory path relative to textures folder (e.g., "egg" for textures/egg/)
 * @returns The VS-style texture path (e.g., "egg/egg") or empty string if failed
 */
function saveTextureToFile(texture: Texture, textureDir: string, textureSubPath: string): string {
    try {
        // Check if texture has data URL method
        if (typeof texture.getDataURL !== 'function') {
            console.warn(`Texture ${texture.name} does not have getDataURL method`);
            return "";
        }

        // Ensure texture has proper extension
        let filename = texture.name;
        if (!filename.match(/\.(png|jpg|jpeg)$/i)) {
            filename += '.png';
        }

        // Create the full texture directory path if it doesn't exist
        const fullTextureDir = path.join(textureDir, textureSubPath);
        if (!fs.existsSync(fullTextureDir)) {
            fs.mkdirSync(fullTextureDir, { recursive: true });
        }

        const texturePath = path.join(fullTextureDir, filename);

        // Convert data URL to buffer and save
        const dataUrl = texture.getDataURL();
        if (!dataUrl) {
            console.warn(`Could not get data URL for texture: ${texture.name}`);
            return "";
        }

        const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        fs.writeFileSync(texturePath, buffer);

        // Return VS-style path (subdirectory + filename without extension)
        const filenameWithoutExt = filename.replace(/\.[^.]+$/, '');
        // Convert backslashes to forward slashes for VS format
        const normalizedSubPath = textureSubPath.split(path.sep).join('/');
        return normalizedSubPath ? `${normalizedSubPath}/${filenameWithoutExt}` : filenameWithoutExt;
    } catch (e) {
        console.error(`Failed to save texture ${texture.name}:`, e);
        return "";
    }
}

export function ex(options): VS_Shape {

    if(!Project) {
        throw new Error("No project loaded during export");
    }

    // Get export path and directory from options
    const exportPath = options?.path || "";
    const exportDir = options?.exportDir || "";

    // Determine texture directory based on VS folder structure
    let textureBaseDir = exportDir;
    let textureSubPath = "";

    if (exportPath) {
        // Check if the export path contains /shapes/
        const shapesIndex = exportPath.indexOf(path.sep + "shapes" + path.sep);

        if (shapesIndex !== -1) {
            // Get the base path (up to and including the asset folder)
            const basePath = exportPath.substring(0, shapesIndex);

            // Texture base directory is basePath + /textures/
            textureBaseDir = path.join(basePath, "textures");

            // Get the subdirectory between shapes/ and the filename
            // e.g., for "shapes/egg/humanegg.json", subPath is "egg"
            const afterShapes = exportPath.substring(shapesIndex + path.sep.length + "shapes".length + path.sep.length);
            const lastSep = afterShapes.lastIndexOf(path.sep);
            if (lastSep !== -1) {
                textureSubPath = afterShapes.substring(0, lastSep);
            }

            console.log(`VS folder structure detected:`);
            console.log(`  Export path: ${exportPath}`);
            console.log(`  Texture base dir: ${textureBaseDir}`);
            console.log(`  Texture subpath: ${textureSubPath}`);
        }
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
        let location = texture.textureLocation || "";

        if (!location || location === "") {
            // Try project save path first
            location = resolveTextureLocation(Project.save_path, texture.name);

            // If no save path, try texture source path
            if ((!location || location === "") && texture.source) {
                location = resolveTextureLocation(texture.source, texture.name);
            }
        }

        // If still no location and we have an export directory, save the texture
        if ((!location || location === "") && exportDir) {
            location = saveTextureToFile(texture, textureBaseDir, textureSubPath);
        }

        textures[texture.name] = location || "";
    }
    
    // Populate Editor Info
    const editor: VS_EditorSettings = {};

    for(const prop of VS_PROJECT_PROPS) {
        const prop_name = prop.name;
        editor[prop_name] = Project[prop_name];
    }

    const data: VS_Shape = {
        editor: editor,
        textureWidth: Project.texture_width,
        textureHeight: Project.texture_height,
        textureSizes: textureSizes,
        textures: textures,
        elements: export_model(),
        animations: export_animations()
    };

    return data;
}