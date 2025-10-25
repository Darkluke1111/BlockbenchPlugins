import * as fs from "fs";
import * as path from "path";

let fps = 30;

let get_texture_location = function (domain, rel_path) {

    for (let base_mod_path of ["creative", "game", "survival"]) {
        let f = path.posix.format({
            root: Settings.get("game_path") + path.sep + "assets" + path.sep + base_mod_path + path.sep + "textures" + path.sep,
            name: rel_path,
            ext: '.png',
        });
        let exists = fs.existsSync(f);
        if (exists) {

            return f;
        }
    }
    return "";
};

let get_shape_location = function (domain, rel_path) {

    for (let base_mod_path of ["creative", "game", "survival"]) {
        let f = path.posix.format({
            root: Settings.get("game_path") + path.sep + "assets" + path.sep + base_mod_path + path.sep + "shapes" + path.sep,
            name: rel_path,
            ext: '.json',
        });
        let exists = fs.existsSync(f);
        if (exists) {

            return f;
        }
    }
    return "";
};

let visit_tree = function (tree, visitor) {
    let visit_tree_rec = (parent, tree, visitor) => {
        if (is_group(tree)) {
            if (visitor.visit_group) {
                visitor.visit_group(tree, parent);
            }
            for (let child of tree.children) {
                visit_tree_rec(tree, child, visitor);
            }
        } else {
            if (visitor.visit_cube) {
                visitor.visit_cube(tree, parent);
            }
        }
    };

    visit_tree_rec(null, tree, visitor);
};

let is_group = (x) => x.children;


function copyOrigin(source, target) {
    let target_tmp = {};
    Group.properties["origin"].copy(source, target_tmp);
    Group.properties["origin"].merge(target, target_tmp);
}

function setParent(child, parent) {
    visit_tree(child, {
        visit_cube: (child, _p) => {
            child.moveVector(parent.from, null, true);
            child.origin = [child.origin[0] + parent.from[0], child.origin[1] + parent.from[1], child.origin[2] + parent.from[2]];
        },
        visit_group: (child, _p) => {
            child.origin = [child.origin[0] + parent.from[0], child.origin[1] + parent.from[1], child.origin[2] + parent.from[2]];

        }
    });
    Canvas.updateAllPositions();
    Canvas.updateAllBones();
}

function removeParent(child, parent) {
    visit_tree(child, {
        visit_cube: (child, _p) => {
            child.moveVector([-parent.from[0], -parent.from[1],-parent.from[2]], null, true);
            child.origin = [child.origin[0] - parent.from[0], child.origin[1] - parent.from[1], child.origin[2] - parent.from[2]];
        },
        visit_group: (child, _p) => {
            child.origin = [child.origin[0] - parent.from[0], child.origin[1] - parent.from[1], child.origin[2] - parent.from[2]];

        }
    });
    Canvas.updateAllPositions();
    Canvas.updateAllBones();
}

function update_children(node) {
    visit_tree(node, {
        visit_cube(cube, _p) {
            cube.preview_controller.updateTransform(cube);
            cube.preview_controller.updateGeometry(cube);
            cube.preview_controller.updateFaces(cube);
            cube.preview_controller.updateUV(cube);
        },
        visit_group(group, _p) {
            Canvas.updateView({
                groups: [group]
            });
        }
    });

}

function vector_add(a: [number,number,number], b: [number,number,number]): [number,number,number] {
    let c: [number,number,number] = [0,0,0];
    for(let i = 0 ; i < a.length ; i++) {
        c[i] = a[i] + b[i];
    }
    return c;
}

function vector_inv(a: [number,number,number]): [number,number,number] {
    let c: [number,number,number] = [0,0,0];
    for(let i = 0 ; i < a.length ; i++) {
        c[i] = - a[i];
    }
   
    return c;
}

function vector_sub(a: [number,number,number], b: [number,number,number]): [number,number,number] {
    let c: [number,number,number] = [0,0,0];
    for(let i = 0 ; i < a.length ; i++) {
        c[i] = a[i] - b[i];
    }
    return c;
}

export {
    fps,
    get_texture_location,
    get_shape_location,
    visit_tree,
    setParent,
    removeParent,
    vector_add,
    vector_sub,
    vector_inv,
};