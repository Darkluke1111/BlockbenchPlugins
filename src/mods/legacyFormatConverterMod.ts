import * as util from '../util';
import { formatVS } from "../mods/formatMod";
import { createBlockbenchMod } from '../util/moddingTools';
import * as PACKAGE from "../../package.json";
import { events } from '../util/events';

createBlockbenchMod(
    `${PACKAGE.name}:vs_format_mod`,
    {
    },
    _context => {
        return events.LOAD_PROJECT.subscribe(onProjectLoad);
    },
    context => {
        context();
    }

);

function onProjectLoad(_project) {
    // Do everything together with delay for elements to load
    if (Settings.get("auto_convert_vs_format").value) {
        setTimeout(convertProjectToVSFormat, 1000);
    }
};

function convertProjectToVSFormat(): void {
    if (!Project) return;

    // If already VS format, just ensure mesh orders are correct
    if (Project.format && Project.format.id === 'formatVS') {
        for (const group of Group.all) {
            if (group.mesh && group.mesh.rotation) {
                group.mesh.rotation.order = 'XYZ';
            }
        }
        for (const cube of Cube.all) {
            if (cube.preview_controller && cube.preview_controller.mesh && cube.preview_controller.mesh.rotation) {
                cube.preview_controller.mesh.rotation.order = 'XYZ';
            }
        }
        Canvas.updateAllBones();
        Canvas.updateAllPositions();
        Canvas.updateAll();
        return;
    }

    if (Project.vsFormatConverted) {
        // File already converted, just set format and display order
        Project.format.id = "formatVS";

        for (const group of Group.all) {
            if (group.mesh && group.mesh.rotation) {
                group.mesh.rotation.order = 'XYZ';
            }
        }
        for (const cube of Cube.all) {
            if (cube.preview_controller && cube.preview_controller.mesh && cube.preview_controller.mesh.rotation) {
                cube.preview_controller.mesh.rotation.order = 'XYZ';
            }
        }

        Canvas.updateAllBones();
        Canvas.updateAllPositions();
        Canvas.updateAll();
        return;
    }

    const old_format = Project.format?.id || 'unknown';
    // @ts-expect-error: euler_order is missing in blockbench types --- IGNORE ---
    const old_euler_order = Project.format?.euler_order || 'ZYX';

    // Convert rotation values for VS export
    if (old_euler_order !== 'XYZ') {
        for (const group of Group.all) {
            if (group.rotation && (group.rotation[0] !== 0 || group.rotation[1] !== 0 || group.rotation[2] !== 0)) {
                const old_rotation = [group.rotation[0], group.rotation[1], group.rotation[2]] as [number, number, number];
                const new_rotation = util.zyx_to_xyz(old_rotation);
                group.rotation = new_rotation;
            }
        }

        for (const cube of Cube.all) {
            if (cube.rotation && (cube.rotation[0] !== 0 || cube.rotation[1] !== 0 || cube.rotation[2] !== 0)) {
                const old_rotation = [cube.rotation[0], cube.rotation[1], cube.rotation[2]] as [number, number, number];
                const new_rotation = util.zyx_to_xyz(old_rotation);
                cube.rotation = new_rotation;
            }
        }
    }

    // Switch to VS format
    Project.format = formatVS;
    Project.vsFormatConverted = true;

    // Update canvas to create all meshes
    Canvas.updateAllBones();
    Canvas.updateAllPositions();
    Canvas.updateAll();

    // Force cube geometry update
    Canvas.updateView({
        elements: Cube.all,
        element_aspects: {
            geometry: true,
            transform: true
        }
    });

    // Set XYZ rotation order on all group meshes
    for (const group of Group.all) {
        if (group.mesh && group.mesh.rotation) {
            group.mesh.rotation.order = 'XYZ';
        }
    }

    // Set XYZ rotation order on all cube meshes
    for (const cube of Cube.all) {
        if (cube.mesh && cube.mesh.rotation) {
            cube.mesh.rotation.order = 'XYZ';
        }
    }

    // Refresh canvas with correct rotation orders
    Canvas.updateAllBones();
    Canvas.updateAllPositions();
    Canvas.updateAll();

    Blockbench.showQuickMessage('Converted to VS format', 3000);
};


