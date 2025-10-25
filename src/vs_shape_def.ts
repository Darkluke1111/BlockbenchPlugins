/**
 * Interfaces that define the structure of Vintage Story shape files.
 * Remember to run 'npm run gen_schema' after modifying this file to generate the updated JSON schema for validation.
 */

export interface VS_Shape {
    editor?: VS_EditorSettings | undefined,
    textureWidth?: number,
    textureHeight?: number,
    textureSizes?: Record<string, [number,number]>,
    textures: Record<string, string>,
    elements: Array<VS_Element>,
    animations?: Array<VS_Animation>,
}

export interface VS_EditorSettings {
    backDropShape?: string,
    collapsedPaths?: string,
    allAngles?: boolean,
    entityTextureMode?: boolean,
    singleTexture?: boolean,
}

export interface VS_Element {
    name: string,
    from: [number, number, number],
    to: [number, number, number],
    autoUnwrap?: boolean,
    uv?: [number,number],
    rotationOrigin?: [number,number,number]
    rotationX?: number,
    rotationY?: number,
    rotationZ?: number,
    faces?: Partial<Record<VS_Direction,VS_Face>>,
    stepParentName?: string,
    children?: Array<VS_Element>,
}

export enum VS_Direction{ NORTH ="north", EAST = "east", SOUTH =  "south", WEST = "west", UP = "up", DOWN = "down"}

export interface VS_Face {
    texture: string,
    uv: [number,number,number,number],
    rotation?: number,
    windMode?: [number,number,number,number],
    windData?: [number,number,number,number],
}

export interface VS_Animation {
    name: string,
    code: string,
    quantityframes: number,
    onActivityStopped: VS_OnActivityStopped,
    onAnimationEnd: VS_OnAnimationEnd,
    easeAnimationSpeed?: boolean,
    keyframes: Array<VS_Keyframe>
}

export type VS_OnActivityStopped = "PlayTillEnd" | "Rewind" | "Stop" | "EaseOut"

export type VS_OnAnimationEnd = "Hold" | "Repeat" | "Stop" | "EaseOut"

export interface VS_Keyframe {
    frame: number,
    elements: Record<string, Partial<VS_AnimationKey>>,
}

export interface VS_AnimationKey {
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

