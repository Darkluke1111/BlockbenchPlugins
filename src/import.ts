import { VS_Group, VS_Cube, VS_Face, VS_Texture, VS_Project } from "./property";
import util from "./util"

export default function (data, path, asHologram) {

    let traverseImportTree = function (parent, object_space_pos : ArrayVector3, nodes) {
        let group: VS_Group
        for (let i = 0; i < nodes.length; i++) {
            let e = nodes[i];


            group = new Group({
                name: e.name + '_group',
                //stepParentName: e.stepParentName,
                origin: e.rotationOrigin ? util.vector_add(e.rotationOrigin, object_space_pos) : object_space_pos,
                rotation: util.xyz_to_zyx([e.rotationX || 0, e.rotationY || 0, e.rotationZ || 0]),
            }) as VS_Group

            if(asHologram) {
                group.hologram = path;
            }

            if (e.stepParentName) {
                group.stepParentName = e.stepParentName
            }


            group.addTo(parent).init();
            //group.extend({locked: locked})

            if (e.faces && (Object.keys(e.faces).length > 0)) {

                let reduced_faces = {}
                for (const direction of ['north', 'east', 'south', 'west', 'up', 'down']) {
                    if (e.faces[direction]) {
                        let texture_name = e.faces[direction].texture ? e.faces[direction].texture.substring(1) : null;
                        let tex = Texture.all.find((elem, i, arr) => elem.name == texture_name);
                        reduced_faces[direction] = { texture: tex, uv: e.faces[direction].uv, rotation: e.faces[direction].rotation };

                    } 
                    // This gets ignored by Blockbench even though the API says it should work...
                    // else {
                    //     console.log("Disable face")
                    //     reduced_faces[direction] = { enabled: false}
                    // }
                }
                let rotation: ArrayVector3 = [0, 0, 0]
                let cube = new Cube({
                    name: e.name,
                    from: util.vector_add(e.from, object_space_pos),
                    to: util.vector_add(e.to, object_space_pos),
                    uv_offset: e.uv || undefined,
                    origin: e.rotationOrigin ? util.vector_add(e.rotationOrigin, object_space_pos) : object_space_pos,
                    visibility: true,
                    shade: true,
                    faces: reduced_faces,
                    rotation: rotation,
                }) as VS_Cube
                
                // Hacky way to disable disabled faces which also doesn't work =/
                // for (const direction of ['north', 'east', 'south', 'west', 'up', 'down']) {
                //     if (!e.faces[direction]) {
                //         console.log("Disable face")
                //         //console.log(cube.faces[direction])
                //         cube.faces[direction].enabled = false
                //         console.log(cube.faces[direction]) // WTH?!
                //     } 
                // }

                if(asHologram) {
                    cube.hologram = path;
                }

                //if (e.children) {
                cube.addTo(group);
                //} else {
                //    cube.addTo(parent);
                //}
                cube.init();
                for (const direction of ['north', 'east', 'south', 'west', 'up', 'down']) {
                    if (e.faces[direction] && e.faces[direction].windMode) {
                        (cube.faces[direction] as VS_Face).windMode = e.faces[direction].windMode
                    }
                }
            }
            if (e.children) {
                traverseImportTree(group, util.vector_add(e.from, object_space_pos), e.children);
            }

        }
        return group
    }

    let content = autoParseJSON(data)

    if (content.textureHeight) {
        Project.texture_height = content.textureHeight;
    }
    if (content.textureWidth) {
        Project.texture_width = content.textureWidth;
    }


    //Texture
    for (var t in content.textures) {
        // console.log(path.posix.format({
        //     root: asset_path,
        //     name: content.textures[t],
        //     ext: '.png',
        // }))
        let texture = new Texture({
            name: t,
            path: util.get_texture_location(null, content.textures[t]),

        })
        if (content.textureSizes && content.textureSizes[t]) {
            texture.uv_width = content.textureSizes[t][0]
            texture.uv_height = content.textureSizes[t][1]
        }
        texture.add().load();
        (texture as VS_Texture).textureLocation = content.textures[t]
    }

    if (content.editor) {
        let project = Project as VS_Project
        if(content.editor.backDropShape) {
            project.backDropShape = content.editor.backDropShape          
        }
        if(content.editor.allAngles) {
            project.allAngles = content.editor.allAngles
        }
        if(content.editor.entityTextureMode) {
            project.entityTextureMode = content.editor.entityTextureMode
        }

        if(content.editor.collapsedPaths) {
            project.collapsedPaths = content.editor.collapsedPaths
        }
    }



    //Cubes
    let group = traverseImportTree(null, [0, 0, 0], content.elements)
    //group.extend({locked: locked});

}