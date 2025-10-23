
interface VS_Shape {
    editor: VS_EditorSettings | undefined,
    textureWidth: number,
    textureHeight: number,
    textureSizes: Record<string, [number,number]>,
    textures: Record<string, string>,
    elements: Array<VS_Element>,
    animations: Array<VS_Animation> | undefined,
}

interface VS_EditorSettings {
    collapsedPaths: string | undefined,
    allAngles: boolean | undefined,
    entityTextureMode: boolean | undefined,
}

interface VS_Element {
    name: string,
    from: [number, number, number],
    to: [number, number, number],
    autoUnwrap: boolean | undefined
    uv: [number,number],
    rotationOrigin: [number,number,number]
    rotationX: number | undefined,
    rotationY: number | undefined,
    rotationZ: number | undefined,
    faces: Record<VS_Direction,VS_Face>,
    stepParentName: string | undefined,
    children: Array<VS_Element>,
}

type VS_Direction = "north" | "east" | "south" | "west" | "up" | "down"

interface VS_Face {
    texture: string,
    uv: [number,number,number,number],
    rotation: number | undefined,
    windMode: [number,number,number,number],
}

interface VS_Animation {
    name: string,
    code: string,
    quantityframes: number,
    onActivityStopped: VS_OnActivityStopped,
    onAnimationEnd: VS_OnAnimationEnd,
    keyframes: Array<VS_Keyframe>
}

// TODO: Look up other options
type VS_OnActivityStopped = "EaseOut"

// TODO: Look up other options
type VS_OnAnimationEnd = "Repeat"

interface VS_Keyframe {
    frame: number,
    elements: Record<string, Partial<VS_AnimationKey>>,
}

interface VS_AnimationKey {
    offsetX: number,
    offsetY: number,
    offsetZ: number,
    rotationX: number,
    rotationY: number,
    rotationZ: number,
    scaleX: number,
    scaleY: number,
    scaleZ: number,
}

