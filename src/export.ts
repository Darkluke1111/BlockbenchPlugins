import util from "./util"
import { VS_Cube, VS_Face, VS_Group, VS_Project, VS_Texture } from "./property";
import { Element, Content, CubeFace, CubeFaceDirection, Editor } from "./vs_types";

export default function (options) {
    let traverseExportTree = function (parent, nodes, accu) {

        for (let i = 0; i < nodes.length; i++) {
            let n = nodes[i];
            let parent_pos = parent ? parent.origin : [0, 0, 0];
            // Node is a Group
            if (n.children) {
                let g = n as VS_Group;
                let converted_rotation = util.zyx_to_xyz(g.rotation);
                let e = {
                    name: g.name,
                    ... (g.stepParentName) && { stepParentName: g.stepParentName },
                    from: util.vector_sub(g.origin, parent_pos),
                    to: util.vector_sub(g.origin, parent_pos),
                    rotationOrigin: util.vector_sub(g.origin, parent_pos),
                    ... (converted_rotation[0] != 0) && { rotationX: converted_rotation[0] },
                    ... (converted_rotation[1] != 0) && { rotationY: converted_rotation[1] },
                    ... (converted_rotation[2] != 0) && { rotationZ: converted_rotation[2] },
                    children: []
                }

                if(!g.hologram) {
                    accu.push(e);
                    traverseExportTree(g, g.children, e.children);
                } else {
                    traverseExportTree(g, g.children, accu);
                }

            } else { // Node is a Cube
                let c = n as VS_Cube;
                let reduced_faces = {}

                for (const direction of ['north', 'east', 'south', 'west', 'up', 'down']) {
                    let cube_face = c.faces[direction] as VS_Face
                    // texture is false means texture is not set, texture is null means face is disabled...
                    if (cube_face && cube_face.texture != null) {
                        reduced_faces[direction] = {};
                        let texture = cube_face.getTexture()
                        let texture_name = texture ? texture.name : "unknown";
                        reduced_faces[direction].texture = "#" + texture_name;
                        reduced_faces[direction].uv = c.faces[direction].uv;
                        if (c.faces[direction].rotation != 0) {
                            reduced_faces[direction].rotation = c.faces[direction].rotation;
                        }
                        reduced_faces[direction].windMode = cube_face.windMode
                        reduced_faces[direction] = new oneLiner(reduced_faces[direction])
                    }
                }
                let converted_rotation = util.zyx_to_xyz(c.rotation);
                let e = {
                    name: c.name,
                    from: util.vector_sub(c.from, parent_pos),
                    to: util.vector_sub(c.to, parent_pos),
                    rotationOrigin: util.vector_sub(c.origin, parent_pos),
                    ... (c.uv_offset[0] != 0 && c.uv_offset[1] != 0) && { uv: c.uv_offset},
                    faces: reduced_faces,
                    ... (converted_rotation[0] != 0) && { rotationX: converted_rotation[0] },
                    ... (converted_rotation[1] != 0) && { rotationY: converted_rotation[1] },
                    ... (converted_rotation[2] != 0) && { rotationZ: converted_rotation[2] },
                }
                if(!c.hologram){
                    accu.push(e);
                }

            }
        }


    }

    let data = {
        editor: {},
        textureWidth: undefined,
        textureHeight: undefined,
        textureSizes: {},
        textures: {},
        elements: []
    }


    for (var i = 0; i < Texture.all.length; i++) {
        let t = Texture.all[i]
        if (t.getUVWidth() && t.getUVHeight()) {

            data.textureSizes[t.name] = [Texture.all[i].uv_width, Texture.all[i].uv_height];
        }
    }


    data.textureWidth = Project.texture_width
    data.textureHeight = Project.texture_height

    //Get all nodes on top level (children of 'root')
    let top_level = [];

    for (let i = 0; i < Group.all.length; i++) {
        if (Group.all[i].parent === 'root') {
            top_level.push(Group.all[i]);

        }
    }
    for (let i = 0; i < Cube.all.length; i++) {
        if (Cube.all[i].parent === 'root') {
            top_level.push(Cube.all[i]);

        }
    }
    traverseExportTree(null, top_level, data.elements);


    for (let i = 0; i < Texture.all.length; i++) {
        let t = Texture.all[i] as VS_Texture;
        data.textures[t.name] = t.textureLocation

        //path.posix.relative('C:/Users/Lukas/AppData/Roaming/Vintagestory/assets/survival/textures/', t.path).split('.').slice(0, -1).join('.');
    }

    let project = Project as VS_Project

    data.editor = {
        ... (project.backDropShape) && { backDropShape: project.backDropShape },
        ... (project.allAngles) && { allAngles: project.allAngles },
        ... (project.entityTextureMode) && { entityTextureMode: project.entityTextureMode },
        ... (project.collapsedPaths) && { collapsedPaths: project.collapsedPaths },
    }

    return autoStringify(data)
}