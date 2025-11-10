import * as util from '../util';
import { createBlockbenchMod } from '../util/moddingTools';
import * as PACKAGE from "../../package.json";
import { events } from '../util/events';

createBlockbenchMod(
    `${PACKAGE.name}:vs_legacy_format_converter_mod`,
    {
    },
    _context => {
        return events.LOAD_PROJECT.subscribe(onProjectLoad);
    },
    context => {
        context?.call(context);
    }

);

createBlockbenchMod(
    `${PACKAGE.name}:vs_format_converter_mod`,
    {},
    _context => {
        return events.CONVERT_FORMAT.subscribe(convert_format);
    },
    context => {
        context?.call(context);
    }
);


// Update mesh rotation orders when switching to VS format
const updateMeshRotationOrders = (): void => {
    if (!Project || !Project.format || Project.format.id !== 'formatVS') return;

    // Update canvas to ensure meshes exist
    Canvas.updateAllBones();
    Canvas.updateAllPositions();
    Canvas.updateAll();

    console.log("legacy converting!");

    // Force cube geometry update
    Canvas.updateView({
        elements: Cube.all,
        element_aspects: {
            geometry: true,
            transform: true
        }
    });

    // Set XYZ rotation order on all meshes
    for (const group of Group.all) {
        if (group.mesh && group.mesh.rotation) {
            group.mesh.rotation.order = 'XYZ';
            console.log("legacy converting group!");
        }
    }

    for (const cube of Cube.all) {
        if (cube.mesh && cube.mesh.rotation) {
            cube.mesh.rotation.order = 'XYZ';
            console.log("legacy converting cube!");
        }
    }

    // Refresh canvas
    Canvas.updateAllBones();
    Canvas.updateAllPositions();
    Canvas.updateAll();
};

// Convert rotation values when converting TO VS format
const convert_format = (event) => {
    if (event.format.id !== 'formatVS') return;
    if (!Project) return;

    const old_euler_order = event.old_format?.euler_order || 'ZYX';

    // Only convert if old format used different euler order
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

    // Ensure root group is at VS standard origin (8,0,8)
    const rootGroup = Outliner.root.filter(node => node instanceof Group).map(node => node as Group)[0];
    if (rootGroup && !(rootGroup.origin[0] === 8 && rootGroup.origin[1] === 0 && rootGroup.origin[2] === 8)) {
        rootGroup.origin = [8, 0, 8];
    }

    // Mark as converted
    Project.vsFormatConverted = true;

    // Update mesh rotation orders for display
    updateMeshRotationOrders();
};

// Update mesh orders when opening VS format projects
const onProjectLoad = () => {
    setTimeout(() => {
        if (Project && Project.format && Project.format.id === 'formatVS') {
            updateMeshRotationOrders();
        }
    }, 100);
};

