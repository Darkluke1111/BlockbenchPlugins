import { VS_Animation, VS_Keyframe } from "./vs_shape_def";
import * as util from "./util";
import { is_backdrop_project } from "./util/misc";

/**
 * Exports Blockbench animations to the Vintage Story animation format.
 * @returns An array of VS animations.
 */
export function export_animations(): Array<VS_Animation> {
    const animations: Array<VS_Animation> = [];

    // Don't export any animations if project contains backdrops
    if(is_backdrop_project()) {
        return [];
    }

    (Animation as unknown as typeof _Animation).all.forEach(animation => {
        const keyframes: Record<number,VS_Keyframe> = {};
        const fps = util.fps;
        const animators = Object.values(animation.animators || {});
        animators.forEach(animator => {
            if (animator.keyframes.length > 0 && animator.type === 'bone') {
                const bone_name = animator.name;

                animator.keyframes.forEach(kf => {
                    const frame = Math.round(kf.time * fps);
                    keyframes[frame] = keyframes[frame] || { frame, elements: {} };
                    keyframes[frame].elements[bone_name] = keyframes[frame].elements[bone_name] || {};

                    const dataPoint = kf.data_points[0];
                    switch (kf.channel) {
                        case 'rotation':
                            const rot = [dataPoint.x, dataPoint.y, dataPoint.z];
                            keyframes[frame].elements[bone_name].rotationX = Number(rot[0]);
                            keyframes[frame].elements[bone_name].rotationY = Number(rot[1]);
                            keyframes[frame].elements[bone_name].rotationZ = Number(rot[2]);
                            break;
                        case 'position':
                            keyframes[frame].elements[bone_name].offsetX = Number(dataPoint.x);
                            keyframes[frame].elements[bone_name].offsetY = Number(dataPoint.y);
                            keyframes[frame].elements[bone_name].offsetZ = Number(dataPoint.z);
                            break;
                        case 'scale':
                            if (dataPoint.x !== 1) keyframes[frame].elements[bone_name].scaleX = Number(dataPoint.x);
                            if (dataPoint.y !== 1) keyframes[frame].elements[bone_name].scaleY = Number(dataPoint.y);
                            if (dataPoint.z !== 1) keyframes[frame].elements[bone_name].scaleZ = Number(dataPoint.z);
                            break;
                    }
                });
            }

            // Wraps all animation elements into oneLiner wrappers
            for(const keyframe of Object.values(keyframes)) {
                const wrapped_elements = {};
                for (const [element, content] of Object.entries(keyframe.elements)) {
                    wrapped_elements[element] = new oneLiner(content);
                }
                keyframe.elements = wrapped_elements;
            }
        });

        

        const vsAnimation : VS_Animation = {
            name: animation.name,
            code: animation.name.toLowerCase().replace(/ /g, ''),
            quantityframes: Math.round(animation.length * fps) + 1,
            onActivityStopped: "EaseOut",
            onAnimationEnd: animation.loop === 'loop' ? "Repeat" : "Hold",
            keyframes: Object.values(keyframes).sort((a, b) => a.frame - b.frame)
        };
        
        if (vsAnimation.quantityframes === 0 && vsAnimation.keyframes.length > 0) {
            const frame0 = vsAnimation.keyframes.find(kf => kf.frame === 0);
            if (frame0) {
                const frame1 = JSON.parse(JSON.stringify(frame0));
                frame1.frame = 1;
                vsAnimation.keyframes.push(frame1);
                vsAnimation.quantityframes = 1;
            }
        }

        if (vsAnimation.keyframes.length > 0) {
            animations.push(vsAnimation);
        }
    });

    return animations;
}