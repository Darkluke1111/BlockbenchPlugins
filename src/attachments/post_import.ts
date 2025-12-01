
import { inferClothingSlotFromPath } from './presets';
import { showClothingSlotDialog } from './dialogs';
import { findAllGroupsByName, findGroupByName, stripNumericSuffix, collectGroupsDepthFirst, isDescendantOf } from '../util/outliner';


const DEBUG = false;

/**
 * Finds a group in the existing model that matches the given clothing slot.
 * Prioritizes groups that:
 * 1. Have the same clothing slot AND same name (case-insensitive)
 * 2. Have the same clothing slot (any name)
 * @param clothingSlot The clothing slot to search for
 * @param groupName Optional name to help prioritize matches
 * @param existingElements Elements that existed before import (to exclude new elements)
 * @returns The best matching group, or null if none found
 */
function findBestMatchingGroupBySlot(clothingSlot: string, groupName: string | null, existingElements: Set<any>): Group | null {
    if (!clothingSlot || clothingSlot.trim() === '') return null;

    const normalizedSlot = clothingSlot.trim().toLowerCase();
    const normalizedName = groupName ? groupName.trim().toLowerCase() : '';

    let bestMatch: Group | null = null;
    let exactNameMatch: Group | null = null;

    function search(elements: any[]) {
        for (const element of elements) {
            if (element instanceof Group && existingElements.has(element)) {
                const elemSlot = (element.clothingSlot || '').trim().toLowerCase();

                if (elemSlot === normalizedSlot) {
                    // This group has matching clothing slot
                    if (normalizedName && (element.name || '').trim().toLowerCase() === normalizedName) {
                        // Perfect match: same slot AND same name
                        exactNameMatch = element;
                        return; // Stop searching, we found the best possible match
                    }
                    if (!bestMatch) {
                        // First match with this slot
                        bestMatch = element;
                    }
                }
            }

            if (element.children && element.children.length > 0) {
                search(element.children);
                if (exactNameMatch) return; // Early exit if we found exact match
            }
        }
    }

    search(Outliner.root);
    return exactNameMatch || bestMatch;
}

/**
 * Performs post-import processing on newly added elements to automate project organization.
 * The process runs in a specific order:
 * 1. **Smart Clothing Slot Matching:** Matches top-level imported groups to existing groups with same clothing slot.
 * 2. **Re-parenting:** Moves elements under their designated parent based on the `stepParentName` property.
 * 3. **Merge Duplicates:** Merges groups that were duplicated on import (e.g., `head2` into `head`).
 * 4. **Apply Clothing Slot:** Shows a dialog for user to select clothing slot, then applies it to all new elements.
 * This function is critical for a smooth user workflow, as it handles tedious manual organization tasks.
 * @param elementsBefore A `Set` of all elements that existed before the import.
 * @param filePath Path to the first imported file, used for clothing slot inference.
 * @param logPrefix A prefix for console log messages (e.g., "Import BB").
 */
export async function processImportedAttachments(elementsBefore: Set<any>, filePath: string, logPrefix: string) {
    const elementsAfter = new Set([...Group.all, ...Cube.all]);
    const newElements = [...elementsAfter].filter(e => !elementsBefore.has(e));
    const newElementsSet = new Set(newElements);

    // Track matches for user feedback
    const matchingTable: { imported: string; matchedTo: string; slot: string }[] = [];

    // STEP 1: Smart Clothing Slot Matching
    // Find top-level groups from the import and try to match them to existing groups by clothing slot
    const topLevelNewGroups = newElements.filter(element => {
        if (!(element instanceof Group)) return false;
        const parent = element.parent;
        return !parent || !newElementsSet.has(parent);
    }) as Group[];

    if (DEBUG) console.log(`[${logPrefix}] Found ${topLevelNewGroups.length} top-level new groups for smart matching`);

    topLevelNewGroups.forEach(newGroup => {
        const clothingSlot = newGroup.clothingSlot?.trim();
        if (!clothingSlot) return;

        // Try to find a matching group in the existing model
        const matchedGroup = findBestMatchingGroupBySlot(clothingSlot, newGroup.name, elementsBefore);

        if (matchedGroup) {
            // Move all children of newGroup to the matched group
            const childrenToMove = [...newGroup.children];

            if (DEBUG) console.log(`[${logPrefix}] Smart Match: "${newGroup.name}" (slot: ${clothingSlot}) -> "${matchedGroup.name}"`);

            childrenToMove.forEach(child => {
                try {
                    child.addTo(matchedGroup);
                } catch (e) {
                    console.error(`[${logPrefix}] Failed to move "${child.name}" to matched group "${matchedGroup.name}":`, e);
                }
            });

            // Track this match for display
            matchingTable.push({
                imported: newGroup.name || 'Unnamed',
                matchedTo: matchedGroup.name || 'Unnamed',
                slot: clothingSlot
            });

            // Remove the now-empty imported group
            if (newGroup.children.length === 0) {
                newGroup.remove();
            }
        }
    });

    // Display matching table if any matches were found
    if (matchingTable.length > 0) {
        console.log(`[${logPrefix}] Smart Matching Results:`);
        console.table(matchingTable);
        Blockbench.showQuickMessage(`Matched ${matchingTable.length} attachment group(s) to existing model`, 3000);
    }

    // STEP 2: Re-parenting based on stepParentName
    if (DEBUG) console.log(`[${logPrefix}] Processing ${newElements.length} new elements for stepParent reparenting`);
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

    // STEP 3: Merge Duplicates
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

    // STEP 4: Apply Clothing Slot - Show dialog and apply user's selection
    const inferredSlot = inferClothingSlotFromPath(filePath);
    const masterClothingSlot = await showClothingSlotDialog(inferredSlot, filePath);

    if (masterClothingSlot) {
        if (DEBUG) console.log(`[${logPrefix}] Applying user-selected clothing slot "${masterClothingSlot}" to ${newElements.length} new elements.`);

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
    } else {
        if (DEBUG) console.log(`[${logPrefix}] No clothing slot selected, skipping slot assignment`);
    }

    Undo.finishEdit('Import and parent attachment');
    Canvas.updateAll();
    updateSelection?.();
}
