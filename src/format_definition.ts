import { codecVS } from "./codec";

export function create_format(): ModelFormat { 
    const format =  new ModelFormat("formatVS", {
        name: "Vintage Story Base Format",
        codec: codecVS,
        icon: "fa-cookie-bite",
        box_uv: false,
        optional_box_uv: false,
        single_texture: false,
        single_texture_default: false,
        per_group_texture: false,
        per_texture_uv_size: true,
        model_identifier: false,
        legacy_editable_file_name: false,
        parent_model_id: false, //Use this for backdrops? false for now
        vertex_color_ambient_occlusion: false,
        animated_textures: false, // NOt sure if supported by VS
        bone_rig: true,
        centered_grid: false,
        rotate_cubes: true,
        stretch_cubes: false,
        integer_size: false,
        meshes: false,
        texture_meshes: false,
        locators: true,
        rotation_limit: false,
        rotation_snap: false,
        uv_rotation: true,
        java_face_properties: false,
        select_texture_for_particles: false,
        texture_mcmeta: false,
        bone_binding_expression: false, // Revisit for animation
        animation_files: false,
        texture_folder: true,
        image_editor: false, // Setting this to true removes the object outliner?!?!
        edit_mode: true,
        paint_mode: true,
        display_mode: false, // Only some Minecraft Skin stuff it seems
        animation_mode: true,
        pose_mode: false,
        animation_controllers: true,
        box_uv_float_size: false,
        java_cube_shading_properties: false,
        cullfaces: false, // Not sure if Vintage Story supports this
        render_sides: "front", //Seems right to me but I havent tested how VS does it
        //@ts-expect-error: Missing in type --- IGNORE ---
        euler_order: "XYZ",
        animation_loop_wrapping: true,
        quaternion_interpolation: false,
        per_animator_rotation_interpolation: false,
    });
    codecVS.format = format;
    return format;
};