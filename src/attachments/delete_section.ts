/**
 * Deletes all attachments within a given section.
 * @param {Array<Group|Cube>} elements - An array of attachment groups/elements in the section to be deleted.
 */
export function deleteSection(elements: any[]) {
    if (!elements || elements.length === 0) {
        alert("There are no attachments in this section to delete.");
        return;
    }

    const confirmed = confirm(`Are you sure you want to delete all ${elements.length} attachments in this section?`);

    if (confirmed) {
        Undo.initEdit({ outliner: true });

        // The 'elements' array from the panel is the definitive list of top-level attachments for this section.
        // Blockbench's .remove() method handles removing children automatically, regardless of their properties.
        elements.forEach(element => element.remove());

        Undo.finishEdit('delete attachment section');
        
        Blockbench.dispatchEvent('attachments_changed', {});
    }
}