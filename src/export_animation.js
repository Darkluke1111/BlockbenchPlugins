const util = require("./util.js");

/**
 * Exports Blockbench animations to the Vintage Story animation format.
 * @returns {Array<object>} An array of VS animations.
 */
module.exports = function exportAnimations() {
    const animations = [];

    Animation.all.forEach(animation => {
        const keyframes = {};
        const fps = util.fps;
        const animators = Object.values(animation.animators || {});
        animators.forEach(animator => {
            if (animator.keyframes.length > 0 && animator.type === 'bone') {
                const bone_name = animator.name.replace('_group', '');

                animator.keyframes.forEach(kf => {
                    const frame = Math.round(kf.time * fps);
                    keyframes[frame] = keyframes[frame] || { frame, elements: {} };
                    keyframes[frame].elements[bone_name] = keyframes[frame].elements[bone_name] || {};

                    const dataPoint = kf.data_points[0];
                    switch (kf.channel) {
                        case 'rotation':
                            const rot = util.zyx_to_xyz([dataPoint.x, dataPoint.y, dataPoint.z]);
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
        });

        const vsAnimation = {
            name: animation.name,
            code: animation.name.toLowerCase().replace(/ /g, ''),
            quantityframes: Math.round(animation.length * fps),
            fps: fps,
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