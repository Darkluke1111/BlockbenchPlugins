
/**
 * Patches the BoneAnimator to flip rotation and position application when a VS file is loaded
 */
module.exports = function () {
    // Modify the BoneAnimator to apply position offsets after rotation if a project with VS Format is active.
    BoneAnimator.prototype.displayFrame = function (multiplier = 1) {
        if (!this.doRender()) return;
        this.getGroup()
        Animator.MolangParser.context.animation = this.animation;

        const rotation = this.interpolate('rotation');
        const position = this.interpolate('position');

        if (!this.muted.rotation) this.displayRotation(rotation, multiplier)

        if (!this.muted.position) {
            if (Format.id == "formatVS") {
                this.flippedDisplayPosition(position, rotation, multiplier)
            } else {
                this.displayPosition(position, multiplier)
            }
        }

        if (!this.muted.scale) this.displayScale(this.interpolate('scale'), multiplier)
    }

    BoneAnimator.prototype.flippedDisplayPosition = function(position, rotation, multiplier) {
        if (!rotation) {
            this.displayPosition(position, multiplier)
        } else {
            if (position) {
                const vec = position
                    .V3_toThree()
                    .applyEuler(new THREE.Euler(
                        THREE.MathUtils.degToRad(rotation[0]),
                        THREE.MathUtils.degToRad(rotation[1]),
                        THREE.MathUtils.degToRad(rotation[2])
                    ), Format.euler_order);
                this.displayPosition(vec.toArray(), multiplier);
            }
        }
    }
}

