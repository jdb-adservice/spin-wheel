import * as util from './util.js';
import * as Constants from './constants.js';
import { Defaults } from './constants.js';
import * as events from './events.js';
import { Item } from './item.js';

export class Wheel {

    /**
     * Create the wheel inside a container Element and initialise it with props.
     * @param {Element} container - The container to create the wheel inside.
     * @param {Object} [props={}] - An optional object of properties to initialise the wheel with.
     */
    constructor(container, props = {}) {

        // Validate params.
        if (!(container instanceof Element)) throw new Error('container must be an instance of Element');
        if (!util.isObject(props) && props !== null) throw new Error('props must be an Object or null');

        // Init some things:
        this._frameRequestId = null;
        this._rotationSpeed = 0;
        this._rotationDirection = 1;
        this._spinToTimeEnd = null; // Used to animate the wheel for spinTo()
        this._lastSpinFrameTime = null; // Used to animate the wheel for spin()

        this.add(container);

        // Assign default values.
        // This avoids null exceptions when we initalise each property one-by-one in `init()`.
        for (const i of Object.keys(Defaults.wheel)) {
            this['_' + i] = Defaults.wheel[i];
        }

        if (props) {
            this.init(props);
        } else {
            this.init(Defaults.wheel);
        }

    }

    /**
    * Initialise all properties of the Wheel.
    * @param {Object} [props={}] - An optional object of properties to initialise the wheel with.
    */
    init(props = {}) {
        this._isInitialising = true;

        this.borderColor = props.borderColor;
        this.borderWidth = props.borderWidth;
        this.debug = props.debug;
        this.image = props.image;
        this.isInteractive = props.isInteractive;
        this.itemBackgroundColors = props.itemBackgroundColors;
        this.itemLabelAlign = props.itemLabelAlign;
        this.itemLabelBaselineOffset = props.itemLabelBaselineOffset;
        this.itemLabelColors = props.itemLabelColors;
        this.itemLabelFont = props.itemLabelFont;
        this.itemLabelFontSizeMax = props.itemLabelFontSizeMax;
        this.itemLabelRadius = props.itemLabelRadius;
        this.itemLabelRadiusMax = props.itemLabelRadiusMax;
        this.itemLabelRotation = props.itemLabelRotation;
        this.itemLabelStrokeColor = props.itemLabelStrokeColor;
        this.itemLabelStrokeWidth = props.itemLabelStrokeWidth;
        this.items = props.items;
        this.lineColor = props.lineColor;
        this.lineWidth = props.lineWidth;
        this.pixelRatio = props.pixelRatio;
        this.rotationSpeedMax = props.rotationSpeedMax;
        this.radius = props.radius;
        this.rotation = props.rotation;
        this.rotationResistance = props.rotationResistance;
        this.offset = props.offset;
        this.onCurrentIndexChange = props.onCurrentIndexChange;
        this.onRest = props.onRest;
        this.onSpin = props.onSpin;
        this.overlayImage = props.overlayImage;
        this.pointerAngle = props.pointerAngle;
    }

    /**
   * Adds the Wheel to the DOM and registers event handlers.
   * @param {Element} container - The container to add the wheel to.
   */
    add(container) {
        this._canvasContainer = container;
        this.canvas = document.createElement('canvas');
        this._context = this.canvas.getContext('2d');
        this._canvasContainer.append(this.canvas);
        events.register(this);
        if (this._isInitialising === false) this.resize(); // Initalise the canvas's dimensions (but not when called from the constructor).
    }

    /**
     * Removes the Wheel from the DOM and unregisters event handlers.
     */
    remove() {
        window.cancelAnimationFrame(this._frameRequestId);
        events.unregister(this);
        this._canvasContainer.removeChild(this.canvas);
        this._canvasContainer = null;
        this.canvas = null;
        this._context = null;
    }

    /**
     * Resize the wheel to fit inside it's container.
     * Call this after changing any property of the wheel that relates to it's size or position.
     */
    resize() {

        // Get the smallest dimension of `canvasContainer`:
        const [w, h] = [
            this._canvasContainer.clientWidth * this.getActualPixelRatio(),
            this._canvasContainer.clientHeight * this.getActualPixelRatio(),
        ];

        // Calc the size that the wheel needs to be to fit in it's container:
        const minSize = Math.min(w, h);
        const wheelSize = {
            w: minSize - (minSize * this.offset.w),
            h: minSize - (minSize * this.offset.h),
        };
        const scale = Math.min(w / wheelSize.w, h / wheelSize.h);
        this._size = Math.max(wheelSize.w * scale, wheelSize.h * scale);

        // Resize canvas element:
        this.canvas.style.width = this._canvasContainer.clientWidth + 'px';
        this.canvas.style.height = this._canvasContainer.clientHeight + 'px';
        this.canvas.width = w;
        this.canvas.height = h;

        // Re-calculate the center of the wheel:
        this._center = {
            x: w / 2 + (w * this.offset.w),
            y: h / 2 + (h * this.offset.h),
        };

        // Recalculate the wheel radius:
        this._actualRadius = (this._size / 2) * this.radius;

        // Adjust the font size of labels so they all fit inside `wheelRadius`:
        this.itemLabelFontSize = this.itemLabelFontSizeMax * (this._size / Constants.baseCanvasSize);
        this.labelMaxWidth = this._actualRadius * (this.itemLabelRadius - this.itemLabelRadiusMax);
        for (const item of this._items) {
            this.itemLabelFontSize = Math.min(this.itemLabelFontSize, util.getFontSizeToFit(item.label, this.itemLabelFont, this.labelMaxWidth, this._context));
        }

        this.refresh();

    }

    /**
   * Main animation loop.
   * @param {number} [now=0] - The current time.
   */
    draw(now = 0) {

        this._frameRequestId = null;

        const ctx = this._context;

        // Clear canvas.
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.animateRotation(now);

        const angles = this.getItemAngles(this._rotation);

        const actualBorderWidth = this.getScaledNumber(this._borderWidth);

        // Set font:
        ctx.textBaseline = 'middle';
        ctx.textAlign = this.itemLabelAlign;
        ctx.font = this.itemLabelFontSize + 'px ' + this.itemLabelFont;

        ctx.save();

        // Build paths:
        for (const [i, a] of angles.entries()) {

            const path = new Path2D();
            path.moveTo(this._center.x, this._center.y);
            path.arc(
                this._center.x,
                this._center.y,
                this._actualRadius - (actualBorderWidth / 2),
                util.degRad(a.start + Constants.arcAdjust),
                util.degRad(a.end + Constants.arcAdjust)
            );

            this._items[i].path = path;

        }

        this.drawItemBackgrounds(ctx, angles);
        this.drawItemImages(ctx, angles);
        this.drawItemLines(ctx, angles);
        this.drawItemLabels(ctx, angles);
        this.drawBorder(ctx);
        this.drawImage(ctx, this._image, false);
        this.drawImage(ctx, this._overlayImage, true);
        this.drawPointerLine(ctx);
        this.drawDragEvents(ctx);

        this._isInitialising = false;

    }

    /**
   * Draws the background of each item on the wheel.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @param {Array.<Object>} [angles=[]] - An array of angle objects to draw the backgrounds.
   */
    drawItemBackgrounds(ctx, angles = []) {

        for (const [i, a] of angles.entries()) {

            const item = this._items[i];

            ctx.fillStyle = item.backgroundColor ?? (
                // Fall back to a value from the repeating set:
                this._itemBackgroundColors[i % this._itemBackgroundColors.length]
            );

            ctx.fill(item.path);

        }

    }

    /**
   * Draws the images of each item on the wheel.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @param {Array.<Object>} [angles=[]] - An array of angle objects to draw the images.
   */
    drawItemImages(ctx, angles = []) {

        for (const [i, a] of angles.entries()) {

            const item = this._items[i];

            if (!util.isImageLoaded(item.image)) continue;

            ctx.save();

            ctx.clip(item.path);

            const angle = a.start + ((a.end - a.start) / 2);

            ctx.translate(
                this._center.x + Math.cos(util.degRad(angle + Constants.arcAdjust)) * (this._actualRadius * item.imageRadius),
                this._center.y + Math.sin(util.degRad(angle + Constants.arcAdjust)) * (this._actualRadius * item.imageRadius)
            );

            ctx.rotate(util.degRad(angle + item.imageRotation));

            ctx.globalAlpha = item.imageOpacity;

            const width = (this._size / 500) * item.image.width * item.imageScale;
            const height = (this._size / 500) * item.image.height * item.imageScale;
            const widthHalf = -width / 2;
            const heightHalf = -height / 2;

            ctx.drawImage(
                item.image,
                widthHalf,
                heightHalf,
                width,
                height
            );

            ctx.restore();

        }

    }

    /**
   * Draws an image on the wheel.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @param {HTMLImageElement} image - The image to draw.
   * @param {boolean} [isOverlay=false] - Whether the image is an overlay or not.
   */
    drawImage(ctx, image, isOverlay = false) {

        if (!util.isImageLoaded(image)) return;

        ctx.translate(
            this._center.x,
            this._center.y
        );

        if (!isOverlay) ctx.rotate(util.degRad(this._rotation));

        // Draw the image centered and scaled to fit the wheel's container:
        // For convenience, scale the 'normal' image to the size of the wheel radius
        // (so a change in the wheel radius won't require the image to also be updated).
        const size = isOverlay ? this._size : this._size * this.radius;
        const sizeHalf = -(size / 2);

        ctx.drawImage(
            image,
            sizeHalf,
            sizeHalf,
            size,
            size
        );

        ctx.resetTransform();

    }

    /**
   * Draws a pointer line for debugging.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   */
    drawPointerLine(ctx) {

        if (!this.debug) return;

        ctx.translate(
            this._center.x,
            this._center.y
        );

        ctx.rotate(util.degRad(this._pointerAngle + Constants.arcAdjust));

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this._actualRadius * 2, 0);

        ctx.strokeStyle = Constants.Debugging.pointerLineColor;
        ctx.lineWidth = this.getScaledNumber(2);
        ctx.stroke();

        ctx.resetTransform();

    }

    /**
   * Draws the border of the wheel.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   */
    drawBorder(ctx) {

        if (this._borderWidth <= 0) return;

        const actualBorderWidth = this.getScaledNumber(this._borderWidth);
        const actualBorderColor = this._borderColor || 'transparent';

        ctx.beginPath();
        ctx.strokeStyle = actualBorderColor;
        ctx.lineWidth = actualBorderWidth;
        ctx.arc(this._center.x, this._center.y, this._actualRadius - (actualBorderWidth / 2), 0, 2 * Math.PI);
        ctx.stroke();

        if (this.debug) {
            const actualDebugLineWidth = this.getScaledNumber(1);

            ctx.beginPath();
            ctx.strokeStyle = ctx.strokeStyle = Constants.Debugging.labelRadiusColor;
            ctx.lineWidth = actualDebugLineWidth;
            ctx.arc(this._center.x, this._center.y, this._actualRadius * this.itemLabelRadius, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.beginPath();
            ctx.strokeStyle = ctx.strokeStyle = Constants.Debugging.labelRadiusColor;
            ctx.lineWidth = actualDebugLineWidth;
            ctx.arc(this._center.x, this._center.y, this._actualRadius * this.itemLabelRadiusMax, 0, 2 * Math.PI);
            ctx.stroke();
        }

    }

    /**
   * Draws lines for each item.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @param {Array.<Object>} [angles=[]] - An array of angle objects.
   */
    drawItemLines(ctx, angles = []) {

        if (this._lineWidth <= 0) return;

        const actualLineWidth = this.getScaledNumber(this._lineWidth);
        const actualBorderWidth = this.getScaledNumber(this._borderWidth);

        ctx.translate(
            this._center.x,
            this._center.y
        );

        for (const angle of angles) {
            ctx.rotate(util.degRad(angle.start + Constants.arcAdjust));

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this._actualRadius - actualBorderWidth, 0);

            ctx.strokeStyle = this.lineColor;
            ctx.lineWidth = actualLineWidth;
            ctx.stroke();

            ctx.rotate(-util.degRad(angle.start + Constants.arcAdjust));
        }

        ctx.resetTransform();

    }

    /**
   * Draws labels for each item.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @param {Array.<Object>} [angles=[]] - An array of angle objects.
   */
    drawItemLabels(ctx, angles = []) {

        const actualItemLabelBaselineOffset = this.itemLabelFontSize * -this.itemLabelBaselineOffset;
        const actualDebugLineWidth = this.getScaledNumber(1);
        const actualLabelStrokeWidth = this.getScaledNumber(this._itemLabelStrokeWidth * 2);

        for (const [i, a] of angles.entries()) {

            const item = this._items[i];

            const actualLabelColor = item.labelColor
                || (this._itemLabelColors[i % this._itemLabelColors.length] // Fall back to a value from the repeating set.
                    || 'transparent'); // Handle empty string/undefined.

            if (item.label.trim() === '' || actualLabelColor === 'transparent') continue;

            ctx.save();

            ctx.clip(item.path);

            const angle = a.start + ((a.end - a.start) / 2);

            ctx.translate(
                this._center.x + Math.cos(util.degRad(angle + Constants.arcAdjust)) * (this._actualRadius * this.itemLabelRadius),
                this._center.y + Math.sin(util.degRad(angle + Constants.arcAdjust)) * (this._actualRadius * this.itemLabelRadius)
            );

            ctx.rotate(util.degRad(angle + Constants.arcAdjust));

            ctx.rotate(util.degRad(this.itemLabelRotation));

            if (this.debug) {
                // Draw the outline of the label:
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-this.labelMaxWidth, 0);

                ctx.strokeStyle = Constants.Debugging.labelOutlineColor;
                ctx.lineWidth = actualDebugLineWidth;
                ctx.stroke();

                ctx.strokeRect(0, -this.itemLabelFontSize / 2, -this.labelMaxWidth, this.itemLabelFontSize);
            }

            if (this._itemLabelStrokeWidth > 0) {
                ctx.lineWidth = actualLabelStrokeWidth;
                ctx.strokeStyle = this._itemLabelStrokeColor;
                ctx.lineJoin = 'round';
                ctx.strokeText(item.label, 0, actualItemLabelBaselineOffset);
            }

            ctx.fillStyle = actualLabelColor;
            ctx.fillText(item.label, 0, actualItemLabelBaselineOffset);

            ctx.restore();

        }

    }

    /**
   * Draws drag events for debugging.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   */
    drawDragEvents(ctx) {

        if (!this.debug || !this.dragEvents?.length) return;

        const dragEventsReversed = [...this.dragEvents].reverse();
        const actualLineWidth = this.getScaledNumber(0.5);
        const actualCircleDiameter = this.getScaledNumber(4);

        for (const [i, event] of dragEventsReversed.entries()) {
            const percent = (i / this.dragEvents.length) * 100;
            ctx.beginPath();
            ctx.arc(event.x, event.y, actualCircleDiameter, 0, 2 * Math.PI);
            ctx.fillStyle = `hsl(${Constants.Debugging.dragEventHue},100%,${percent}%)`;
            ctx.strokeStyle = '#000';
            ctx.lineWidth = actualLineWidth;
            ctx.fill();
            ctx.stroke();
        }

    }

    /**
   * Animate the rotation of the wheel.
   * @param {number} [now=0] - The current time.
   */
    animateRotation(now = 0) {

        // For spinTo()
        if (this._spinToTimeEnd !== null) {

            // Check if we should end the animation:
            if (now >= this._spinToTimeEnd) {
                this.rotation = this._spinToEndRotation;
                this._spinToTimeEnd = null;
                this.raiseEvent_onRest();
                return;
            }

            const duration = this._spinToTimeEnd - this._spinToTimeStart;
            let delta = (now - this._spinToTimeStart) / duration;
            delta = (delta < 0) ? 0 : delta; // Frame time may be before the start time.
            const distance = this._spinToEndRotation - this._spinToStartRotation;

            this.rotation = this._spinToStartRotation + distance * this._spinToEasingFunction(delta);

            this.refresh();

            return;

        }

        // For spin()
        if (this._lastSpinFrameTime !== null) {

            const delta = now - this._lastSpinFrameTime;

            if (delta > 0) {

                this.rotation += ((delta / 1000) * this._rotationSpeed) % 360; // TODO: very small rounding errors can accumulative here.
                this._rotationSpeed = this.getRotationSpeedPlusDrag(delta);

                // Check if we should end the animation:
                if (this._rotationSpeed === 0) {
                    this.raiseEvent_onRest();
                    this._lastSpinFrameTime = null;
                } else {
                    this._lastSpinFrameTime = now;
                }

            }

            this.refresh();

            return;

        }

    }

    /**
   * Returns the new rotation speed considering the drag.
   * @param {number} [delta=0] - The change in time.
   * @returns {number} - The new rotation speed.
   */
    getRotationSpeedPlusDrag(delta = 0) {

        // Simulate drag:
        const newRotationSpeed = this._rotationSpeed + ((this.rotationResistance * (delta / 1000)) * this._rotationDirection);

        // Stop rotation once speed reaches 0.
        // Otherwise the wheel could rotate in the opposite direction next frame.
        if ((this._rotationDirection === 1 && newRotationSpeed < 0) || (this._rotationDirection === -1 && newRotationSpeed >= 0)) {
            return 0;
        }

        return newRotationSpeed;

    }

    /**
   * Spins the wheel at a given speed. A positive speed spins the wheel clockwise, a negative speed spins it anti-clockwise.
   * @param {number} [rotationSpeed=0] - The speed at which to spin the wheel.
   * @throws {Error} Throws an error if the `rotationSpeed` is not a number.
   */
    spin(rotationSpeed = 0) {
        if (!util.isNumber(rotationSpeed)) throw new Error('rotationSpeed must be a number');
        this.dragEvents = [];
        this.beginSpin(rotationSpeed, 'spin');
    }

    /**
     * Spins the wheel to a specific rotation angle over a given duration.
     * @param {number} rotation - The rotation angle to spin to.
     * @param {number} duration - The duration in milliseconds over which to spin the wheel.
     * @param {function} [easingFunction=null] - The easing function to use for the animation.
     * @throws {Error} Throws an error if the `rotation` or `duration` is not a number.
     */
    spinTo(rotation = 0, duration = 0, easingFunction = null) {

        if (!util.isNumber(rotation)) throw new Error('Error: rotation must be a number');
        if (!util.isNumber(duration)) throw new Error('Error: duration must be a number');

        this.stop();

        this.dragEvents = [];

        this.animate(rotation, duration, easingFunction);

        this.raiseEvent_onSpin({ method: 'spinto', targetRotation: rotation, duration });

    }

    /**
     * Spins the wheel to land on a specific item.
     * @param {number} itemIndex - The index of the item to land on.
     * @param {number} duration - The duration in milliseconds over which to spin the wheel.
     * @param {boolean} spinToCenter - Whether to spin to the center of the item.
     * @param {number} numberOfRevolutions - The number of complete 360-degree revolutions before stopping.
     * @param {number} direction - The direction of spin (1 for clockwise, -1 for anti-clockwise).
     * @param {function} [easingFunction=null] - The easing function to use for the animation.
     */
    spinToItem(itemIndex = 0, duration = 0, spinToCenter = true, numberOfRevolutions = 1, direction = 1, easingFunction = null) {

        this.stop();

        this.dragEvents = [];

        const itemAngle = spinToCenter ? this.items[itemIndex].getCenterAngle() : this.items[itemIndex].getRandomAngle();

        let newRotation = util.calcWheelRotationForTargetAngle(this.rotation, itemAngle - this._pointerAngle, direction);
        newRotation += ((numberOfRevolutions * 360) * direction);

        this.animate(newRotation, duration, easingFunction);

        this.raiseEvent_onSpin({ method: 'spintoitem', targetItemIndex: itemIndex, targetRotation: newRotation, duration });

    }

    /**
 * Animate the wheel's rotation.
 * @private
 * @param {number} newRotation - The new rotation angle.
 * @param {number} duration - The duration in milliseconds for the animation.
 * @param {function} easingFunction - The easing function to use for the animation.
 */
    animate(newRotation, duration, easingFunction) {
        this._spinToStartRotation = this.rotation;
        this._spinToEndRotation = newRotation;
        this._spinToTimeStart = performance.now();
        this._spinToTimeEnd = this._spinToTimeStart + duration;
        this._spinToEasingFunction = easingFunction || util.easeSinOut;
        this.refresh();
    }

    /**
     * Immediately stop the wheel from spinning, regardless of which method was used to spin it.
     */
    stop() {

        // Stop the wheel if it was spun via `spinTo()`.
        this._spinToTimeEnd = null;

        // Stop the wheel if it was spun via `spin()`.
        this._rotationSpeed = 0;
        this._lastSpinFrameTime = null;

    }

    /**
  * Return the scaled value of a number according to the size of the canvas.
  * @param {number} n - The number to scale.
  * @returns {number} The scaled number.
  */
    getScaledNumber(n) {
        return (n / Constants.baseCanvasSize) * this._size;
    }

    /**
 * Retrieve the actual pixel ratio.
 * @returns {number} The actual pixel ratio.
 */
    getActualPixelRatio() {
        return (this._pixelRatio !== 0) ? this._pixelRatio : window.devicePixelRatio;
    }

    /**
  * Check if a given point is within the wheel.
  * @param {object} point - The point to check, represented as an object with x and y coordinates.
  * @returns {boolean} True if the point is within the wheel, false otherwise.
  */
    wheelHitTest(point = { x: 0, y: 0 }) {
        const p = util.translateXYToElement(point, this.canvas, this.getActualPixelRatio());
        return util.isPointInCircle(p, this._center.x, this._center.y, this._actualRadius);
    }

    /**
  * Update the cursor based on the wheel's state.
  */
    refreshCursor() {

        if (this.isInteractive) {

            if (this.isDragging) {
                this.canvas.style.cursor = 'grabbing';
                return;
            }

            if (this.isCursorOverWheel) {
                this.canvas.style.cursor = 'grab';
                return;
            }

        }

        this.canvas.style.cursor = '';

    }

    /**
 * Get the angle (in degrees) of a given point from the center of the wheel.
 * @param {object} point - The point to check, represented as an object with x and y coordinates.
 * @returns {number} The angle in degrees.
 */
    getAngleFromCenter(point = { x: 0, y: 0 }) {
        return (util.getAngle(this._center.x, this._center.y, point.x, point.y) + 90) % 360;
    }

    /**
 * Retrieve the index of the current item the Pointer is pointing at.
 * @returns {number} The current index.
 */
    getCurrentIndex() {
        return this._currentIndex;
    }

    /**
 * Update the current item index based on the wheel's angles.
 * @param {Array} angles - An array of angle objects.
 */
    refreshCurrentIndex(angles = []) {
        if (this._items.length === 0) this._currentIndex = -1;

        for (const [i, a] of angles.entries()) {

            if (!util.isAngleBetween(this._pointerAngle, a.start % 360, a.end % 360)) continue;

            if (this._currentIndex === i) break;

            this._currentIndex = i;

            if (!this._isInitialising) this.raiseEvent_onCurrentIndexChange();

            break;

        }
    }

    /**
 * Get the start and end angles for each item on the wheel.
 * @param {number} initialRotation - The initial rotation angle of the wheel.
 * @returns {Array} An array of objects containing the start and end angles for each item.
 */
    getItemAngles(initialRotation = 0) {

        let weightSum = 0;
        for (const i of this.items) {
            weightSum += i.weight;
        }
        const weightedItemAngle = 360 / weightSum;

        let itemAngle;
        let lastItemAngle = initialRotation;
        const angles = [];

        for (const item of this._items) {
            itemAngle = item.weight * weightedItemAngle;
            angles.push({
                start: lastItemAngle,
                end: lastItemAngle + itemAngle,
            });
            lastItemAngle += itemAngle;
        }

        // Ensure the difference between last angle.end and first angle.start is exactly 360 degrees.
        // Sometimes floating point arithmetic pushes the end value past 360 degrees by
        // a very small amount, which causes issues when calculating `currentIndex`.
        if (this._items.length > 1) {
            angles[angles.length - 1].end = angles[0].start + 360;
        }

        return angles;

    }

    /**
 * Schedule a redraw of the wheel.
 */
    refresh() {
        if (this._frameRequestId === null) {
            this._frameRequestId = window.requestAnimationFrame(t => this.draw(t));
        }
    }

    /**
 * Limit the wheel's speed to a maximum value.
 * @param {number} speed - The desired speed.
 * @param {number} max - The maximum allowable speed.
 * @returns {number} The limited speed.
 */
    limitSpeed(speed = 0, max = 0) {
        // Max is always a positive number, but speed may be positive or negative.
        const newSpeed = Math.min(speed, max);
        return Math.max(newSpeed, -max);
    }

    /**
 * Begin spinning the wheel.
 * @param {number} speed - The speed at which to spin the wheel.
 * @param {string} spinMethod - The method used for spinning.
 */
    beginSpin(speed = 0, spinMethod = '') {
        this.stop();

        this._rotationSpeed = this.limitSpeed(speed, this._rotationSpeedMax);
        this._lastSpinFrameTime = performance.now();

        this._rotationDirection = (this._rotationSpeed >= 0) ? 1 : -1; // 1 for clockwise or stationary, -1 for anticlockwise.

        if (this._rotationSpeed !== 0) {
            this.raiseEvent_onSpin({
                method: spinMethod,
                rotationSpeed: this._rotationSpeed,
                rotationResistance: this._rotationResistance,
            });
        }

        this.refresh();
    }

    refreshAriaLabel() {
        // See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/img_role
        this.canvas.setAttribute('role', 'img');
        const wheelDescription = (this.items.length >= 2) ? ` The wheel has ${this.items.length} slices.` : '';
        this.canvas.setAttribute('aria-label', 'An image of a spinning prize wheel.' + wheelDescription);
    }

    /**
    * Gets the color of the line around the circumference of the wheel.
    * @returns {string} The border color of the wheel.
    */
    get borderColor() {
        return this._borderColor;
    }
    /**
     * Sets the color of the line around the circumference of the wheel.
     * @param {string} val - The new border color.
     */
    set borderColor(val) {
        this._borderColor = util.setProp({
            val,
            isValid: typeof val === 'string',
            errorMessage: 'Wheel.borderColor must be a string',
            defaultValue: Defaults.wheel.borderColor,
        });

        this.refresh();
    }

    /**
    * Gets the width of the line around the circumference of the wheel.
    * @returns {number} The border width in pixels.
    */
    get borderWidth() {
        return this._borderWidth;
    }
    /**
     * Sets the width of the line around the circumference of the wheel.
     * @param {number} val - The new border width in pixels.
     */
    set borderWidth(val) {
        this._borderWidth = util.setProp({
            val,
            isValid: util.isNumber(val),
            errorMessage: 'Wheel.borderWidth must be a number',
            defaultValue: Defaults.wheel.borderWidth,
        });

        this.refresh();
    }

    /**
     * Gets whether debugging info is shown or not.
     * @returns {boolean} True if debugging info is shown; otherwise, false.
     */
    get debug() {
        return this._debug;
    }
    /**
     * Sets whether to show debugging info or not.
     * @param {boolean} val - True to show debugging info; otherwise, false.
     */
    set debug(val) {
        this._debug = util.setProp({
            val,
            isValid: typeof val === 'boolean',
            errorMessage: 'Wheel.debug must be a boolean',
            defaultValue: Defaults.wheel.debug,
        });

        this.refresh();
    }

    /**
      * Gets the URL of the image that is drawn over the center of the wheel.
      * @returns {string|null} The URL of the image; null if not set.
      */
    get image() {
        return this._image?.src ?? null;
    }
    /**
    * Sets the URL of an image to be drawn over the center of the wheel.
    * @param {string|null} val - The URL of the image or null to unset.
    */
    set image(val) {
        this._image = util.setProp({
            val,
            isValid: typeof val === 'string' || val === null,
            errorMessage: 'Wheel.image must be a url (string) or null',
            defaultValue: Defaults.wheel.image,
            action: () => {
                if (val === null) return null;
                const v = new Image();
                v.src = val;
                v.onload = e => this.refresh();
                return v;
            },
        });

        this.refresh();
    }

    /**
      * Gets whether the wheel is interactive or not.
      * @returns {boolean} True if the wheel is interactive; otherwise, false.
      */
    get isInteractive() {
        return this._isInteractive;
    }
    /**
     * Sets whether the wheel should be interactive or not.
     * @param {boolean} val - True to make the wheel interactive; otherwise, false.
     */
    set isInteractive(val) {
        this._isInteractive = util.setProp({
            val,
            isValid: typeof val === 'boolean',
            errorMessage: 'Wheel.isInteractive must be a boolean',
            defaultValue: Defaults.wheel.isInteractive,
        });

        this.refreshCursor(); // Reset the cursor in case the wheel is currently being dragged.
    }

    /**
      * Gets the repeating pattern of background colors for all items.
      * @returns {Array<string>} An array of colors.
      */
    get itemBackgroundColors() {
        return this._itemBackgroundColors;
    }
    /**
     * Sets the repeating pattern of background colors for all items.
     * @param {Array<string>} val - An array of colors.
     */
    set itemBackgroundColors(val) {
        this._itemBackgroundColors = util.setProp({
            val,
            isValid: Array.isArray(val),
            errorMessage: 'Wheel.itemBackgroundColors must be an array',
            defaultValue: Defaults.wheel.itemBackgroundColors,
        });

        this.refresh();
    }

    /**
     * Gets the alignment of all item labels.
     * @returns {string} The alignment ('left', 'center', 'right').
     */
    get itemLabelAlign() {
        return this._itemLabelAlign;
    }
    /**
     * Sets the alignment of all item labels.
     * @param {string} val - The alignment ('left', 'center', 'right').
     */
    set itemLabelAlign(val) {
        this._itemLabelAlign = util.setProp({
            val,
            isValid: typeof val === 'string',
            errorMessage: 'Wheel.itemLabelAlign must be a string',
            defaultValue: Defaults.wheel.itemLabelAlign,
        });

        this.refresh();
    }

    /**
     * Gets the baseline offset of the item labels.
     * @returns {number} The offset as a percentage of the label's height.
     */
    get itemLabelBaselineOffset() {
        return this._itemLabelBaselineOffset;
    }
    /**
     * Sets the baseline offset of the item labels.
     * @param {number} val - The offset as a percentage of the label's height.
     */
    set itemLabelBaselineOffset(val) {
        this._itemLabelBaselineOffset = util.setProp({
            val,
            isValid: util.isNumber(val),
            errorMessage: 'Wheel.itemLabelBaselineOffset must be a number',
            defaultValue: Defaults.wheel.itemLabelBaselineOffset,
        });

        this.resize();
    }

    /**
    * Gets the repeating pattern of colors for all item labels.
    * @returns {Array<string>} An array of colors.
    */
    get itemLabelColors() {
        return this._itemLabelColors;
    }
    /**
   * Sets the repeating pattern of colors for all item labels.
   * @param {Array<string>} val - An array of colors.
   */
    set itemLabelColors(val) {
        this._itemLabelColors = util.setProp({
            val,
            isValid: Array.isArray(val),
            errorMessage: 'Wheel.itemLabelColors must be an array',
            defaultValue: Defaults.wheel.itemLabelColors,
        });

        this.refresh();
    }

    /**
     * Gets the font family for all item labels.
     * @returns {string} The font family.
     */
    get itemLabelFont() {
        return this._itemLabelFont;
    }
    /**
     * Sets the font family for all item labels.
     * @param {string} val - The new font family.
     */
    set itemLabelFont(val) {
        this._itemLabelFont = util.setProp({
            val,
            isValid: typeof val === 'string',
            errorMessage: 'Wheel.itemLabelFont must be a string',
            defaultValue: Defaults.wheel.itemLabelFont,
        });

        this.resize();
    }

    /**
     * Gets the maximum font size for all item labels.
     * @returns {number} The maximum font size in pixels.
     */
    get itemLabelFontSizeMax() {
        return this._itemLabelFontSizeMax;
    }
    /**
     * Sets the maximum font size for all item labels.
     * @param {number} val - The new maximum font size in pixels.
     */
    set itemLabelFontSizeMax(val) {
        this._itemLabelFontSizeMax = util.setProp({
            val,
            isValid: util.isNumber(val),
            errorMessage: 'Wheel.itemLabelFontSizeMax must be a number',
            defaultValue: Defaults.wheel.itemLabelFontSizeMax,
        });

        this.resize();
    }

    /**
       * Gets the point along the radius to start drawing all item labels.
       * @returns {number} The point as a percentage starting from the center of the wheel.
       */
    get itemLabelRadius() {
        return this._itemLabelRadius;
    }
    /**
     * Sets the point along the radius to start drawing all item labels.
     * @param {number} val - The point as a percentage starting from the center of the wheel.
     */
    set itemLabelRadius(val) {
        this._itemLabelRadius = util.setProp({
            val,
            isValid: util.isNumber(val),
            errorMessage: 'Wheel.itemLabelRadius must be a number',
            defaultValue: Defaults.wheel.itemLabelRadius,
        });

        this.resize();
    }

    /**
     * Gets the point along the radius for calculating the maximum font size for item labels.
     * @returns {number} The point along the radius.
     */
    get itemLabelRadiusMax() {
        return this._itemLabelRadiusMax;
    }
    /**
     * Sets the point along the radius for calculating the maximum font size for item labels.
     * @param {number} val - The point along the radius.
     */
    set itemLabelRadiusMax(val) {
        this._itemLabelRadiusMax = util.setProp({
            val,
            isValid: util.isNumber(val),
            errorMessage: 'Wheel.itemLabelRadiusMax must be a number',
            defaultValue: Defaults.wheel.itemLabelRadiusMax,
        });

        this.resize();
    }

    /**
     * Gets the rotation angle of all item labels.
     * @returns {number} The rotation angle in degrees.
     */
    get itemLabelRotation() {
        return this._itemLabelRotation;
    }
    /**
     * Sets the rotation angle of all item labels.
     * @param {number} val - The rotation angle in degrees.
     */
    set itemLabelRotation(val) {
        this._itemLabelRotation = util.setProp({
            val,
            isValid: util.isNumber(val),
            errorMessage: 'Wheel.itemLabelRotation must be a number',
            defaultValue: Defaults.wheel.itemLabelRotation,
        });

        this.refresh();
    }

    /**
     * Gets the color of the stroke applied to the outside of label text.
     * @returns {string} The color of the stroke.
     */
    get itemLabelStrokeColor() {
        return this._itemLabelStrokeColor;
    }
    /**
    * Sets the color of the stroke applied to the outside of label text.
    * @param {string} val - The color of the stroke.
    */
    set itemLabelStrokeColor(val) {
        this._itemLabelStrokeColor = util.setProp({
            val,
            isValid: typeof val === 'string',
            errorMessage: 'Wheel.itemLabelStrokeColor must be a string',
            defaultValue: Defaults.wheel.itemLabelStrokeColor,
        });

        this.refresh();
    }

    /**
     * Gets the width of the stroke applied to the outside of label text.
     * @returns {number} The width of the stroke.
     */
    get itemLabelStrokeWidth() {
        return this._itemLabelStrokeWidth;
    }
    /**
     * Sets the width of the stroke applied to the outside of label text.
     * @param {number} val - The width of the stroke.
     */
    set itemLabelStrokeWidth(val) {
        this._itemLabelStrokeWidth = util.setProp({
            val,
            isValid: util.isNumber(val),
            errorMessage: 'Wheel.itemLabelStrokeWidth must be a number',
            defaultValue: Defaults.wheel.itemLabelStrokeWidth,
        });

        this.refresh();
    }

    /**
     * Get the items to show on the wheel.
     * @return {Array} The items on the wheel.
     */
    get items() {
        return this._items;
    }
    /**
     * Set the items to show on the wheel.
     * @param {Array} val - The new items.
     */
    set items(val) {
        this._items = util.setProp({
            val,
            isValid: Array.isArray(val),
            errorMessage: 'Wheel.items must be an array of Items',
            defaultValue: Defaults.wheel.items,
            action: () => {
                const v = [];
                for (const item of val) {
                    v.push(new Item(this, {
                        backgroundColor: item.backgroundColor,
                        image: item.image,
                        imageRadius: item.imageRadius,
                        imageRotation: item.imageRotation,
                        imageScale: item.imageScale,
                        label: item.label,
                        labelColor: item.labelColor,
                        value: item.value,
                        weight: item.weight,
                    }));
                }
                return v;
            },
        });

        this.refreshAriaLabel();
        this.refreshCurrentIndex(this.getItemAngles(this._rotation));
        this.resize(); // Refresh item label font size.
    }

    /**
     * Get the color of the lines between the items.
     * @return {string} The line color.
     */
    get lineColor() {
        return this._lineColor;
    }
    /**
     * Set the color of the lines between the items.
     * @param {string} val - The new line color.
     */
    set lineColor(val) {
        this._lineColor = util.setProp({
            val,
            isValid: typeof val === 'string',
            errorMessage: 'Wheel.lineColor must be a string',
            defaultValue: Defaults.wheel.lineColor,
        });

        this.refresh();
    }

    /**
     * Get the width of the lines between the items in pixels.
     * @return {number} The line width.
     */
    get lineWidth() {
        return this._lineWidth;
    }
    /**
     * Set the width of the lines between the items in pixels.
     * @param {number} val - The new line width.
     */
    set lineWidth(val) {
        this._lineWidth = util.setProp({
            val,
            isValid: util.isNumber(val),
            errorMessage: 'Wheel.lineWidth must be a number',
            defaultValue: Defaults.wheel.lineWidth,
        });

        this.refresh();
    }

    /**
     * Get the offset of the wheel relative to its center.
     * @return {Object} The offset.
     */
    get offset() {
        return this._offset;
    }
    /**
     * Set the offset of the wheel relative to its center.
     * @param {Object} val - The new offset.
     */
    set offset(val) {
        this._offset = util.setProp({
            val,
            isValid: util.isObject(val),
            errorMessage: 'Wheel.offset must be an object',
            defaultValue: Defaults.wheel.offset,
        });

        this.resize();
    }

    /**
     * Get the callback for the `onCurrentIndexChange` event.
     * @return {Function|null} The callback function.
     */
    get onCurrentIndexChange() {
        return this._onCurrentIndexChange;
    }
    /**
     * Set the callback for the `onCurrentIndexChange` event.
     * @param {Function|null} val - The new callback function.
     */
    set onCurrentIndexChange(val) {
        this._onCurrentIndexChange = util.setProp({
            val,
            isValid: typeof val === 'function' || val === null,
            errorMessage: 'Wheel.onCurrentIndexChange must be a function or null',
            defaultValue: Defaults.wheel.onCurrentIndexChange,
        });
    }

    /**
     * @description Gets the callback for the `onRest` event.
     * @returns {Function|null} The callback function or null.
     */
    get onRest() {
        return this._onRest;
    }
    /**
     * @description Sets the callback for the `onRest` event.
     * @param {Function|null} val - The callback function or null.
     * @throws Will throw an error if the provided value is not a function or null.
     */
    set onRest(val) {
        this._onRest = util.setProp({
            val,
            isValid: typeof val === 'function' || val === null,
            errorMessage: 'Wheel.onRest must be a function or null',
            defaultValue: Defaults.wheel.onRest,
        });
    }

    /**
     * @description Gets the callback for the `onSpin` event.
     * @returns {Function|null} The callback function or null.
     */
    get onSpin() {
        return this._onSpin;
    }
    /**
     * @description Sets the callback for the `onSpin` event.
     * @param {Function|null} val - The callback function or null.
     * @throws Will throw an error if the provided value is not a function or null.
     */
    set onSpin(val) {
        this._onSpin = util.setProp({
            val,
            isValid: typeof val === 'function' || val === null,
            errorMessage: 'Wheel.onSpin must be a function or null',
            defaultValue: Defaults.wheel.onSpin,
        });
    }

    /**
     * @description Gets the URL of the overlay image.
     * @returns {string|null} The URL of the overlay image or null.
     */
    get overlayImage() {
        return this._overlayImage?.src ?? null;
    }
    /**
     * @description Sets the URL of the overlay image.
     * @param {string|null} val - The URL of the overlay image or null.
     * @throws Will throw an error if the provided value is not a string or null.
     */
    set overlayImage(val) {
        this._overlayImage = util.setProp({
            val,
            isValid: typeof val === 'string' || val === null,
            errorMessage: 'Wheel.overlayImage must be a url (string) or null',
            defaultValue: Defaults.wheel.overlayImage,
            action: () => {
                if (val === null) return null;
                const v = new Image();
                v.src = val;
                v.onload = e => this.refresh();
                return v;
            },
        });

        this.refresh();
    }

    /**
     * @description Gets the pixel ratio.
     * @returns {number} The pixel ratio.
     */
    get pixelRatio() {
        return this._pixelRatio;
    }
    /**
    * @description Sets the pixel ratio.
    * @param {number} val - The pixel ratio.
    * @throws Will throw an error if the provided value is not a number.
    */
    set pixelRatio(val) {
        this._pixelRatio = util.setProp({
            val,
            isValid: util.isNumber(val),
            errorMessage: 'Wheel.pixelRatio must be a number',
            defaultValue: Defaults.wheel.pixelRatio,
        });
        this.dragEvents = [];
        this.resize();
    }

    /**
      * @description Gets the pointer angle.
      * @returns {number} The pointer angle.
      */
    get pointerAngle() {
        return this._pointerAngle;
    }
    /**
     * @description Sets the pointer angle.
     * @param {number} val - The pointer angle.
     * @throws Will throw an error if the provided value is not a number between 0 and 360.
     */
    set pointerAngle(val) {
        this._pointerAngle = util.setProp({
            val,
            isValid: util.isNumber(val) && val >= 0,
            errorMessage: 'Wheel.pointerAngle must be a number between 0 and 360',
            defaultValue: Defaults.wheel.pointerAngle,
            action: () => val % 360,
        });

        if (this.debug) this.refresh();
    }

    /**
    * @description Gets the radius of the wheel.
    * @returns {number} The radius.
    */
    get radius() {
        return this._radius;
    }
    /**
    * @description Sets the radius of the wheel.
    * @param {number} val - The radius.
    * @throws Will throw an error if the provided value is not a number.
    */
    set radius(val) {
        this._radius = util.setProp({
            val,
            isValid: util.isNumber(val),
            errorMessage: 'Wheel.radius must be a number',
            defaultValue: Defaults.wheel.radius,
        });

        this.resize();
    }

    /**
     * @description Gets the rotation angle of the wheel.
     * @returns {number} The rotation angle.
     */
    get rotation() {
        return this._rotation;
    }
    /**
     * @description Sets the rotation angle of the wheel.
     * @param {number} val - The rotation angle.
     * @throws Will throw an error if the provided value is not a number.
     */
    set rotation(val) {
        this._rotation = util.setProp({
            val,
            isValid: util.isNumber(val),
            errorMessage: 'Wheel.rotation must be a number',
            defaultValue: Defaults.wheel.rotation,
        });

        this.refreshCurrentIndex(this.getItemAngles(this._rotation));
        this.refresh();
    }

    /**
     * @description Gets the rotation resistance.
     * @returns {number} The rotation resistance.
     */
    get rotationResistance() {
        return this._rotationResistance;
    }
    /**
     * @description Sets the rotation resistance.
     * @param {number} val - The rotation resistance.
     * @throws Will throw an error if the provided value is not a number.
     */
    set rotationResistance(val) {
        this._rotationResistance = util.setProp({
            val,
            isValid: util.isNumber(val),
            errorMessage: 'Wheel.rotationResistance must be a number',
            defaultValue: Defaults.wheel.rotationResistance,
        });
    }

    /**
     * @description Gets the rotation speed. Read-only property.
     * @returns {number} The rotation speed.
     */
    get rotationSpeed() {
        return this._rotationSpeed;
    }

    /**
    * Get the maximum value for `rotationSpeed`.
    * @return {number} The maximum rotation speed.
    */
    get rotationSpeedMax() {
        return this._rotationSpeedMax;
    }
    /**
     * Set the maximum value for `rotationSpeed`.
     * @param {number} val - The new maximum rotation speed.
     */
    set rotationSpeedMax(val) {
        this._rotationSpeedMax = util.setProp({
            val,
            isValid: util.isNumber(val) && val >= 0,
            errorMessage: 'Wheel.rotationSpeedMax must be a number >= 0',
            defaultValue: Defaults.wheel.rotationSpeedMax,
        });
    }

    /**
     * @description Enter the drag state.
     * @param {Object} [point={ x: 0, y: 0 }] - The initial drag point.
     */
    dragStart(point = { x: 0, y: 0 }) {

        const p = util.translateXYToElement(point, this.canvas, this.getActualPixelRatio());

        this.isDragging = true;

        this.stop(); // Interrupt `spinTo()`

        this.dragEvents = [{
            distance: 0,
            x: p.x,
            y: p.y,
            now: performance.now(),
        }];

        this.refreshCursor();

    }

    /**
     * @description Move during the drag state.
     * @param {Object} [point={ x: 0, y: 0 }] - The drag point during movement.
     */
    dragMove(point = { x: 0, y: 0 }) {

        const p = util.translateXYToElement(point, this.canvas, this.getActualPixelRatio());
        const a = this.getAngleFromCenter(p);

        const lastDragPoint = this.dragEvents[0];
        const lastAngle = this.getAngleFromCenter(lastDragPoint);
        const angleSinceLastMove = util.diffAngle(lastAngle, a);

        this.dragEvents.unshift({
            distance: angleSinceLastMove,
            x: p.x,
            y: p.y,
            now: performance.now(),
        });

        // Retain max 40 drag events.
        if (this.debug && this.dragEvents.length >= 40) this.dragEvents.pop();

        // Snap the wheel to the new rotation.
        this.rotation += angleSinceLastMove; // TODO: can we apply easing here so it looks nicer?

    }

    /**
     * @description Exit the drag state and set the rotation speed.
     */
    dragEnd() {

        this.isDragging = false;

        // Calc the drag distance:
        let dragDistance = 0;
        const now = performance.now();

        for (const [i, event] of this.dragEvents.entries()) {

            if (!this.isDragEventTooOld(now, event)) {
                dragDistance += event.distance;
                continue;
            }

            // Exclude old events:
            this.dragEvents.length = i;
            if (this.debug) this.refresh(); // Redraw drag events after trimming the array.
            break;

        }

        this.refreshCursor();

        if (dragDistance === 0) return;

        this.beginSpin(dragDistance * (1000 / Constants.dragCapturePeriod), 'interact');

    }

    /**
    * @description Check if a drag event is too old to be considered.
    * @param {number} [now=0] - The current time in milliseconds.
    * @param {Object} [event={}] - The drag event to check.
    * @returns {boolean} Whether the event is too old.
    */
    isDragEventTooOld(now = 0, event = {}) {
        return (now - event.now) > Constants.dragCapturePeriod;
    }

    /**
 * @description Raise an event when the current index changes.
 * @param {Object} [data={}] - Additional data to include in the event.
 */
    raiseEvent_onCurrentIndexChange(data = {}) {
        this.onCurrentIndexChange?.({
            type: 'currentIndexChange',
            currentIndex: this._currentIndex,
            ...data,
        });
    }

    /**
    * @description Raise an event when the wheel comes to a rest.
    * @param {Object} [data={}] - Additional data to include in the event.
    */
    raiseEvent_onRest(data = {}) {
        this.onRest?.({
            type: 'rest',
            currentIndex: this._currentIndex,
            rotation: this._rotation,
            ...data,
        });
    }

    /**
   * @description Raise an event when the wheel starts to spin.
   * @param {Object} [data={}] - Additional data to include in the event.
   */
    raiseEvent_onSpin(data = {}) {
        this.onSpin?.({
            type: 'spin',
            ...data,
        });
    }

}
