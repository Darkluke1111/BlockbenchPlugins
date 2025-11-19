
import { createBlockbenchMod } from "../util/moddingTools";
import * as PACKAGE from "../../package.json";
import { events } from "../util/events";
import { is_vs_project } from "../util";

export let formatVS;

/**
 * A workaround for blockbenches lacking support for an offset scene. scene.position is automatically set to 8,0,8
 * when loading a project format with centered_grid=false but many tools inside blockbench don't take this offset
 * into account. We remove this offset with this mod until those issues in blockbench are fixed.
 */
createBlockbenchMod(
    `${PACKAGE.name}:scene_offset_removal_mod`,
    {},
    _context => {
        return events.SELECT_FORMAT.subscribe(({format, project}) => {
            if(is_vs_project(project)) {
                scene.position.set(0,0,0);
            }
        });
        },
    context => {
        context();
    }

);