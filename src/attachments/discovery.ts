import { getActiveSlotNames } from './presets';

export interface IAttachmentSection {
    slot: string;
    elements: (Group | Cube)[];
}

/**
 * Checks if a group is just a structural parent (only contains other attachments, no real content).
 * These should be filtered out from display since they're just pass-through parents.
 * IMPORTANT: Groups that themselves have a clothingSlot are NOT structural parents - they are the attachment root!
 */
function isStructuralParentOnly(node: any): boolean {
    if (!(node instanceof Group)) return false;
    if (!node.children || node.children.length === 0) return false;

    // If this group itself has a clothingSlot, it's NOT a structural parent - it's the attachment root
    if (node.clothingSlot && node.clothingSlot.trim() !== '') {
        return false;
    }

    // Check if ALL children are attachments (have clothingSlot set)
    // If so, this group is just a structural parent
    const allChildrenAreAttachments = node.children.every((child: any) => {
        if (child instanceof Cube) {
            // Cubes with geometry are real content
            return child.clothingSlot && child.clothingSlot.trim() !== '';
        }
        if (child instanceof Group) {
            // Groups that are attachments or structural parents
            return (child.clothingSlot && child.clothingSlot.trim() !== '') || isStructuralParentOnly(child);
        }
        return false;
    });

    return allChildrenAreAttachments;
}

/**
 * Walks the Outliner tree and groups matching elements based on their clothingSlot property.
 * Only elements with an explicit clothingSlot property set will be included.
 * Filters out structural parent groups that only contain other attachments.
 */
export function findAttachments(): IAttachmentSection[] {
  const results: IAttachmentSection[] = [];
  const slotMap: { [key: string]: IAttachmentSection } = {};

  function getOrCreateBucket(slot: string): IAttachmentSection {
    if (!slotMap[slot]) {
      const newSection: IAttachmentSection = { slot, elements: [] };
      slotMap[slot] = newSection;
      results.push(newSection);
    }
    return slotMap[slot];
  }

  function walk(node: any) {
    // Check if this element has an explicit clothingSlot property
    if ((node instanceof Group || node instanceof Cube) && node.clothingSlot && node.clothingSlot.trim() !== '') {
      // Skip structural parent groups that only contain other attachments
      if (!isStructuralParentOnly(node)) {
        const bucket = getOrCreateBucket(node.clothingSlot);
        bucket.elements.push(node);
      }
    }

    // Always descend to find nested clothing items
    if (Array.isArray(node.children)) {
      node.children.forEach(walk);
    }
  }

  (Outliner.root || []).forEach(walk);

  // Sort results to have a consistent order
  results.sort((a, b) => a.slot.localeCompare(b.slot));

  return results;
}

export function getAttachments(): (Group | Cube)[] {
  const allAttachments: (Group | Cube)[] = [];
  findAttachments().forEach(section => {
    allAttachments.push(...section.elements);
  });
  return allAttachments;
}

export function isAttachment(node: any): boolean {
    if (!node) return false;
    // Check if it has an explicit clothingSlot property
    return (node instanceof Group || node instanceof Cube) && node.clothingSlot && node.clothingSlot.trim() !== '';
}