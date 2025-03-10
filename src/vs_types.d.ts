

export declare class Content {
    editor: Editor
    textureWidth: number
    textureHeight: number
    textureSizes: { [tkey: string]: ArrayVector2}
    textures: { [tkey: string]: string}
    elements: Element[]
}

export declare class Editor {
    backDropShape: string
    allAngles: boolean
    entityTextureMode: boolean
    collapsedPaths: string
}

export declare class Element {
    name: string
    stepParentName?: string
    from: ArrayVector3
    to: ArrayVector3
    rotationOrigin: ArrayVector3
    uv: ArrayVector2
    rotationX?: number
    rotationY?: number
    rotationZ?: number
    faces: Partial<Record<CubeFaceDirection, CubeFace>>
    children: Element[]
}

export type CubeFaceDirection = 'north' | 'south' | 'east' | 'west' | 'up' | 'down'

export declare class CubeFace {
    texture: string
    uv: ArrayVector4
    rotation?: number
    windMode?: ArrayVector4
    windData?: ArrayVector4
}