import { findAttachments } from './discovery';

/**
 * Recursively collects UUIDs of an element and all its descendants.
 */
function collectDescendantUUIDs(element: any, uuids: Set<string>) {
    if (!element) return;
    if (element.uuid) {
        uuids.add(element.uuid);
    }
    if (element instanceof Group && Array.isArray(element.children)) {
        element.children.forEach((child: any) => collectDescendantUUIDs(child, uuids));
    }
}

/**
 * Deletes all attachments within a given section.
 * @param {Array<Group>} elements - An array of attachment groups/elements in the section to be deleted.
 */
export function deleteSection(elements: any[]) {
    if (!elements || elements.length === 0) {
        alert("There are no attachments in this section to delete.");
        return;
    }

    const slotName = elements[0]?.clothingSlot;
    if (!slotName) {
        alert("Could not determine the slot for these attachments.");
        return;
    }

    const confirmed = confirm(`Are you sure you want to delete all ${elements.length} attachments in this section?`);

    if (confirmed) {
        const targetUUIDs = new Set<string>();
        elements.forEach(el => collectDescendantUUIDs(el, targetUUIDs));

        Undo.initEdit({ outliner: true });

        for (let i = 0; i < 10; i++) {
            const sections = findAttachments();
            const remaining: any[] = [];

            const originalSlotSection = sections.find(s => s.slot === slotName);
            if (originalSlotSection) {
                remaining.push(...originalSlotSection.elements);
            }

            sections.forEach(section => {
                if (section.slot !== slotName) {
                    section.elements.forEach((element: any) => {
                        if (targetUUIDs.has(element.uuid)) {
                            remaining.push(element);
                        }
                    });
                }
            });

            if (remaining.length === 0) break;

            remaining.forEach((element: any) => element.remove());
        }

        Undo.finishEdit('delete attachment section');

        Interface?.Panels?.attachments_panel?.vue?.updateAttachments();
    }
}
