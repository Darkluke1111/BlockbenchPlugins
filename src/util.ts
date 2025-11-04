import * as fs from "fs";
import * as path from "path";
declare const THREE: typeof import('three');

const fps = 30;

const get_texture_location = function (domain, rel_path) {

    for (const base_mod_path of ["creative", "game", "survival"]) {
        const f = path.posix.format({
            root: Settings.get("game_path") + path.sep + "assets" + path.sep + base_mod_path + path.sep + "textures" + path.sep,
            name: rel_path,
            ext: '.png',
        });
        const exists = fs.existsSync(f);
        if (exists) {

            return f;
        }
    }
    return "";
};

const get_shape_location = function (domain, rel_path) {

    for (const base_mod_path of ["creative", "game", "survival"]) {
        const f = path.posix.format({
            root: Settings.get("game_path") + path.sep + "assets" + path.sep + base_mod_path + path.sep + "shapes" + path.sep,
            name: rel_path,
            ext: '.json',
        });
        const exists = fs.existsSync(f);
        if (exists) {

            return f;
        }
    }
    return "";
};

const visit_tree = function (tree, visitor) {
    const visit_tree_rec = (parent, tree, visitor) => {
        if (is_group(tree)) {
            if (visitor.visit_group) {
                visitor.visit_group(tree, parent);
            }
            for (const child of tree.children) {
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

const is_group = (x) => x.children;


function copyOrigin(source, target) {
    const target_tmp = {};
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
            child.moveVector([-parent.from[0], -parent.from[1], -parent.from[2]], null, true);
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

function vector_add(a: [number, number, number], b: [number, number, number]): [number, number, number] {
    const c: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < a.length; i++) {
        c[i] = a[i] + b[i];
    }
    return c;
}

function vector_inv(a: [number, number, number]): [number, number, number] {
    const c: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < a.length; i++) {
        c[i] = - a[i];
    }

    return c;
}

function vector_sub(a: [number, number, number], b: [number, number, number]): [number, number, number] {
    const c: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < a.length; i++) {
        c[i] = a[i] - b[i];
    }
    return c;
}

// Convert ZYX to XYZ euler angles
function zyx_to_xyz(rotation: readonly [number, number, number]): [number, number, number] {
    const euler = new THREE.Euler(
        THREE.MathUtils.degToRad(rotation[0]),
        THREE.MathUtils.degToRad(rotation[1]),
        THREE.MathUtils.degToRad(rotation[2]),
        'ZYX'
    );

    euler.reorder('XYZ');

    // Use properties instead of toArray() (which includes order as 4th element)
    return [
        THREE.MathUtils.radToDeg(euler.x),
        THREE.MathUtils.radToDeg(euler.y),
        THREE.MathUtils.radToDeg(euler.z)
    ];
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
    zyx_to_xyz,
};