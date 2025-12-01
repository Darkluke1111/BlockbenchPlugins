import { getActiveSlotNames } from './presets';
import { traverse } from '../export_model/traverse';
import * as props from "../property";
import * as util from '../util';
import { VS_Element } from '../vs_shape_def';

const fs = requireNativeModule('fs');

const DEBUG = false;

/**
 * Populates textureSizes and textures from the current project.
 * @param {Object} data - The export data object to populate.
 */
function populateTexturesFromProject(data: any) {
    // Populate Texture Sizes from the current project
    for (const texture of Texture.all) {
        if (texture.getUVWidth() && texture.getUVHeight()) {
            data.textureSizes[texture.name] = [texture.uv_width, texture.uv_height];
        }
    }

    // Populate Textures from the current project
    for (const texture of Texture.all) {
        let tmp: any = {};
        props.VS_TEXTURE_PROPS.find(p => p.name === 'textureLocation')?.copy(texture, tmp);
        data.textures[texture.name] = tmp.textureLocation;
    }
}

/**
 * Determines the correct step-parent bone name for a given attachment group.
 * First checks if the group has an explicit stepParentName property set,
 * then falls back to using the configurable attachment stepParent mappings from settings.
 * @param {Group} group - The attachment group from Blockbench.
 * @returns {string|null} The name of the parent bone, or null if no match is found.
 */
function getStepParentName(group: Group): string | null {
    // First, check if the group has an explicit stepParentName property set
    if (group.stepParentName && group.stepParentName.trim() !== '') {
        if (DEBUG) console.log(`[getStepParentName] Using explicit stepParentName property: "${group.stepParentName}"`);
        return group.stepParentName;
    }

    const { name } = group;
    const lowerName = name.toLowerCase();

    if (DEBUG) console.log(`[getStepParentName] Checking group: "${name}"`);

    // Get the mappings from settings
    const mappings = Settings.get("attachment_stepparent_mappings") || {
        exactMatches: {},
        patternMatches: []
    };

    // Check for exact matches first
    if (mappings.exactMatches && mappings.exactMatches[name]) {
        const stepParent = mappings.exactMatches[name];
        if (DEBUG) console.log(`[getStepParentName] Exact match found: "${name}" → "${stepParent}"`);
        return stepParent;
    }

    // Check pattern matches
    if (mappings.patternMatches && Array.isArray(mappings.patternMatches)) {
        for (const pattern of mappings.patternMatches) {
            // Check if the pattern's "contains" condition is met
            if (pattern.contains && lowerName.includes(pattern.contains.toLowerCase())) {
                // Check if there's an "endsWith" condition
                if (pattern.endsWith) {
                    if (lowerName.endsWith(pattern.endsWith.toLowerCase())) {
                        if (DEBUG) console.log(`[getStepParentName] Pattern match (contains="${pattern.contains}", endsWith="${pattern.endsWith}"): "${name}" → "${pattern.stepParent}"`);
                        return pattern.stepParent;
                    }
                } else if (pattern.default) {
                    // This is a fallback pattern - continue checking other patterns first
                    continue;
                } else if (pattern.stepParent) {
                    // Simple contains match without endsWith or default
                    if (DEBUG) console.log(`[getStepParentName] Pattern match (contains="${pattern.contains}"): "${name}" → "${pattern.stepParent}"`);
                    return pattern.stepParent;
                }
            }
        }

        // Second pass: check for default fallbacks
        for (const pattern of mappings.patternMatches) {
            if (pattern.contains && lowerName.includes(pattern.contains.toLowerCase()) && pattern.default) {
                if (DEBUG) console.log(`[getStepParentName] Pattern default match (contains="${pattern.contains}"): "${name}" → "${pattern.default}"`);
                return pattern.default;
            }
        }
    }

    // Fallback: Try to match against active slot names
    const activeSlotNames = getActiveSlotNames();
    const matches = activeSlotNames.filter(slotName =>
        lowerName.endsWith(slotName.toLowerCase())
    );

    if (matches.length === 0) {
        if (DEBUG) console.warn(`[getStepParentName] No slot match found for "${name}"`);
        return null;
    }

    if (matches.length > 1) {
        if (DEBUG) console.warn(`[getStepParentName] Multiple slot matches found for "${name}": ${matches.join(', ')}`);
    }

    // Pick the longest match to avoid shorter overlaps (e.g. "Top" vs "Face")
    const slot = matches.reduce((a, b) => (a.length >= b.length ? a : b));

    if (DEBUG) console.log(`[getStepParentName] Using slot: "${slot}"`);

    // Remove the slot suffix but keep the original casing of the prefix
    const stepParentName = name.slice(0, -slot.length);

    if (DEBUG) console.log(`[getStepParentName] Derived stepParentName: "${stepParentName}"`);

    return stepParentName || null;
}

/**
 * Exports the selected attachments to the Vintage Story format.
 * @param {Array<Group>} selection - An array of selected attachment groups.
 */
export function exportAttachmentsVS(selection: Group[]) {
    if (!selection || selection.length === 0) {
        alert("Please select one or more attachments to export.");
        return;
    }

    // Create a temporary data structure for the export
    const data: any = {
        textureWidth: Project.texture_width,
        textureHeight: Project.texture_height,
        textureSizes: {},
        textures: {},
        elements: [],
        animations: []
    };

    // Track groups that had stepParentName temporarily set for cleanup
    const modifiedGroups: Group[] = [];

    // Filter selection to only ROOT attachment groups
    // A root attachment is one whose parent either:
    // 1. Has no clothingSlot, OR
    // 2. Has a different clothingSlot
    const rootAttachments = selection.filter(element => {
        const myClothingSlot = (element as any).clothingSlot;
        if (!myClothingSlot || myClothingSlot.trim() === '') {
            return false; // Not an attachment at all
        }

        const parent = element.parent;
        if (!parent || !(parent instanceof Group)) {
            return true; // No parent or not a group parent = root attachment
        }

        const parentClothingSlot = (parent as any).clothingSlot;
        if (!parentClothingSlot || parentClothingSlot.trim() === '' || parentClothingSlot !== myClothingSlot) {
            if (DEBUG) console.log(`[VS Attachment Export] "${element.name}" is a root attachment (parent has different/no clothingSlot)`);
            return true; // Parent has different or no clothingSlot = root attachment
        }

        if (DEBUG) console.log(`[VS Attachment Export] Skipping "${element.name}" - child of attachment with same clothingSlot`);
        return false; // Parent has same clothingSlot = child attachment
    });

    if (DEBUG) console.log(`[VS Attachment Export] Filtered ${selection.length} elements to ${rootAttachments.length} root attachments`);

    try {
        // Process each root attachment group with its own relative offset
        rootAttachments.forEach(group => {

            const originalStepParent = group.stepParentName;
            let stepParentName = getStepParentName(group);

            // If no stepParentName was determined, traverse UP the outliner hierarchy
            // to find the first parent that does NOT have the same clothingSlot
            if (!stepParentName || stepParentName.trim() === '') {
                const myClothingSlot = (group as any).clothingSlot;
                let currentParent = group.parent;

                while (currentParent && currentParent instanceof Group) {
                    const parentClothingSlot = (currentParent as any).clothingSlot;
                    // Stop when we find a parent with a different (or no) clothingSlot
                    if (!parentClothingSlot || parentClothingSlot.trim() === '' || parentClothingSlot !== myClothingSlot) {
                        stepParentName = currentParent.name;
                        if (DEBUG) console.log(`[VS Attachment Export] Found first non-matching parent for "${group.name}": "${stepParentName}"`);
                        break;
                    }
                    currentParent = currentParent.parent;
                }
            }

            if (stepParentName && stepParentName.trim() !== '') {
                // Only modify if we're setting a new value
                if (!originalStepParent || originalStepParent.trim() === '') {
                    (group as any).stepParentName = stepParentName;
                    modifiedGroups.push(group);
                    if (DEBUG) console.log(`[VS Attachment Export] Set stepParentName="${stepParentName}" on "${group.name}"`);
                }
            } else {
                console.warn(`Could not determine a step-parent for attachment: ${group.name}`);
            }

            // Find the parent group to make the attachment's position relative
            const parentGroup = stepParentName ? Group.all.find((g: any) => g.name === stepParentName) : null;

            // Default offset, same as in the main model exporter
            let offset: [number, number, number] = [0, 0, 0];

            if (parentGroup) {
                // Adjust the offset by subtracting the parent's absolute position.
                // This makes the attachment's root position relative to its parent.
                offset = util.vector_sub(offset, parentGroup.origin);
                if (DEBUG) console.log(`[VS Attachment Export] Calculated offset for "${group.name}" relative to "${stepParentName}": [${offset.join(', ')}]`);
            }

            // Use the main model traversal logic to process the attachment
            // We create a temporary array to hold the elements for this single attachment
            const attachmentElements: VS_Element[] = [];
            traverse(null, [group], attachmentElements, offset);

            // Add the processed elements to the main elements array
            data.elements.push(...attachmentElements);
        });
    } finally {
        // Clean up the temporarily added property to avoid side effects
        modifiedGroups.forEach(group => {
            delete (group as any).stepParentName;
        });
    }

    // Prompt for save location first to check if file exists
    Blockbench.export({
        type: 'Vintage Story Attachment',
        extensions: ['json'],
        name: `${selection[0].name}_attachment.json`,
        startpath: Project.save_path,
        custom_writer: (content: any, path: string) => {
            // Check if the file already exists
            if (fs.existsSync(path)) {
                try {
                    // Read the existing file
                    const existingContent = fs.readFileSync(path, 'utf8');
                    const existingData = JSON.parse(existingContent);

                    // Use textureSizes and textures from the existing file
                    if (existingData.textureSizes) {
                        data.textureSizes = existingData.textureSizes;
                    }
                    if (existingData.textures) {
                        data.textures = existingData.textures;
                    }

                    if (DEBUG) console.log('[VS Attachment Export] Preserved textureSizes and textures from existing file');
                } catch (e) {
                    console.error('[VS Attachment Export] Error reading existing file:', e);
                    // Warn user about malformed JSON
                    Blockbench.showQuickMessage('Warning: Existing file has invalid JSON. Using project textures instead.', 3000);
                    // Fall back to current project textures
                    populateTexturesFromProject(data);
                }
            } else {
                // File doesn't exist, use textures from current project
                populateTexturesFromProject(data);
            }

            // Write the final content
            const finalContent = autoStringify(data);
            fs.writeFileSync(path, finalContent);
        }
    });
}
