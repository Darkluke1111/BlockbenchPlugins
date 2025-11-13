import { im } from "../import";

// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const path = requireNativeModule('path');
// @ts-expect-error: requireNativeModule is missing in blockbench types --- IGNORE ---
const fs = requireNativeModule('fs');

export function load_back_drop_shape(backDropShape: string) {
    Blockbench.read([get_shape_location(null, backDropShape)], {
        readtype: "text", errorbox: false
    }, (files) => {
        im(autoParseJSON(files[0].content as string), files[0].path, true);
    });

}

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

export function is_backdrop_project(): boolean {
    return Group.all.some(g => g.backdrop) || Cube.all.some(c => c.backdrop);
}