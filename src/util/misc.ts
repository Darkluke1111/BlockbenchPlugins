import { im } from "../import";

// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const path = requireNativeModule('path');

export function loadBackDropShape() {
    const backdrop = {};
    // @ts-expect-error: copy has wrong type
    editor_backDropShapeProp.copy(Project, backdrop);

    // @ts-expect-error: backDropShape is added by copy above
    const backDropShape = backdrop.backDropShape;
    if (backDropShape) {
        Blockbench.read([get_shape_location(null, backDropShape)], {
            readtype: "text", errorbox: false
        }, (files) => {
            im(files[0].content, files[0].path, true);
        });
    }
}

export function resolveStepparentTransforms() {
    for (const g of Group.all) {
        const p = {};

        // @ts-expect-error: copy has wrong type
        props.stepParentProp.copy(g, p);
        // @ts-expect-error: stepParentName is added by copy above
        const stepParentName = p.stepParentName;
        if (stepParentName) {
            const spg = Group.all.find(group => group.name === (stepParentName + "_group"));
            if (spg) {
                const sp = spg.children[0];
                setParent(g, sp);
                g.addTo(spg);
            }
        }
    }
}

export function resetStepparentTransforms() {
    for (const g of Group.all) {
        const p = {};
        // @ts-expect-error: copy has wrong type
        props.stepParentProp.copy(g, p);
        // @ts-expect-error: stepParentName is added by copy above
        const stepParentName = p.stepParentName;
        if (!g.hologram) {
            const spg = Group.all.find(group => group.name === (stepParentName + "_group"));
            if (spg) {
                const sp = spg.children[0];

                removeParent(g, sp);
                g.addTo(undefined);
            }
        }
    }
}

export function setParent(child, parent) {
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

export function removeParent(child, parent) {
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

export function visit_tree (tree, visitor) {
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

export function is_group(x) { return x.children;}

export function get_shape_location(domain, rel_path): string {

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

export function update_children(node) {
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