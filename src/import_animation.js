const util = require("./util.js");

/**
 * Imports animations from the Vintage Story format into Blockbench.
 * @param {Array<object>} animations The array of animation data from the VS model file.
 */
module.exports = function importAnimations(animations) {
    const FPS = util.fps;
    const interpolationMode = "linear";

    animations.forEach(vsAnimation => {
        const animationLength = vsAnimation.quantityframes / FPS;
        const isLooping = vsAnimation.onAnimationEnd === 'Repeat';

        const animation = new Animation({
            name: vsAnimation.name,
            loop: isLooping ? 'loop' : 'once',
            length: animationLength,
            snapping: FPS
        }).add();

        vsAnimation.keyframes.forEach(vsKeyframe => {
            const time = vsKeyframe.frame / FPS;
            for (const boneName in vsKeyframe.elements) {
                const transform = vsKeyframe.elements[boneName];
                const bone = Group.all.find(g => g.name === boneName + '_group');

                if (bone) {
                    const animator = animation.getBoneAnimator(bone);

                    if (transform.rotationX != null || transform.rotationY != null || transform.rotationZ != null) {
                        const rotation = [transform.rotationX || 0, transform.rotationY || 0, transform.rotationZ || 0];
                        animator.addKeyframe({ interpolation: interpolationMode, time, channel: 'rotation', data_points: [{ x: rotation[0], y: rotation[1], z: rotation[2] }] });
                    }

                    if (transform.offsetX != null || transform.offsetY != null || transform.offsetZ != null) {
                        const position = [transform.offsetX || 0, transform.offsetY || 0, transform.offsetZ || 0];
                        animator.addKeyframe({ interpolation: interpolationMode, time, channel: 'position', data_points: [{ x: position[0] || 0, y: position[1] || 0, z: [position[2]] || 0 }] });
                    }

                    if (transform.scaleX != null || transform.scaleY != null || transform.scaleZ != null) {
                        animator.addKeyframe({ interpolation: interpolationMode, time, channel: 'scale', data_points: [{ x: transform.scaleX ?? 1, y: transform.scaleY ?? 1, z: transform.scaleZ ?? 1 }] });
                    }
                }
            }
        });

        if (isLooping) {
            for (const animatorUUID in animation.animators) {
                const animator = animation.animators[animatorUUID];
                for (const channel of ['rotation', 'position', 'scale']) {
                    const firstKeyframe = animator.keyframes.find(kf => kf.channel === channel && kf.time === 0);
                    if (firstKeyframe) {
                        const lastKeyframe = animator.addKeyframe(firstKeyframe.getUndoCopy(), true);
                        lastKeyframe.time = animationLength;
                    }
                }
            }
        }
    });
};