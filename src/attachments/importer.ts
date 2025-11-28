
import { import_model } from '../import_model';
import { VS_Shape } from '../vs_shape_def';
import { handleVSTextures } from './texture_handler';

const DEBUG = false;

/**
 * Merges a Vintage Story attachment into the current project, intelligently handling textures.
 * @param content The VS_Shape data to merge.
 * @param filePath The path to the file being imported, used for clothing slot inference.
 */
export function mergeVSAttachment(content: VS_Shape, filePath?: string) {
    handleVSTextures(content);
    import_model(content, false, filePath);
}

/**
 * Remaps texture references in cube faces from old indices/UUIDs to new texture UUIDs
 * @param cubeProps The cube properties object containing faces
 * @param textureMap Map of old texture indices/UUIDs to new Texture objects
 */
function remapCubeFaceTextures(cubeProps: any, textureMap: Map<any, any>) {
    if (!cubeProps.faces) return;

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

/**
 * Creates a cube from element data, remapping textures and adding to parent group
 * @param elemData The element data from the .bbmodel file
 * @param textureMap Map of old texture indices/UUIDs to new Texture objects
 * @param parentGroup The parent group to add the cube to (or null for root)
 * @param formatLabel Label for debug logging (e.g., "4.x" or "5.0")
 * @returns The created Cube instance
 */
function createCubeFromElementData(
    elemData: any,
    textureMap: Map<any, any>,
    parentGroup: Group | null,
    formatLabel: string = ''
): Cube {
    const cubeProps = { ...elemData };
    delete cubeProps.uuid;

    remapCubeFaceTextures(cubeProps, textureMap);

    const cube = new Cube(cubeProps);
    cube.addTo(parentGroup).init();

    const label = formatLabel ? ` (${formatLabel})` : '';
    if (DEBUG) console.log(`[Import BB] Created cube${label}: ${cube.name}`);

    return cube;
}

export function mergeBBModel(content: any, filePath: string) {
    try {
        if (DEBUG) console.log(`[Import BB] Starting merge of .bbmodel attachment`);

        const textureMap = new Map<any, any>();

        if (content.textures && Array.isArray(content.textures)) {
            content.textures.forEach((texData: any, oldIndex: number) => {
                let texture = Texture.all.find(t => t.name === texData.name || (t.path && t.path === texData.path));

                if (!texture) {
                    texture = new Texture(texData).add();
                    // Load texture from source (base64) or path
                    if (texData.source) {
                        // Texture has embedded base64 data - load it directly
                        texture.fromDataURL(texData.source);
                        if (DEBUG) console.log(`[Import BB] Loaded texture from base64: ${texData.name}`);
                    } else if (texData.path && !texData.path.startsWith('data:')) {
                        texture.load();
                        if (DEBUG) console.log(`[Import BB] Loaded texture from path: ${texData.name}`);
                    }
                    if (DEBUG) console.log(`[Import BB] Added texture: ${texData.name}`);
                } else {
                    // Update UV size for existing texture to match the imported data
                    if (texData.uv_width !== undefined) {
                        texture.uv_width = texData.uv_width;
                    }
                    if (texData.uv_height !== undefined) {
                        texture.uv_height = texData.uv_height;
                    }
                    if (DEBUG) console.log(`[Import BB] Using existing texture: ${texData.name}, updated UV size to ${texture.uv_width}x${texture.uv_height}`);
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

        // Blockbench 5.0+ format: groups stored separately
        const groupMap = new Map();
        if (content.groups && Array.isArray(content.groups)) {
            content.groups.forEach(grp => {
                groupMap.set(grp.uuid, grp);
            });
        }

        const processOutlinerItem = (item: any, parentGroup: Group | null): any => {
            // Handle string UUIDs (4.x format - direct element references)
            if (typeof item === 'string') {
                const elemData = elementMap.get(item);
                if (elemData && elemData.type === 'cube') {
                    return createCubeFromElementData(elemData, textureMap, parentGroup, '4.x');
                }
            } else if (typeof item === 'object' && item !== null) {
                // Blockbench 5.0+ format: outliner item with uuid reference
                // Check if this is a 5.0 format item (has uuid but not name)
                if (item.uuid && !item.name) {
                    // This is a 5.0 format outliner item - look up the actual data
                    const elemData = elementMap.get(item.uuid);
                    const groupData = groupMap.get(item.uuid);

                    if (elemData && elemData.type === 'cube') {
                        // It's an element reference
                        return createCubeFromElementData(elemData, textureMap, parentGroup, '5.0');
                    } else if (groupData) {
                        // It's a group reference
                        const groupName = groupData.name || '';
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
                            if (DEBUG) console.log(`[Import BB] Merging into existing group (5.0): ${groupName}`);
                        } else {
                            const groupProps = { ...groupData };
                            delete groupProps.uuid;

                            targetGroup = new Group(groupProps);
                            targetGroup.addTo(parentGroup).init();
                            if (DEBUG) console.log(`[Import BB] Created new group (5.0): ${groupName}`);
                        }

                        // Process children from the outliner item (not from groupData)
                        if (item.children && Array.isArray(item.children)) {
                            item.children.forEach((childItem: any) => {
                                processOutlinerItem(childItem, targetGroup);
                            });
                        }

                        return targetGroup;
                    }
                } else {
                    // Blockbench 4.x format: full group object with all data
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
