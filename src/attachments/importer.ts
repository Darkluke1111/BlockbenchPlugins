import { import_model } from '../import_model';
import { VS_Shape } from '../vs_shape_def';
import { handleVSTextures } from './texture_handler';


const DEBUG = false;

function logDebug(message: string, ...args: any[]) {
    if (DEBUG) console.log(message, ...args);
}

function isRecord(value: unknown): value is Record<string, any> {
    return typeof value === 'object' && value !== null;
}

function asArray<T = unknown>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
}

function getErrorMessage(e: unknown): string {
    if (e instanceof Error) return e.message;
    return String(e);
}

function buildUuidMap<T extends { uuid?: unknown }>(items: unknown): Map<UUID, T> {
    const map = new Map<UUID, T>();
    for (const item of asArray<T>(items)) {
        const uuid = item.uuid;
        if (typeof uuid === 'string') map.set(uuid, item);
    }
    return map;
}

function buildTextureMap(model: BBModel): Map<TextureRef, any> {
    const map = new Map<TextureRef, any>();

    for (const [oldIndex, texData] of asArray<BBTextureData>(model.textures).entries()) {
        const texName = typeof texData.name === 'string' ? texData.name : undefined;
        const texPath = typeof texData.path === 'string' ? texData.path : undefined;

        const existing = Texture.all.find(
            (t: any) => (texName && t.name === texName) || (texPath && t.path && t.path === texPath)
        );

        let texture = existing;
        if (!texture) {
            texture = new Texture(texData).add();

            // Load texture from embedded base64 or from disk path (when available)
            if (typeof texData.source === 'string' && texData.source.length > 0) {
                texture.fromDataURL(texData.source);
                logDebug(`[Import BB] Loaded texture from base64: ${texName ?? '(unnamed)'}`);
            } else if (typeof texPath === 'string' && texPath.length > 0 && !texPath.startsWith('data:')) {
                texture.load();
                logDebug(`[Import BB] Loaded texture from path: ${texName ?? texPath}`);
            }

            logDebug(`[Import BB] Added texture: ${texName ?? '(unnamed)'}`);
        } else {
            // Update UV size for existing texture to match the imported data
            if (typeof texData.uv_width === 'number') texture.uv_width = texData.uv_width;
            if (typeof texData.uv_height === 'number') texture.uv_height = texData.uv_height;

            logDebug(
                `[Import BB] Using existing texture: ${texture.name}, updated UV size to ${texture.uv_width}x${texture.uv_height}`
            );
        }

        map.set(oldIndex, texture);
        if (typeof texData.uuid === 'string') map.set(texData.uuid, texture);
    }

    return map;
}

function remapCubeFaceTextures(cubeProps: Record<string, any>, textureMap: Map<TextureRef, any>) {
    const faces = cubeProps?.faces;
    if (!faces || !isRecord(faces)) return;

    for (const faceKey of Object.keys(faces)) {
        const face = faces[faceKey];
        if (!face || !isRecord(face)) continue;

        const textureRef = face.texture as TextureRef | undefined;
        if (textureRef === undefined || textureRef === null) continue;

        const mapped = textureMap.get(textureRef);
        if (!mapped) continue;

        face.texture = mapped.uuid;
    }
}

function createCubeFromElementData(elemData: BBCubeElement, parentGroup: any, textureMap: Map<TextureRef, any>) {
    const cubeProps: Record<string, any> = { ...elemData };
    delete cubeProps.uuid;

    remapCubeFaceTextures(cubeProps, textureMap);

    const cube = new Cube(cubeProps);
    cube.addTo(parentGroup).init();
    logDebug(`[Import BB] Created cube: ${cube.name ?? '(unnamed)'}`);
}

function findExistingGroupByName(parentGroup: any, groupName: string): any | null {
    if (!groupName) return null;
    const searchRoot = parentGroup ? parentGroup.children || [] : Outliner.root;

    for (const child of searchRoot) {
        if (child instanceof Group && (child.name || '').toLowerCase() === groupName.toLowerCase()) {
            return child;
        }
    }

    return null;
}

function getOrCreateGroup(groupSeed: Record<string, any>, parentGroup: any): any {
    const groupName = typeof groupSeed.name === 'string' ? groupSeed.name : '';

    const existing = findExistingGroupByName(parentGroup, groupName);
    if (existing) {
        logDebug(`[Import BB] Merging into existing group: ${groupName}`);
        return existing;
    }

    const groupProps: Record<string, any> = { ...groupSeed };
    delete groupProps.uuid;
    delete groupProps.children;

    const group = new Group(groupProps);
    group.addTo(parentGroup).init();
    logDebug(`[Import BB] Created new group: ${groupName || '(unnamed group)'}`);

    return group;
}

function isCubeElement(value: unknown): value is BBCubeElement {
    return (
        isRecord(value) &&
        typeof value.uuid === 'string' &&
        value.type === 'cube'
    );
}

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
 * Merges a Blockbench .bbmodel attachment into the current project.
 * Supports both Blockbench 4.x outliner (groups are inline, elements referenced by UUID strings)
 * and Blockbench 5.x+ outliner (outliner nodes reference separate `elements` / `groups` lists by UUID).
 */
export function mergeBBModel(content: unknown, _filePath: string) {
    try {
        if (!isRecord(content)) {
            Blockbench.showQuickMessage('Import failed: invalid .bbmodel content', 5000);
            return;
        }

        const model = content as BBModel;
        logDebug(`[Import BB] Starting merge of .bbmodel attachment`);

        const textureMap = buildTextureMap(model);
        const elementByUuid = buildUuidMap<Record<string, any>>(model.elements);
        const groupByUuid = buildUuidMap<Record<string, any>>(model.groups);
        const processChildren = (children: BBOutlinerItem[], parent: any) => {
            for (const child of children) processOutlinerItem(child, parent);
        };

        const tryCreateCubeByUuid = (uuid: UUID, parent: any): boolean => {
            const elemData = elementByUuid.get(uuid);
            if (!isCubeElement(elemData)) return false;
            createCubeFromElementData(elemData, parent, textureMap);
            return true;
        };

        const tryProcessGroupByUuid = (uuid: UUID, node: Record<string, any>, parent: any): boolean => {
            const groupData = groupByUuid.get(uuid);
            if (!groupData) return false;

            // Merge groupMap data with outliner hints (e.g., children structure)
            const seed = { ...groupData, ...node };
            const targetGroup = getOrCreateGroup(seed, parent);

            const children = asArray<BBOutlinerItem>(node.children);
            processChildren(children, targetGroup);
            return true;
        };

        const processUuidStringItem = (uuid: UUID, parent: any) => {
            // Blockbench 4.x: element references are UUID strings
            if (tryCreateCubeByUuid(uuid, parent)) return;
        };

        const processInlineGroupNode = (node: Record<string, any>, parent: any) => {
            const targetGroup = getOrCreateGroup(node, parent);
            const children = asArray<BBOutlinerItem>(node.children);
            processChildren(children, targetGroup);
        };

        const processObjectNode = (node: Record<string, any>, parent: any) => {
            const uuid = typeof node.uuid === 'string' ? node.uuid : undefined;

            // Blockbench 5.x+: outliner node references separate `elements` / `groups` lists by UUID.
            if (uuid) {
                if (tryCreateCubeByUuid(uuid, parent)) return;
                if (tryProcessGroupByUuid(uuid, node, parent)) return;
            }

            // Blockbench 4.x: the node itself is an inline group object
            processInlineGroupNode(node, parent);
        };

        const processOutlinerItem = (item: BBOutlinerItem, parent: any) => {
            if (typeof item === 'string') return processUuidStringItem(item, parent);
            if (!isRecord(item)) return;
            return processObjectNode(item, parent);
        };

        for (const item of asArray<BBOutlinerItem>(model.outliner)) {
            processOutlinerItem(item, null);
        }

        Canvas.updateAll();
        logDebug(`[Import BB] Merge complete. Groups: ${Group.all.length}, Cubes: ${Cube.all.length}`);
    } catch (e) {
        console.error('[Import BB] CRITICAL ERROR in mergeBBModel:', e);
        Blockbench.showQuickMessage(`Import failed: ${getErrorMessage(e)}`, 5000);
    }
}
