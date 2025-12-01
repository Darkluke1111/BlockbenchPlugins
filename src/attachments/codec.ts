export function createExportCodec() {
    function compileGroupsFrom(rootGroups: any[], undo: boolean): any[] {
        const result: any[] = [];
        function iterate(array: any[], save_array: any[]) {
            for (const element of array) {
                if (element.type === 'group') {
                    const obj = element.compile(undo);
                    if (element.children.length > 0) {
                        iterate(element.children, obj.children);
                    }
                    save_array.push(obj);
                } else {
                    save_array.push(element.uuid);
                }
            }
        }
        iterate(rootGroups, result);
        return result;
    }

    // Recursive function to collect all nested elements
    function collectAllElements(nodes: any[]): any[] {
        const allElements: any[] = [];

        function traverse(node: any) {
            allElements.push(node);
            if (node.children && node.children.length > 0) {
                node.children.forEach((child: any) => traverse(child));
            }
        }

        nodes.forEach(node => traverse(node));
        return allElements;
    }

    /**
     * Collects all texture UUIDs used by the given cubes
     * @param cubes Array of cubes to check
     * @returns Set of texture UUIDs that are referenced by the cubes
     */
    function collectUsedTextureUuids(cubes: any[]): Set<string> {
        const usedUuids = new Set<string>();

        for (const cube of cubes) {
            if (!cube.faces) continue;

            for (const faceKey in cube.faces) {
                const face = cube.faces[faceKey];
                if (face && face.texture !== undefined && face.texture !== null) {
                    // face.texture can be a texture index or UUID
                    // Get the actual texture to find its UUID
                    const tex = Texture.all[face.texture] || Texture.all.find((t: any) => t.uuid === face.texture);
                    if (tex) {
                        usedUuids.add(tex.uuid);
                    }
                }
            }
        }

        return usedUuids;
    }

    return new Codec('projectSelection', {
        name: 'Blockbench Project Selection',
        extension: 'bbmodel',
        remember: true,
        export(selection: any[]) {
            Blockbench.export({
                resource_id: 'model',
                type: this.name,
                extensions: [this.extension],
                name: `${selection[0].name}_attachment.bbmodel`,
                startpath: this.startPath(),
                content: this.compile(selection)
            });
        },
        compile(selection: any[], options?: any) {
            if (!options) options = {};
            const model: any = {
                meta: {
                    format_version: '4.5',
                    model_format: Format.id,
                    box_uv: Project.box_uv
                },
                resolution: {
                    width: Project.texture_width || 16,
                    height: Project.texture_height || 16,
                },
                elements: [],
                outliner: []
            };

            // Use the recursive function to collect all nested elements
            const allElements = collectAllElements(selection);

            // Collect all cubes from the selection
            const cubes: any[] = [];
            allElements.forEach(el => {
                if (el instanceof Cube) {
                    cubes.push(el);
                    model.elements.push(el.getSaveCopy());
                }
            });

            model.outliner = compileGroupsFrom(selection, true);

            // Only export textures that are actually used by the selected elements
            const usedTextureUuids = collectUsedTextureUuids(cubes);
            model.textures = [];
            Texture.all.forEach((tex: any) => {
                if (usedTextureUuids.has(tex.uuid)) {
                    const t: any = tex.getUndoCopy();
                    t.source = 'data:image/png;base64,' + tex.getBase64();
                    t.mode = 'bitmap';
                    model.textures.push(t);
                }
            });

            return compileJSON(model);
        }
    });
}
