import { createBlockbenchMod } from "../util/moddingTools";
import * as PACKAGE from "../../package.json";
import { is_vs_project } from "../util";

/**
 * Patches the BoneAnimator to flip rotation and position application when a VS file is loaded
 */
createBlockbenchMod(
    `${PACKAGE.name}:bone_animator_mod`,
    {
        original: Blockbench.BoneAnimator.prototype.displayFrame,
        additional_function: Blockbench.BoneAnimator.prototype.flippedDisplayPosition
    },
    context => {
        // Inject code here
        Blockbench.BoneAnimator.prototype.displayFrame = function (this: BoneAnimator, multiplier = 1) {
            if (is_vs_project()) {
                if (!this.doRender()) return;
                this.getGroup();
                        //@ts-expect-error: Missing in type --- IGNORE ---
                Animator.MolangParser.context.animation = this.animation;

                const rotation = this.interpolate('rotation');
                const position = this.interpolate('position');

                //@ts-expect-error: Copied from blockbench itself, so it should work :P
                if (!this.muted.rotation) this.displayRotation(rotation, multiplier);

                if (!this.muted.position) {
                    this.flippedDisplayPosition(position, rotation, multiplier);

                }
                //@ts-expect-error: Copied from blockbench itself, so it should work :P
                if (!this.muted.scale) this.displayScale(this.interpolate('scale'), multiplier);
                return;
            }
            return context.original.call(this, multiplier);
        };

        Blockbench.BoneAnimator.prototype.flippedDisplayPosition = function (this: BoneAnimator, position, rotation, multiplier) {
            if (!rotation) {
                this.displayPosition(position, multiplier);
            } else {
                if (position) {
                    const vec = position
                        .V3_toThree()
                        .applyEuler(new THREE.Euler(
                            THREE.MathUtils.degToRad(rotation[0]),
                            THREE.MathUtils.degToRad(rotation[1]),
                            THREE.MathUtils.degToRad(rotation[2])
                            //@ts-expect-error: Missing in type --- IGNORE ---
                        ), Format.euler_order);
                    this.displayPosition(vec.toArray(), multiplier);
                }
            }
        };
        return context;
    },
    context => {
        Blockbench.BoneAnimator.prototype.flippedDisplayPosition = context.additional_function;
        Blockbench.BoneAnimator.prototype.displayFrame = context.original;
    }

);

