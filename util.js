/**
 * Get a random integer between `min` (inclusive) and `max` (exclusive).
 * @param {number} [min=0] - The minimum value (inclusive).
 * @param {number} [max=0] - The maximum value (exclusive).
 * @returns {number} A random integer.
 */
export function getRandomInt(min = 0, max = 0) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
* Get a random number between `min` (inclusive) and `max` (inclusive).
* Control the number of decimal places with `round`.
* @param {number} [min=0] - The minimum value (inclusive).
* @param {number} [max=0] - The maximum value (inclusive).
* @param {number} [round=14] - The number of decimal places to round to.
* @returns {number} A random float.
*/
export function getRandomFloat(min = 0, max = 0, round = 14) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(round));
}

/**
 * Convert degrees to radians.
 * @param {number} [degrees=0] - The angle in degrees.
 * @returns {number} The angle in radians.
 */
export function degRad(degrees = 0) {
    return degrees * Math.PI / 180;
}

/**
 * Checks if an angle is between two other angles.
 * @param {number} angle - The angle to check.
 * @param {number} arcStart - The starting angle.
 * @param {number} arcEnd - The ending angle.
 * @returns {boolean} True if `angle` is between `arcStart` and `arcEnd`.
 */
export function isAngleBetween(angle, arcStart, arcEnd) {
    if (arcStart < arcEnd) return arcStart <= angle && angle < arcEnd;
    return arcStart <= angle || angle < arcEnd;
}

/**
 * Calculates the average of an array's values.
 * @param {Array} [array=[]] - The array of values.
 * @returns {number} The average of the array's values.
 */
export function aveArray(array = []) {
    let sum = 0;
    for (const val of array) {
        if (val) sum += ((typeof val === 'number') ? val : 1);
    }
    return sum / array.length || 0;
}

/**
 * Calculate the largest font size that `text` can have without exceeding `maxWidth`.
 * @param {string} text - The text to measure.
 * @param {string} fontFamily - The font family to use.
 * @param {number} maxWidth - The maximum width the text should occupy.
 * @param {CanvasRenderingContext2D} canvasContext - The canvas context to use for measurement.
 * @returns {number} The largest font size that fits within the `maxWidth`.
 */
export function getFontSizeToFit(text, fontFamily, maxWidth, canvasContext) {
    canvasContext.save();
    canvasContext.font = `1px ${fontFamily}`;
    const w = canvasContext.measureText(text).width;
    canvasContext.restore();
    return maxWidth / w;
}

/**
 * Check if a point is inside a circle.
 * @param {Object} point - The point object with x, y coordinates.
 * @param {number} cx - The x-coordinate of the circle's center.
 * @param {number} cy - The y-coordinate of the circle's center.
 * @param {number} radius - The radius of the circle.
 * @returns {boolean} True if the point is inside the circle, false otherwise.
 */
export function isPointInCircle(point = { x: 0, y: 0 }, cx, cy, radius) {
    const distanceSquared = ((point.x - cx) ** 2) + ((point.y - cy) ** 2);
    return distanceSquared <= (radius ** 2);
}

/**
 * Translate the given point from the viewport's coordinate space to the element's coordinate space.
 * @param {Object} point - Point object containing x and y coordinates.
 * @param {HTMLElement} element - The HTML element to translate to.
 * @param {number} devicePixelRatio - The device pixel ratio.
 * @returns {Object} New point object translated to element's coordinate space.
 */
export function translateXYToElement(point = { x: 0, y: 0 }, element = {}, devicePixelRatio = 1) {
    const rect = element.getBoundingClientRect();
    return {
        x: (point.x - rect.left) * devicePixelRatio,
        y: (point.y - rect.top) * devicePixelRatio,
    };
}

/**
 * Get the mouse buttons pressed during an event.
 * @param {MouseEvent} event - The mouse event.
 * @returns {number[]} An array of pressed mouse button values.
 */
export function getMouseButtonsPressed(event = {}) {
    return [1, 2, 4, 8, 16].filter(i => event.buttons & i);
}

/**
 * Get the angle between two points.
 * @param {number} originX - The x-coordinate of the origin point.
 * @param {number} originY - The y-coordinate of the origin point.
 * @param {number} targetX - The x-coordinate of the target point.
 * @param {number} targetY - The y-coordinate of the target point.
 * @returns {number} Angle in degrees.
 */
export function getAngle(originX, originY, targetX, targetY) {
    const dx = originX - targetX;
    const dy = originY - targetY;

    let theta = Math.atan2(-dy, -dx);
    theta *= 180 / Math.PI;
    if (theta < 0) theta += 360;

    return theta;
}

/**
 * Calculate the distance between two points.
 * @param {Object} point1 - The first point with x, y coordinates.
 * @param {Object} point2 - The second point with x, y coordinates.
 * @returns {number} Distance between the points.
 */
export function getDistanceBetweenPoints(point1 = { x: 0, y: 0 }, point2 = { x: 0, y: 0 }) {
    return Math.hypot(point2.x - point1.x, point2.y - point1.y);
}

/**
 * Add two angles together.
 * @param {number} a - First angle in degrees.
 * @param {number} b - Second angle in degrees.
 * @returns {number} Sum of angles, normalized to [0, 360) range.
 */
export function addAngle(a = 0, b = 0) {
    const sum = a + b;
    let result;

    if (sum > 0) {
        result = sum % 360;
    } else {
        result = 360 + (sum % 360);
    }
    if (result === 360) result = 0;

    return result;
}

/**
 * Get the shortest difference in degrees between two angles.
 * @param {number} a - First angle in degrees.
 * @param {number} b - Second angle in degrees.
 * @returns {number} Shortest difference between the two angles.
 */
export function diffAngle(a = 0, b = 0) {
    const offsetFrom180 = 180 - b;
    const aWithOffset = addAngle(a, offsetFrom180);
    return 180 - aWithOffset;
}

/**
 * Calculate the new rotation of a wheel so that the relative angle `targetAngle` will be at 0 degrees.
 * @param {number} currentRotation - Current rotation angle of the wheel.
 * @param {number} targetAngle - Target relative angle.
 * @param {number} direction - 1 for clockwise, -1 for antiClockwise.
 * @returns {number} New rotation of the wheel.
 */
export function calcWheelRotationForTargetAngle(currentRotation = 0, targetAngle = 0, direction = 1) {

    let angle = ((currentRotation % 360) + targetAngle) % 360;

    // Ignore tiny values.
    // Due to floating point arithmetic, ocassionally the input angles won't add up exactly
    // and this can push the angle slightly above 360.
    angle = fixFloat(angle);

    // Apply direction:
    angle = ((direction === 1) ? (360 - angle) : 360 + angle) % 360;
    angle *= direction;

    return currentRotation + angle;
}

/**
 * Check if a value is an object.
 * @param {*} v - The value to check.
 * @returns {boolean} True if the value is an object, false otherwise.
 */
export function isObject(v) {
    return typeof v === 'object' && !Array.isArray(v) && v !== null;
}

/**
 * Check if a value is a number.
 * @param {*} n - The value to check.
 * @returns {boolean} True if the value is a number, false otherwise.
 */
export function isNumber(n) {
    return typeof n === 'number' && !Number.isNaN(n);
}

/**
 * Set a property with validation and default values.
 * @param {Object} params - Parameters object.
 * @param {*} params.val - The value to set.
 * @param {boolean} params.isValid - Whether the value is valid or not.
 * @param {string} params.errorMessage - Error message to throw if the value is invalid.
 * @param {*} params.defaultValue - Default value to set if the value is undefined.
 * @param {Function} [params.action] - Optional action to perform if the value is valid.
 * @returns {*} The value set or default value.
 * @throws {Error} If the value is invalid and not undefined.
 */
export function setProp({ val, isValid, errorMessage, defaultValue, action = null }) {
    if (isValid) {
        return (action) ? action() : val;
    } else if (val === undefined) {
        return defaultValue;
    }
    throw new Error(errorMessage);
}

/**
 * Check if an image has loaded.
 * @param {HTMLImageElement} image - The image element to check.
 * @returns {boolean} True if the image has loaded, false otherwise.
 */
export function isImageLoaded(image) {
    // We can detect a broken image (didn't load) by checking the natural width/height.
    return image && image.complete && image.naturalWidth !== 0 && image.naturalHeight !== 0;
}

/**
 * Fix floating-point numbers to a maximum of 9 decimal places.
 * @param {number} f - The floating-point number to fix.
 * @returns {number} The fixed number.
 */
export function fixFloat(f = 0) {
    return Number(f.toFixed(9));
}

/**
 * Easing function.
 * @param {number} n - A number for which to calculate the easing.
 * @returns {number} The eased value.
 */
export function easeSinOut(n) {
    return Math.sin((n * Math.PI) / 2);
}
