import { Item } from './item.js';
type Alignment = 'left' | 'center' | 'right';
type Offset = {
    w: number;
    h: number;
};
type Angle = {
    start: number;
    end: number;
};
type EasingFunction = (n: number) => number;
type SpinEvent = {
    type: 'spin';
    method: 'spin';
    rotationSpeed: number;
    rotationResistance: number;
};
type SpinToEvent = {
    type: 'spin';
    method: 'spinto';
    targetRotation: number;
    duration: number;
};
type SpinToItemEvent = {
    type: 'spin';
    method: 'spintoitem';
    targetItemIndex: number;
    targetRotation: number;
    duration: number;
};
type InteractEvent = {
    type: 'spin';
    method: 'interact';
    rotationSpeed: number;
    rotationResistance: number;
};
type RestEvent = {
    type: 'rest';
    currentIndex: number;
    rotation: number;
};
type CurrentIndexChangeEvent = {
    type: 'currentIndexChange';
    currentIndex: number;
};
type SpinWheelEvent = SpinEvent | SpinToEvent | SpinToItemEvent | InteractEvent | RestEvent | CurrentIndexChangeEvent;
type Props = {
    borderColor: string;
    borderWidth: number;
    debug: boolean;
    image: string;
    isInteractive: boolean;
    itemBackgroundColors: string[];
    itemLabelAlign: Alignment;
    itemLabelBaselineOffset: number;
    itemLabelColors: string[];
    itemLabelFont: string;
    itemLabelFontSizeMax: number;
    itemLabelRadius: number;
    itemLabelRadiusMax: number;
    itemLabelRotation: number;
    itemLabelStrokeColor: string;
    itemLabelStrokeWidth: number;
    items: Partial<Item>[];
    lineColor: string;
    lineWidth: number;
    pixelRatio: number;
    radius: number;
    rotation: number;
    rotationResistance: number;
    rotationSpeedMax: number;
    offset: Offset;
    onCurrentIndexChange: ((e: SpinWheelEvent) => void) | null;
    onRest: ((e: SpinWheelEvent) => void) | null;
    onSpin: ((e: SpinWheelEvent) => void) | null;
    overlayImage: string;
    pointerAngle: number;
};
declare class Wheel {
    private _frameRequestId;
    private _rotationSpeed;
    private _rotationDirection;
    private _spinToTimeStart;
    private _spinToTimeEnd;
    private _lastSpinFrameTime;
    _isCursorOverWheel: boolean;
    private _isInitialising;
    private _borderColor;
    private _borderWidth;
    private _debug;
    private _image;
    private _isInteractive;
    private _itemBackgroundColors;
    private _itemLabelAlign;
    private _itemLabelBaselineOffset;
    private _itemLabelColors;
    private _itemLabelFont;
    private _itemLabelFontSizeMax;
    private _itemLabelRadius;
    private _itemLabelRadiusMax;
    private _itemLabelRotation;
    private _itemLabelStrokeColor;
    private _itemLabelStrokeWidth;
    private _items;
    private _lineColor;
    private _lineWidth;
    private _offset;
    private _onCurrentIndexChange;
    private _onRest;
    private _onSpin;
    private _overlayImage;
    private _pixelRatio;
    private _radius;
    private _rotation;
    private _rotationResistance;
    private _spinToEasingFunction;
    canvas: HTMLCanvasElement | null;
    private _canvasContainer;
    private _context;
    private _size;
    private _center;
    private _actualRadius;
    private _currentIndex;
    private _pointerAngle;
    private _rotationSpeedMax;
    private itemLabelFontSize;
    private labelMaxWidth;
    private dragEvents;
    private isDragging;
    private _spinToStartRotation;
    private _spinToEndRotation;
    _handler_onResize: () => void;
    _handler_onDevicePixelRatioChange: (this: MediaQueryList, ev: MediaQueryListEvent) => void;
    _handler_onPointerMoveRefreshCursor: (e: PointerEvent) => void;
    _handler_onPointerDown: (e: PointerEvent) => void;
    _handler_onMouseDown: (e: MouseEvent) => void;
    _handler_onTouchStart: (e: TouchEvent) => void;
    _handler_onMouseMoveRefreshCursor: (e: MouseEvent) => void;
    _mediaQueryList: MediaQueryList | undefined;
    /**
     * Create the wheel inside a container Element and initialise it with props.
     * `container` must be an Element.
     * `props` must be an Object or null.
     */
    constructor(container: Element, props: Partial<Props>);
    /**
     * Initialise all properties.
     */
    init(props: Partial<Props>): void;
    /**
     * Add the wheel to the DOM and register event handlers.
     */
    private add;
    /**
     * Remove the wheel from the DOM and unregister event handlers.
     */
    remove(): void;
    /**
     * Resize the wheel to fit inside it's container.
     * Call this after changing any property of the wheel that relates to it's size or position.
     */
    resize(): void;
    /**
     * Main animation loop.
     */
    private draw;
    private drawItemBackgrounds;
    private drawItemImages;
    private drawImage;
    private drawPointerLine;
    private drawBorder;
    private drawItemLines;
    private drawItemLabels;
    private drawDragEvents;
    private animateRotation;
    private getRotationSpeedPlusDrag;
    /**
     * Spin the wheel by setting `rotationSpeed`.
     * The wheel will immediately start spinning, and slow down over time depending on the value of `rotationResistance`.
     * A positive number will spin clockwise, a negative number will spin anticlockwise.
     */
    spin(rotationSpeed?: number): void;
    /**
     * Spin the wheel to a particular rotation.
     * The animation will occur over the provided `duration` (milliseconds).
     * The animation can be adjusted by providing an optional `easingFunction` which accepts a single parameter n, where n is between 0 and 1 inclusive.
     * If no easing function is provided, the default easeSinOut will be used.
     * For example easing functions see [easing-utils](https://github.com/AndrewRayCode/easing-utils).
     */
    spinTo(rotation: number, duration: number, easingFunction?: EasingFunction | null): void;
    /**
     * Spin the wheel to a particular item.
     * The animation will occur over the provided `duration` (milliseconds).
     * If `spinToCenter` is true, the wheel will spin to the center of the item, otherwise the wheel will spin to a random angle inside the item.
     * `numberOfRevolutions` controls how many times the wheel will rotate a full 360 degrees before resting on the item.
     * The animation can be adjusted by providing an optional `easingFunction` which accepts a single parameter n, where n is between 0 and 1 inclusive.
     * If no easing function is provided, the default easeSinOut will be used.
     * For example easing functions see [easing-utils](https://github.com/AndrewRayCode/easing-utils).
     */
    spinToItem(itemIndex?: number, duration?: number, spinToCenter?: boolean, numberOfRevolutions?: number, direction?: number, easingFunction?: EasingFunction | null): void;
    private animate;
    /**
     * Immediately stop the wheel from spinning, regardless of which method was used to spin it.
     */
    stop(): void;
    /**
     * Return n scaled to the size of the canvas.
     */
    private getScaledNumber;
    private getActualPixelRatio;
    /**
     * Return true if the given point is inside the wheel.
     */
    wheelHitTest(point?: {
        x: number;
        y: number;
    }): boolean;
    /**
     * Refresh the cursor state.
     * Call this after the pointer moves.
     */
    refreshCursor(): void;
    /**
     * Get the angle (in degrees) of the given point from the center of the wheel.
     * 0 is north.
     */
    private getAngleFromCenter;
    /**
     * Get the index of the item that the Pointer is pointing at.
     * An item is considered "current" if `pointerAngle` is between it's start angle (inclusive)
     * and it's end angle (exclusive).
     */
    getCurrentIndex(): number;
    /**
     * Calculate and set `currentIndex`
     */
    private refreshCurrentIndex;
    /**
     * Return an array of objects containing the start angle (inclusive) and end angle (inclusive) of each item.
     */
    getItemAngles(initialRotation?: number): Angle[];
    /**
     * Schedule a redraw of the wheel on the canvas.
     * Call this after changing any property of the wheel that relates to it's appearance.
     */
    refresh(): void;
    private limitSpeed;
    private beginSpin;
    private refreshAriaLabel;
    /**
     * The color of the line around the circumference of the wheel.
     */
    get borderColor(): string;
    set borderColor(val: string | undefined);
    /**
     * The width (in pixels) of the line around the circumference of the wheel.
     */
    get borderWidth(): number;
    set borderWidth(val: number | undefined);
    /**
     * Show debugging info.
     * This is particularly helpful when fine-tuning labels.
     */
    get debug(): boolean;
    set debug(val: boolean | undefined);
    /**
     * The url of an image that will be drawn over the center of the wheel which will rotate with the wheel.
     * It will be automatically scaled to fit `radius`.
     */
    get image(): HTMLImageElement | null;
    set image(val: string | null | undefined);
    /**
     * Allow the user to spin the wheel using click-drag/touch-flick.
     * User interaction will only be detected within the bounds of `Wheel.radius`.
     */
    get isInteractive(): boolean;
    set isInteractive(val: boolean | undefined);
    /**
     * The repeating pattern of background colors for all items.
     * Overridden by `Item.backgroundColor`.
     * Example: `['#fff','#000']`.
     */
    get itemBackgroundColors(): string[];
    set itemBackgroundColors(val: string[] | undefined);
    /**
     * The alignment of all item labels.
     * Accepted values: `'left'`,`'center'`,`'right'`.
     */
    get itemLabelAlign(): Alignment;
    set itemLabelAlign(val: Alignment | undefined);
    /**
     * The offset of the baseline (or line height) of all item labels (as a percent of the label's height).
     */
    get itemLabelBaselineOffset(): number;
    set itemLabelBaselineOffset(val: number | undefined);
    /**
     * The repeating pattern of colors for all item labels.
     * Overridden by `Item.labelColor`.
     * Example: `['#fff','#000']`.
     */
    get itemLabelColors(): string[];
    set itemLabelColors(val: string[] | undefined);
    /**
     * The font family for all item labels.
     * Overridden by `Item.labelFont`.
     * Example: `'sans-serif'`.
     */
    get itemLabelFont(): string;
    set itemLabelFont(val: string | undefined);
    /**
     * The maximum font size (in pixels) for all item labels.
     */
    get itemLabelFontSizeMax(): number;
    set itemLabelFontSizeMax(val: number | undefined);
    /**
     * The point along the radius (as a percent, starting from the center of the wheel)
     * to start drawing all item labels.
     */
    get itemLabelRadius(): number;
    set itemLabelRadius(val: number | undefined);
    /**
     * The point along the radius (as a percent, starting from the center of the wheel)
     * to calculate the maximum font size for all item labels.
     */
    get itemLabelRadiusMax(): number;
    set itemLabelRadiusMax(val: number | undefined);
    /**
     * The rotation of all item labels.
     * Use this in combination with `itemLabelAlign` to flip the labels `180°`.
     */
    get itemLabelRotation(): number;
    set itemLabelRotation(val: number | undefined);
    /**
     * The color of the stroke applied to the outside of the label text.
     */
    get itemLabelStrokeColor(): string;
    set itemLabelStrokeColor(val: string | undefined);
    /**
     * The width of the stroke applied to the outside of the label text.
     */
    get itemLabelStrokeWidth(): number;
    set itemLabelStrokeWidth(val: number | undefined);
    /**
     * The items to show on the wheel.
     */
    get items(): Item[];
    set items(val: Partial<Item>[] | undefined);
    /**
     * The color of the lines between the items.
     */
    get lineColor(): string;
    set lineColor(val: string | undefined);
    /**
     * The width (in pixels) of the lines between the items.
     */
    get lineWidth(): number;
    set lineWidth(val: number | undefined);
    /**
     * The offset of the wheel relative to it's center (as a percent of the wheel's diameter).
     */
    get offset(): Offset;
    set offset(val: Offset | undefined);
    /**
     * The callback for the `onCurrentIndexChange` event.
     */
    get onCurrentIndexChange(): ((e: SpinWheelEvent) => void) | null | undefined;
    set onCurrentIndexChange(val: ((e: SpinWheelEvent) => void) | null | undefined);
    /**
     * The callback for the `onRest` event.
     */
    get onRest(): ((e: SpinWheelEvent) => void) | null | undefined;
    set onRest(val: ((e: SpinWheelEvent) => void) | null | undefined);
    /**
     * The callback for the `onSpin` event.
     */
    get onSpin(): ((e: SpinWheelEvent) => void) | null | undefined;
    set onSpin(val: ((e: SpinWheelEvent) => void) | null | undefined);
    /**
     * The url of an image that will be drawn over the center of the wheel which will not rotate with the wheel.
     * It will be automatically scaled to fit the container's smallest dimension.
     * Use this to draw decorations around the wheel, such as a stand or pointer.
     */
    get overlayImage(): string | null;
    set overlayImage(val: string | null | undefined);
    /**
     * The pixel ratio used to render the wheel.
     * Values above 0 will produce a sharper image at the cost of performance.
     * A value of `0` will cause the pixel ratio to be automatically determined using `window.devicePixelRatio`.
     */
    get pixelRatio(): number;
    set pixelRatio(val: number | undefined);
    /**
     * The angle of the Pointer which is used to determine the `currentIndex` (or the "winning" item).
     */
    get pointerAngle(): number;
    set pointerAngle(val: number | undefined);
    /**
     * The radius of the wheel (as a percent of the container's smallest dimension).
     */
    get radius(): number;
    set radius(val: number | undefined);
    /**
     * The rotation (angle in degrees) of the wheel.
     * `0` is north.
     * The first item will be drawn clockwise from this point.
     */
    get rotation(): number;
    set rotation(val: number | undefined);
    /**
     * The amount that `rotationSpeed` will be reduced by every second.
     * Only in effect when `rotationSpeed !== 0`.
     * Set to `0` to spin the wheel infinitely.
     */
    get rotationResistance(): number;
    set rotationResistance(val: number | undefined);
    /**
     * (Readonly) How far (angle in degrees) the wheel will spin every 1 second.
     * A positive number means the wheel is spinning clockwise, a negative number means anticlockwise, and `0` means the wheel is not spinning.
     */
    get rotationSpeed(): number;
    /**
     * The maximum value for `rotationSpeed` (ignoring the wheel's spin direction).
     * The wheel will not spin faster than this value in any direction.
     */
    get rotationSpeedMax(): number;
    set rotationSpeedMax(val: number | undefined);
    /**
     * Enter the drag state.
     */
    dragStart(point?: {
        x: number;
        y: number;
    }): void;
    dragMove(point?: {
        x: number;
        y: number;
    }): void;
    /**
     * Exit the drag state.
     * Set the rotation speed so the wheel continues to spin in the same direction.
     */
    dragEnd(): void;
    private isDragEventTooOld;
}
export { Wheel, Item };
