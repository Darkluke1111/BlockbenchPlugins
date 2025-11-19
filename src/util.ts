import * as fs from "fs";
import * as path from "path";
declare const THREE: typeof import('three');

export const fps = 30;

export const get_texture_location = function (domain, rel_path) {

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

export function vector_equals(a: [number, number, number], b: [number, number, number]): boolean {
    for (let i = 0; i < 3; i++) {
        if(a[i] != b[i]) {
            return false;
        }
    }
    return true;
}

export function vector_add(a: [number, number, number], b: [number, number, number]): [number, number, number] {
    const c: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < a.length; i++) {
        c[i] = a[i] + b[i];
    }
    return c;
}

export function vector_inv(a: [number, number, number]): [number, number, number] {
    const c: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < a.length; i++) {
        c[i] = - a[i];
    }

    return c;
}

export function vector_sub(a: [number, number, number], b: [number, number, number]): [number, number, number] {
    const c: [number, number, number] = [0, 0, 0];
    for (let i = 0; i < a.length; i++) {
        c[i] = a[i] - b[i];
    }
    return c;
}

export function is_vs_project(project: ModelProject | undefined | null): boolean {
    if(project && project.format.id === 'formatVS') return true;
    else return false;
}

// Convert ZYX to XYZ euler angles
export function zyx_to_xyz(rotation: readonly [number, number, number]): [number, number, number] {
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