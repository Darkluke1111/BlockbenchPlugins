
/**
 * Recursively finds a group by name within a given array of elements.
 * Comparison is case-insensitive.
 * @param name The name of the group to find.
 * @param elements The array/tree to search through (e.g., Outliner.root).
 * @returns The found group or null if not found.
 */
export function findGroupByName(name: string, elements: any[]): Group | null {
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
export function findAllGroupsByName(name: string, elements: any[]): Group[] {
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
export function stripNumericSuffix(name: string): string {
    if (!name) return '';
    return name.replace(/\d+$/, '');
}

/**
 * Recursively collects all groups in depth-first order (top of hierarchy first).
 * @param elements The array/tree to traverse.
 * @param result The accumulator for groups.
 * @returns A flat array of all groups.
 */
export function collectGroupsDepthFirst(elements: any[], result: Group[] = []): Group[] {
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


/**
 * Checks if 'possibleAncestor' is an ancestor of 'node'.
 * This is a safeguard to prevent circular parenting when moving elements.
 * @param node The node to check.
 * @param possibleAncestor The potential ancestor to check against.
 * @returns True if `possibleAncestor` is an ancestor of `node`.
 */
export function isDescendantOf(node: any, possibleAncestor: any): boolean {
    let current = node.parent;
    while (current) {
        if (current === possibleAncestor) return true;
        current = current.parent;
    }
    return false;
}
