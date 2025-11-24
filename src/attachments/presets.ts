/**
 * Preset configurations for different clothing/attachment systems
 */

export interface AttachmentPreset {
    name: string;
    description: string;
    slots: string[];
}

/**
 * Glint clothing system (original implementation)
 * Used for Glint character customization
 */
export const GLINT_PRESET: AttachmentPreset = {
    name: "Glint",
    description: "Glint character customization slots",
    slots: [
        'Outerwear',
        'Top',
        'Bottom',
        'Boot',
        'Glove',
        'Eyebrows',
        'Eyes',
        'Nose',
        'Mouth',
        'FacialHair',
        'Earring',
        'Ears',
        'FaceItem',
        'Face',
        'Hair Base',
        'Hair Extra',
        'Hair Face'
    ]
};

/**
 * Vintage Story Seraph clothing system
 * Based on the official Vintage Story Seraph model structure
 */
export const VINTAGE_STORY_PRESET: AttachmentPreset = {
    name: "Vintage Story",
    description: "Vintage Story Seraph clothing and armor slots",
    slots: [
        // Clothing slots
        'Arm',
        'Emblem',
        'Face',
        'Ears',
        'Hair',
        'Nose',
        'Foot',
        'Hand',
        'Head',
        'LowerBody',
        'Neck',
        'Shoulder',
        'UpperBody',
        'UpperBodyOver',
        'Waist',
        // Armor slots
        'Armor Body',
        'Armor Head',
        'Armor Legs'
    ]
};

/**
 * Available preset configurations
 */
export const PRESETS: { [key: string]: AttachmentPreset } = {
    'glint': GLINT_PRESET,
    'vintage_story': VINTAGE_STORY_PRESET
};

/**
 * Path segment to slot name mappings for different systems.
 * Note: Armor paths are handled separately in inferClothingSlotFromPath()
 * before these mappings are checked.
 */
const PATH_TO_SLOT_MAPPINGS: { [key: string]: string } = {
    // Vintage Story clothing paths
    'upperbody': 'UpperBody',
    'upperbodyover': 'UpperBodyOver',
    'lowerbody': 'LowerBody',
    'head': 'Head',
    'face': 'Face',
    'neck': 'Neck',
    'shoulder': 'Shoulder',
    'hand': 'Hand',
    'foot': 'Foot',
    'waist': 'Waist',
    'arm': 'Arm',
    'emblem': 'Emblem',
    'hair': 'Hair',

    // Glint paths
    'outerwear': 'Outerwear',
    'top': 'Top',
    'bottom': 'Bottom',
    'boot': 'Boot',
    'glove': 'Glove',
    'eyebrows': 'Eyebrows',
    'eyes': 'Eyes',
    'nose': 'Nose',
    'mouth': 'Mouth',
    'facialhair': 'FacialHair',
    'earring': 'Earring',
    'ears': 'Ears',
    'faceitem': 'FaceItem',
    'hair-base': 'Hair Base',
    'hair-extra': 'Hair Extra',
    'hair-face': 'Hair Face',
};

/**
 * Infers the clothing slot from a file path
 * @param filePath Full path to the imported file
 * @returns The inferred clothing slot name, or null if none could be determined
 */
export function inferClothingSlotFromPath(filePath: string): string | null {
    if (!filePath) return null;

    // Normalize path separators and convert to lowercase
    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();
    const pathSegments = normalizedPath.split('/');

    // Check for armor paths (e.g., .../armor/.../body.json)
    if (pathSegments.includes('armor')) {
        // Get the filename without extension
        const filename = pathSegments[pathSegments.length - 1].replace(/\.[^.]+$/, '');

        // Map armor filenames to slots
        if (filename === 'body') return 'Armor Body';
        if (filename === 'head') return 'Armor Head';
        if (filename === 'legs') return 'Armor Legs';
    }

    // Check each path segment against mappings (from most specific to least)
    for (let i = pathSegments.length - 1; i >= 0; i--) {
        const segment = pathSegments[i];
        if (PATH_TO_SLOT_MAPPINGS[segment]) {
            return PATH_TO_SLOT_MAPPINGS[segment];
        }
    }

    return null;
}

/**
 * Get the active slot names based on the current settings
 * @returns Array of slot names to use for attachment detection
 */
export function getActiveSlotNames(): string[] {
    // Try to get from settings
    try {
        const presetKey = Settings.get('attachment_preset') || 'glint';

        if (presetKey === 'custom') {
            // Custom slots from settings
            const customSlots = Settings.get('attachment_custom_slots');
            if (customSlots && Array.isArray(customSlots) && customSlots.length > 0) {
                return customSlots;
            }
            // Fall back to Glint if custom slots not configured
            return GLINT_PRESET.slots;
        }

        const preset = PRESETS[presetKey];
        if (preset) {
            return preset.slots;
        }
    } catch (e) {
        console.warn('Error getting attachment preset from settings:', e);
    }

    // Default to Glint
    return GLINT_PRESET.slots;
}
