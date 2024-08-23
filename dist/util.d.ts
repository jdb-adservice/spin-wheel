/**
 * Get a random integer between `min` (inclusive) and `max` (exclusive).
 */
export declare function getRandomInt(min?: number, max?: number): number;
/**
 * Get a random number between `min` (inclusive) and `max` (inclusive).
 * Control the number of decimal places with `round`.
 */
export declare function getRandomFloat(min?: number, max?: number, round?: number): number;
/**
 * Convert degrees to radians.
 */
export declare function degRad(degrees?: number): number;
/**
 * Return true if `angle` is between `arcStart` (inclusive) and `arcEnd` (exclusive).
 * Example: `(0, 359, 1) == true`
 * Example: `(0, 1, 2) == false`
 */
export declare function isAngleBetween(angle: number, arcStart: number, arcEnd: number): boolean;
/**
 * Average the values in `array`.
 * Only operate on truthy values.
 * Truthy values that are not Numbers count as 1.
 * Return 0 if the array is empty.
 */
export declare function aveArray(array?: never[]): number;
/**
 * Calculate the largest font size that `text` can have without exceeding `maxWidth`.
 * Won't work unless `fontFamily` has been loaded.
 */
export declare function getFontSizeToFit(text: string, fontFamily: string, maxWidth: number, canvasContext: CanvasRenderingContext2D): number;
/**
 * Return true if the given point is inside a circle.
 * cx, cy is circle center.
 * radius is circle radius.
 */
export declare function isPointInCircle(point: {
    x: number;
    y: number;
} | undefined, cx: number, cy: number, radius: number): boolean;
/**
 * Translate the given point from the viewport's coordinate space to the element's coordinate space.
 */
export declare function translateXYToElement(point: {
    x: number;
    y: number;
} | undefined, element: HTMLCanvasElement, devicePixelRatio?: number): {
    x: number;
    y: number;
};
export declare function getMouseButtonsPressed(event: {
    buttons: number;
}): number[];
/**
 * Source: https://stackoverflow.com/a/47653643/737393
 */
export declare function getAngle(originX: number, originY: number, targetX: number, targetY: number): number;
/**
 * Return the distance between two points.
 */
export declare function getDistanceBetweenPoints(point1?: {
    x: number;
    y: number;
}, point2?: {
    x: number;
    y: number;
}): number;
/**
 * Add two angles together.
 * Return a positive number between 0 and 359.9999.
 */
export declare function addAngle(a?: number, b?: number): number;
/**
 * Return the shortest difference (in degrees) between two angles.
 * Only accept angles between 0 and 360.
 */
export declare function diffAngle(a?: number, b?: number): number;
/**
 * Calculate what the new rotation of a wheel should be, so that the relative angle `targetAngle` will be at 0 degrees (north).
 * targetAngle = a value between 0 and 360.
 * direction = the direction the wheel can spin. 1 for clockwise, -1 for antiClockwise.
 */
export declare function calcWheelRotationForTargetAngle(currentRotation?: number, targetAngle?: number, direction?: number): number;
export declare function isObject(v: unknown): boolean;
export declare function isNumber(n: unknown): boolean;
export declare function setProp<T>({ val, isValid, errorMessage, defaultValue, action, }: {
    val: T | undefined;
    isValid: boolean;
    errorMessage: string;
    defaultValue: T;
    action?: () => T;
}): T;
/**
 * Return true if image has loaded.
 */
export declare function isImageLoaded(image: HTMLImageElement): boolean;
export declare function fixFloat(f?: number): number;
/**
 * Easing function.
 */
export declare function easeSinOut(n: number): number;
