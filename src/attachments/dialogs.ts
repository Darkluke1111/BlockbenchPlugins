
import { getActiveSlotNames } from './presets';

/**
 * Shows a dialog to let the user select a clothing slot for imported attachments
 * @param inferredSlot The slot inferred from the file path (if any)
 * @param filePath The file path being imported
 * @returns Promise that resolves to the selected clothing slot, or null if cancelled
 */
export function showClothingSlotDialog(inferredSlot: string | null, filePath: string): Promise<string | null> {
    return new Promise((resolve) => {
        const availableSlots = getActiveSlotNames();
        const fileName = filePath.split(/[/\\]/).pop() || 'attachment';

        // Create options for the dialog
        const options: { [key: string]: string } = {};
        availableSlots.forEach(slot => {
            options[slot] = slot;
        });

        // Add a "None" option
        options[''] = '(None)';

        // Determine default selection
        const defaultSlot = inferredSlot && availableSlots.includes(inferredSlot) ? inferredSlot : '';

        new Dialog({
            id: 'clothing_slot_selector',
            title: 'Select Clothing Slot',
            component: {
                template: `
                    <div>
                        <p>Choose the clothing slot for imported elements from:</p>
                        <p><strong>${fileName}</strong></p>
                        ${inferredSlot ? `<p><em>Auto-detected: ${inferredSlot}</em></p>` : ''}
                    </div>
                `
            },
            form: {
                clothing_slot: {
                    label: 'Clothing Slot',
                    type: 'select',
                    options: options,
                    value: defaultSlot
                }
            },
            onConfirm(formData: any) {
                const selectedSlot = formData.clothing_slot;
                resolve(selectedSlot === '' ? null : selectedSlot);
            },
            onCancel() {
                resolve(null);
            }
        }).show();
    });
}
