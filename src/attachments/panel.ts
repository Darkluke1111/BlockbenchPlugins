import { exportAttachmentsVS } from './export_attachment_vs';
import { exportAttachmentsBB } from './export_attachment_bb';
import { deleteSection } from './delete_section';
import { findAttachments } from './discovery';

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last call.
 * @param fn The function to debounce.
 * @param wait The debounce delay in milliseconds.
 * @returns The debounced function.
 */
function debounce<T extends (...args: any[]) => any>(fn: T, wait: number): T {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return ((...args: any[]) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), wait);
    }) as T;
}

/**
 * Recursively gets all elements within a group or a cube.
 * @param {Group | Cube} element The element to traverse.
 * @returns {Array<object>} A flat array of all elements.
 */
function getAllChildElements(element: any) {
    const elements: any[] = [];
    function traverse(node: any) {
        elements.push(node);
        if (node instanceof Group && Array.isArray(node.children)) {
            node.children.forEach(traverse);
        }
    }
    traverse(element);
    return elements;
}

/**
 * Updates the outliner selection with the provided elements.
 * @param {Array<object>} elements The elements to select.
 */
function updateOutlinerSelection(elements: any[]) {
    Outliner.selected.empty();
    elements.forEach((element: any) => {
        Outliner.selected.safePush(element);
    });
    (updateSelection as any)();
}


const vuePanel = {
    template: `
        <div>
            <div v-if="sections.every(s => s.elements.length === 0)" class="panel_placeholder">
                <i class="material-icons">folder</i>
                <p>No attachments found in model.</p>
                <p>Assign a "Clothing Slot" to a group or cube in the element panel.</p>
            </div>
            <div v-else>
                <div v-for="section in sections.filter(s => s.elements.length > 0)" :key="section.slot" class="attachment-section">
                    <h2 @click="toggleSection(section.slot)" :class="{ collapsed: !isSectionOpen(section.slot) }">
                        <i class="material-icons expand_icon">
                        {{ isSectionOpen(section.slot) ? 'arrow_drop_down' : 'arrow_right' }}
                        </i>
                        {{ section.slot }}
                        <span class="attachment-count">{{ section.elements.length }}</span>
                        
                        <span class="section-buttons">
                            <i class="material-icons" @click.stop="selectSection(section.elements)" title="Select all elements in this section">select_all</i>
                            <i class="material-icons" @click.stop="toggleVisibility(section.elements, !getSectionVisibility(section.elements))" :title="getSectionVisibility(section.elements) ? 'Hide all elements in this section' : 'Show all elements in this section'">
                                {{ getSectionVisibility(section.elements) ? 'visibility' : 'visibility_off' }}
                            </i>
                            <i class="material-icons" @click.stop="exportBB(section.elements)" title="Export to .bbmodel">save</i>
                            <i class="material-icons" @click.stop="exportVS(section.elements)" title="Export as VS .json">file_download</i>
                            <i class="material-icons" @click.stop="deleteSection(section.elements)" title="Delete all elements in this section">delete</i>
                        </span>
                    </h2>
                    <ul v-if="isSectionOpen(section.slot)">
                        <li v-for="element in section.elements" 
                            :key="element.uuid"
                            :class="{ selected: isSelected(element) }"
                            class="outliner_object"
                            @click="selectElement(element)">
                            
                            <span class="outliner_object_name">
                                <i class="icon material-icons">{{ getIcon(element) }}</i>
                                {{ element.name }}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    `,
    data: () => ({
        sections: [],
        openSections: []
    }),
    methods: {
        /**
         * Exports the given elements to a .bbmodel file.
         * @param {Array<Group | Cube>} elements The elements to export.
         */
        exportBB(elements: any[]) {
            exportAttachmentsBB(elements);
        },
        /**
         * Exports the given elements to a Vintage Story .json file.
         * @param {Array<Group | Cube>} elements The elements to export.
         */
        exportVS(elements: any[]) {
            exportAttachmentsVS(elements);
        },
        /**
         * Deletes the given elements from the project.
         * @param {Array<Group | Cube>} elements The elements to delete.
         */
        deleteSection(elements: any[]) {
            deleteSection(elements);
        },
        /**
         * Updates the list of attachments by calling the discovery function.
         */
        updateAttachments() {
            (this as any).sections = findAttachments();
        },
        /**
         * Toggles the visibility of a section in the panel.
         * @param {string} slot The slot name of the section to toggle.
         */
        toggleSection(slot: string) {
            const index = (this as any).openSections.indexOf(slot);
            if (index > -1) {
                (this as any).openSections.splice(index, 1);
            } else {
                (this as any).openSections.push(slot);
            }
        },
        /**
         * Checks if a section is open in the panel.
         * @param {string} slot The slot name of the section.
         * @returns {boolean} True if the section is open, false otherwise.
         */
        isSectionOpen(slot: string) {
            return (this as any).openSections.includes(slot);
        },
        /**
         * Selects an element and all its children.
         * @param {Group | Cube} element The element to select.
         */
        selectElement(element: any) {
            const allChildren = getAllChildElements(element);
            updateOutlinerSelection(allChildren);
        },
        /**
         * Checks if an element is selected in the outliner.
         * @param {Group | Cube} element The element to check.
         * @returns {boolean} True if the element is selected, false otherwise.
         */
        isSelected(element: any) {
            return Outliner.selected.includes(element);
        },
        /**
         * Toggles the visibility of all given elements.
         * @param {Array<Group | Cube>} elements The elements to toggle visibility for.
         * @param {boolean} isVisible The desired visibility state.
         */
        toggleVisibility(elements: any[], isVisible: boolean) {
            if (!elements || !Array.isArray(elements)) return;

            elements.forEach(element => {
                if (!element) return;
                try {
                    (this as any)._walk(element, (node: any) => {
                        if (!node) return;
                        if (typeof node.toggleVisibility === 'function') {
                            if (node.visibility !== isVisible) node.toggleVisibility(isVisible);
                        } else if ('visibility' in node) {
                            node.visibility = isVisible;
                        }
                    });
                } catch (e) {
                    console.warn('Error toggling visibility for element:', element?.name, e);
                }
            });
            Canvas.updateVisibility?.();
            Canvas.updateAll?.();
        },
        /**
         * Traverses a node and its children, applying a callback to each.
         * @param {object} node The node to start traversal from.
         * @param {function} callback The function to apply to each node.
         */
        _walk(node: any, callback: (n: any) => void) {
            callback(node);
            if (node instanceof Group && Array.isArray(node.children)) {
                node.children.forEach(child => (this as any)._walk(child, callback));
            }
        },
        /**
         * Selects all elements in a section.
         * @param {Array<Group | Cube>} elements The elements in the section.
         */
        selectSection(elements: any[]) {
            const allChildren = elements.flatMap(element => getAllChildElements(element));
            updateOutlinerSelection(allChildren);
        },
        /**
         * Gets the visibility state of a section.
         * @param {Array<Group | Cube>} elements The elements in the section.
         * @returns {boolean} True if all elements are visible, false otherwise.
         */
        getSectionVisibility(elements: any[]) {
            return elements.every(element => element.visibility);
        },
        /**
         * Gets the appropriate icon for an element.
         * @param {Group | Cube} element The element.
         * @returns {string} The icon name.
         */
        getIcon(element: any) {
            return element instanceof Group ? 'folder' : 'widgets';
        }
    },
    mounted() {
        // Debounce refresh calls to avoid unnecessary updates when multiple events fire
        (this as any).refresh = debounce(() => (this as any).updateAttachments(), 50);
        (this as any).updateAttachments(); // Initial load without debounce

        (this as any)._bbListeners = [
            ['update_outliner', (this as any).refresh],
            ['load_project', (this as any).refresh],
            ['select_project', (this as any).refresh],
            ['new_project', (this as any).refresh],
            ['update_selection', (this as any).refresh],
            ['undo', (this as any).refresh],
            ['redo', (this as any).refresh],
            ['attachments_changed', (this as any).refresh]
        ];

        (this as any)._bbListeners.forEach(([evt, fn]: [string, any]) => Blockbench.on(evt, fn));
    },
    beforeUnmount() {
        if ((this as any)._bbListeners) {
            (this as any)._bbListeners.forEach(([evt, fn]: [string, any]) => Blockbench.removeListener(evt, fn));
        }
    },
    // Vue 2 compatibility
    beforeDestroy() {
        if ((this as any)._bbListeners) {
            (this as any)._bbListeners.forEach(([evt, fn]: [string, any]) => Blockbench.removeListener(evt, fn));
        }
    }
};

/**
 * Creates and configures the Attachments panel.
 * @param {object} import_action - The import action
 * @returns {Panel} A new Blockbench Panel instance.
 */
export function createAttachmentsPanel(actions: any) {
    const toolbar = new Toolbar('attachments_toolbar', {
        children: []
    });

    // Add the action to the toolbar
    if (actions.importBB) {
        toolbar.add(actions.importBB);
    }
    if (actions.importVS) {
        toolbar.add(actions.importVS);
    }

    const panel = new Panel('attachments_panel', {
        name: 'Attachments',
        icon: 'attach_file',
        default_position: {
            slot: 'right_bar',
            float_position: [0, 0],
            float_size: [300, 400],
            height: 400
        },
        toolbars: [toolbar],
        component: vuePanel
    });

    // Store reference in Interface.Panels for easy access
    Interface.Panels.attachments_panel = panel;

    return panel;
}
