/**
 * @file Defines the import actions for attachments and contains the core logic for merging models.
 * This includes handling textures, parsing files, and running a sophisticated post-import process
 * to automatically parent and organize imported elements.
 */

import { createExportCodec } from './codec';
import { import_model } from '../import_model';
import { VS_Shape } from '../vs_shape_def';
import { inferClothingSlotFromPath } from './presets';
import * as util from '../util';

const DEBUG = false;

/**
 * Extracts just the filename (without extension) from a path or textureLocation.
 * @param pathOrLocation A file path or textureLocation string.
 * @returns The filename without extension, lowercase.
 */
function extractFilename(pathOrLocation: string): string {
    if (!pathOrLocation) return '';
    const normalized = pathOrLocation.replace(/\\/g, '/');
    const lastSegment = normalized.split('/').pop() || '';
    return lastSegment.replace(/\.[^.]+$/, '').toLowerCase();
}

/**
 * Merges a Vintage Story attachment into the current project, intelligently handling textures.
 * @param content The VS_Shape data to merge.
 * @param filePath The path to the file being imported, used for clothing slot inference.
 */
function mergeVSAttachment(content: VS_Shape, filePath?: string) {
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
            const texture = new Texture({ name, path: existingByLocation.path }).add().load();
            texture.textureLocation = textureLocation;
            if (content.textureSizes && content.textureSizes[name]) {
                texture.uv_width = content.textureSizes[name][0];
                texture.uv_height = content.textureSizes[name][1];
            }
            if (DEBUG) console.log(`[Import VS] Created texture "${name}" using path from existing texture with same location (path: ${existingByLocation.path})`);
        } else if (existingByFilename) {
            const texture = new Texture({ name, path: existingByFilename.path }).add().load();
            texture.textureLocation = textureLocation;
            if (content.textureSizes && content.textureSizes[name]) {
                texture.uv_width = content.textureSizes[name][0];
                texture.uv_height = content.textureSizes[name][1];
            }
            if (DEBUG) console.log(`[Import VS] Created texture "${name}" using path from existing texture with matching filename "${locationFilename}" (path: ${existingByFilename.path})`);
        } else {
            const texturePath = util.get_texture_location(null, textureLocation);
            const texture = new Texture({ name, path: texturePath }).add().load();
            if (content.textureSizes && content.textureSizes[name]) {
                texture.uv_width = content.textureSizes[name][0];
                texture.uv_height = content.textureSizes[name][1];
            }
            texture.textureLocation = textureLocation;
        }
    }

    import_model(content, false, filePath);
}

function mergeBBModel(content: any, filePath: string) {
    try {
        if (DEBUG) console.log(`[Import BB] Starting merge of .bbmodel attachment`);

        const textureMap = new Map<any, any>();

        if (content.textures && Array.isArray(content.textures)) {
            content.textures.forEach((texData: any, oldIndex: number) => {
                let texture = Texture.all.find(t => t.name === texData.name || (t.path && t.path === texData.path));

                if (!texture) {
                    texture = new Texture(texData).add();
                    if (texData.path && !texData.path.startsWith('data:')) {
                        texture.load();
                    }
                    if (DEBUG) console.log(`[Import BB] Added texture: ${texData.name}`);
                } else {
                    if (DEBUG) console.log(`[Import BB] Using existing texture: ${texData.name}`);
                }

                textureMap.set(oldIndex, texture);
                if (texData.uuid) {
                    textureMap.set(texData.uuid, texture);
                }
            });
        }

        const elementMap = new Map();
        if (content.elements && Array.isArray(content.elements)) {
            content.elements.forEach(elem => {
                elementMap.set(elem.uuid, elem);
            });
        }

        const processOutlinerItem = (item: any, parentGroup: Group | null): any => {
            if (typeof item === 'string') {
                const elemData = elementMap.get(item);
                if (elemData && elemData.type === 'cube') {
                    const cubeProps = { ...elemData };
                    delete cubeProps.uuid;

                    if (cubeProps.faces) {
                        Object.keys(cubeProps.faces).forEach(faceKey => {
                            const face = cubeProps.faces[faceKey];
                            if (face && face.texture !== undefined && face.texture !== null) {
                                const mappedTexture = textureMap.get(face.texture);
                                if (mappedTexture) {
                                    face.texture = mappedTexture.uuid;
                                    if (DEBUG) console.log(`[Import BB] Remapped texture for ${cubeProps.name}.${faceKey}: ${face.texture}`);
                                }
                            }
                        });
                    }

                    const cube = new Cube(cubeProps);
                    cube.addTo(parentGroup).init();
                    if (DEBUG) console.log(`[Import BB] Created cube: ${cube.name}`);
                    return cube;
                }
            } else if (typeof item === 'object' && item !== null) {
                const groupName = item.name || '';
                const searchRoot = parentGroup ? (parentGroup.children || []) : Outliner.root;
                let existingGroup = null;

                for (const child of searchRoot) {
                    if (child instanceof Group && (child.name || '').toLowerCase() === groupName.toLowerCase()) {
                        existingGroup = child;
                        break;
                    }
                }

                let targetGroup: Group;

                if (existingGroup) {
                    targetGroup = existingGroup;
                    if (DEBUG) console.log(`[Import BB] Merging into existing group: ${groupName}`);
                } else {
                    const groupProps = { ...item };
                    delete groupProps.uuid;
                    delete groupProps.children;

                    targetGroup = new Group(groupProps);
                    targetGroup.addTo(parentGroup).init();
                    if (DEBUG) console.log(`[Import BB] Created new group: ${groupName}`);
                }

                if (item.children && Array.isArray(item.children)) {
                    item.children.forEach((childItem: any) => {
                        processOutlinerItem(childItem, targetGroup);
                    });
                }

                return targetGroup;
            }
        };

        if (content.outliner && Array.isArray(content.outliner)) {
            content.outliner.forEach(item => {
                processOutlinerItem(item, null);
            });
        }

        Canvas.updateAll();
        if (DEBUG) console.log(`[Import BB] Merge complete. Groups: ${Group.all.length}, Cubes: ${Cube.all.length}`);
    } catch (e) {
        console.error('[Import BB] CRITICAL ERROR in mergeBBModel:', e);
        Blockbench.showQuickMessage(`Import failed: ${e.message}`, 5000);
    }
}

/**
 * Removes trailing commas from JSON strings to fix common syntax errors.
 * This handles cases like: `},]` or `},}` which are invalid in strict JSON.
 * @param jsonString The JSON string to clean.
 * @returns Cleaned JSON string.
 */
function cleanJSONString(jsonString: string): string {
    return jsonString.replace(/,(\s*[\]}])/g, '$1');
}

/**
 * Recursively finds a group by name within a given array of elements.
 * Comparison is case-insensitive.
 * @param name The name of the group to find.
 * @param elements The array/tree to search through (e.g., Outliner.root).
 * @returns The found group or null if not found.
 */
function findGroupByName(name: string, elements: any[]): Group | null {
    const target = (name || '').toLowerCase();
    if (!target) return null;
    for (const element of elements) {
        if (element instanceof Group) {
            if ((element.name || '').toLowerCase() === target) {
                return element;
            }
            const foundInChildren = findGroupByName(name, element.children || []);
            if (foundInChildren) return foundInChildren;
        }
    }
    return null;
}

/**
 * Recursively finds ALL groups matching a name within a given array of elements.
 * Comparison is case-insensitive.
 * @param name The name of the groups to find.
 * @param elements The array/tree to search through (e.g., Outliner.root).
 * @returns Array of all matching groups.
 */
function findAllGroupsByName(name: string, elements: any[]): Group[] {
    const target = (name || '').toLowerCase();
    if (!target) return [];
    const results: Group[] = [];

    function search(elems: any[]) {
        for (const element of elems) {
            if (element instanceof Group) {
                if ((element.name || '').toLowerCase() === target) {
                    results.push(element);
                }
                if (element.children && element.children.length) {
                    search(element.children);
                }
            }
        }
    }

    search(elements);
    return results;
}

/**
 * Strips numeric suffixes (like "2", "3") that Blockbench adds to duplicate group names.
 * @param name The group name, e.g., "body2" or "head3".
 * @returns The base name without numeric suffix, e.g., "body" or "head".
 */
function stripNumericSuffix(name: string): string {
    if (!name) return '';
    return name.replace(/\d+$/, '');
}

/**
 * Recursively collects all groups in depth-first order (top of hierarchy first).
 * @param elements The array/tree to traverse.
 * @param result The accumulator for groups.
 * @returns A flat array of all groups.
 */
function collectGroupsDepthFirst(elements: any[], result: Group[] = []): Group[] {
    for (const element of elements) {
        if (element instanceof Group) {
            result.push(element);
            if (element.children && element.children.length) {
                collectGroupsDepthFirst(element.children, result);
            }
        }
    }
    return result;
}



interface ImportActionConfig {
    id: string;
    name: string;
    description: string;
    icon: string;
    resource_id?: string;
    extensions: string[];
    type: string;
    logPrefix: string;
    mergeFn: (model: any, filePath: string) => void;
}

/**
 * Factory function to create a generic attachment import action. This abstracts the common logic
 * for handling file import, parsing, and post-processing, thus reducing code duplication.
 * @param config Configuration object defining the specifics of the import action.
 * @returns A configured Blockbench `Action` instance.
 */
function createImportAction(config: ImportActionConfig) {
    return new Action(config.id, {
        name: config.name,
        icon: config.icon,
        category: 'file',
        description: config.description,
        click: () => {
            Blockbench.import({
                resource_id: config.resource_id,
                extensions: config.extensions,
                type: config.type,
                multiple: true,
            }, function(files) {
                if (!files || !files.length) return;

                Undo.initEdit({ outliner: true });

                const elementsBefore = new Set([...Group.all, ...Cube.all]);

                files.forEach(file => {
                    try {
                        const cleanedContent = cleanJSONString(file.content as string);
                        const model = autoParseJSON(cleanedContent);

                        if (!model || typeof model !== 'object') {
                            console.error(`[${config.logPrefix}] Invalid model data in file:`, file.path);
                            Blockbench.showQuickMessage(`Failed to import ${file.name}: Invalid JSON structure`, 3000);
                            return;
                        }

                        if (model.animations && Array.isArray(model.animations) && model.animations.length > 0) {
                            console.log(`[${config.logPrefix}] Skipping`, model.animations.length, 'animations from attachment file');
                            delete model.animations;
                        }

                        config.mergeFn(model, file.path);

                    } catch (err) {
                        console.error(`[${config.logPrefix}] Error importing file:`, file.path, err);
                        Blockbench.showQuickMessage(`Failed to import ${file.name}: ${err.message || err}`, 3000);
                    }
                });

                const currentProject = Project;
                // WORKAROUND: Use a timeout to wait for Blockbench's internal processes to complete.
                // After an import, the outliner and other project data are not updated instantaneously.
                // Running processImportedAttachments immediately would mean it can't find the new elements.
                // This delay gives Blockbench time to settle before we run our post-processing logic.
                setTimeout(() => {
                    if (!currentProject || Project !== currentProject) {
                        console.warn(`[${config.logPrefix}] Project changed or closed, skipping post-import processing`);
                        return;
                    }
                    processImportedAttachments(elementsBefore, files[0].path, config.logPrefix);
                }, 100);
            });
        }
    });
}

/**
 * Creates and returns the attachment import actions for the UI.
 * This function leverages the `createImportAction` factory to build actions for different
 * file formats (.bbmodel and .json) without duplicating code.
 * @returns An object containing the configured import actions.
 */
export function createActions() {
    const codec = createExportCodec();

    const importBBAction = createImportAction({
        id: 'import_bb_attachment',
        name: 'Import BB Attachment',
        description: 'Import and automatically parent a .bbmodel attachment file',
        icon: 'fa-file-import',
        resource_id: 'model',
        extensions: [codec.extension],
        type: codec.name,
        logPrefix: 'Import BB',
        mergeFn: (model, filePath) => mergeBBModel(model, filePath)
    });

    const importVSAction = createImportAction({
        id: 'import_vs_attachment',
        name: 'Import VS Attachment',
        description: 'Import and automatically parent a .json attachment file',
        icon: 'fa-file-import',
        extensions: ['json'],
        type: 'Vintage Story Shape',
        logPrefix: 'Import VS',
        mergeFn: (model, filePath) => mergeVSAttachment(model as VS_Shape, filePath)
    });

    return {
        importBB: importBBAction,
        importVS: importVSAction
    };
}

/**
 * Checks if 'possibleAncestor' is an ancestor of 'node'.
 * This is a safeguard to prevent circular parenting when moving elements.
 * @param node The node to check.
 * @param possibleAncestor The potential ancestor to check against.
 * @returns True if `possibleAncestor` is an ancestor of `node`.
 */
function isDescendantOf(node: any, possibleAncestor: any): boolean {
    let current = node.parent;
    while (current) {
        if (current === possibleAncestor) return true;
        current = current.parent;
    }
    return false;
}

/**
 * Performs post-import processing on newly added elements to automate project organization.
 * The process runs in a specific order:
 * 1. **Re-parenting:** Moves elements under their designated parent based on the `stepParentName` property.
 * 2. **Merge Duplicates:** Merges groups that were duplicated on import (e.g., `head2` into `head`).
 * 3. **Apply Clothing Slot:** Assigns a master clothing slot inferred from the file path to all new elements.
 * This function is critical for a smooth user workflow, as it handles tedious manual organization tasks.
 * @param elementsBefore A `Set` of all elements that existed before the import.
 * @param filePath Path to the first imported file, used for clothing slot inference.
 * @param logPrefix A prefix for console log messages (e.g., "Import BB").
 */
function processImportedAttachments(elementsBefore: Set<any>, filePath: string, logPrefix: string) {
    const elementsAfter = new Set([...Group.all, ...Cube.all]);
    const newElements = [...elementsAfter].filter(e => !elementsBefore.has(e));
    const newElementsSet = new Set(newElements);

    if (DEBUG) console.log(`[${logPrefix}] Processing ${newElements.length} new elements for reparenting`);
    newElements.forEach(element => {
        const stepParentName = element.stepParentName?.trim();
        if (stepParentName) {
            const allMatches = findAllGroupsByName(stepParentName, Outliner.root);

            let parentGroup = allMatches.find(g => !newElementsSet.has(g)) || null;

            if (!parentGroup && allMatches.length === 0) {
                parentGroup = new Group({ name: stepParentName }).addTo().init();
                if (DEBUG) console.log(`[${logPrefix}] Created missing stepParent group: "${stepParentName}"`);
            }

            if (parentGroup && parentGroup !== element && !(element instanceof Group && isDescendantOf(parentGroup, element))) {
                try {
                    element.addTo(parentGroup);
                    if (DEBUG) console.log(`[${logPrefix}] Reparented "${element.name}" under "${stepParentName}" in outliner (keeping stepParentName for mesh positioning)`);
                } catch (e) {
                    console.error(`[${logPrefix}] Failed to reparent "${element.name}" to "${stepParentName}":`, e);
                }
            }
        }
    });

    const groupsToDelete: Group[] = [];
    const updatedGroups = collectGroupsDepthFirst(Outliner.root);
    updatedGroups.forEach(group => {
        const gname = group.name || '';
        const baseName = stripNumericSuffix(gname);
        if (baseName !== gname && baseName) {
            const originalGroup = findGroupByName(baseName, Outliner.root);
            if (originalGroup && originalGroup !== group) {
                [...group.children].forEach(child => {
                    if (child === originalGroup || child.uuid === originalGroup.uuid) {
                        if (DEBUG) console.warn(`[${logPrefix}] Skipping move - child "${child.name}" is the target group`);
                        return;
                    }
                    if (child.parent === originalGroup) {
                        if (DEBUG) console.warn(`[${logPrefix}] Skipping move - child "${child.name}" already under "${originalGroup.name}"`);
                        return;
                    }
                    if (isDescendantOf(originalGroup, child)) {
                        if (DEBUG) console.warn(`[${logPrefix}] Skipping move - "${originalGroup.name}" is descendant of "${child.name}"`);
                        return;
                    }
                    try {
                        child.addTo(originalGroup);
                    } catch (e) {
                        console.error(`[${logPrefix}] Failed to move "${child.name}" to "${originalGroup.name}":`, e);
                    }
                });
                groupsToDelete.push(group);
            }
        }
    });
    groupsToDelete.forEach(group => group.remove());

    const masterClothingSlot = inferClothingSlotFromPath(filePath) || 'Unknown';

    if (masterClothingSlot) {
        if (DEBUG) console.log(`[${logPrefix}] Applying master clothing slot "${masterClothingSlot}" to ${newElements.length} new elements.`);

        function applySlotRecursive(element: any, slot: string) {
            if (element instanceof Group || element instanceof Cube) {
                if (!element.clothingSlot || element.clothingSlot.trim() === '') {
                    element.clothingSlot = slot;
                    if (DEBUG) console.log(`[${logPrefix}] Applied slot "${slot}" to ${element instanceof Group ? 'group' : 'cube'}: ${element.name}`);
                }
            }
            if (element.children) {
                element.children.forEach((child: any) => applySlotRecursive(child, slot));
            }
        }

        const topLevelNewElements = newElements.filter(element => {
            const parent = element.parent;
            return !parent || !newElementsSet.has(parent);
        });

        if (DEBUG) console.log(`[${logPrefix}] Found ${topLevelNewElements.length} top-level new elements to process`);

        topLevelNewElements.forEach(element => applySlotRecursive(element, masterClothingSlot));
    }

    Undo.finishEdit('Import and parent attachment');
    Canvas.updateAll();
    updateSelection?.();
}
