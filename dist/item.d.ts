import { Wheel } from './wheel.js';
type Props = {
    backgroundColor: string | null;
    image: HTMLImageElement | null;
    imageOpacity: number;
    imageRadius: number;
    imageRotation: number;
    imageScale: number;
    label: string;
    labelColor: string | null;
    value: string | null;
    weight: number;
};
export declare class Item {
    private _wheel;
    private _backgroundColor;
    private _image;
    private _imageOpacity;
    private _imageRadius;
    private _imageRotation;
    private _imageScale;
    private _label;
    private _labelColor;
    private _value;
    private _weight;
    path: Path2D | undefined;
    constructor(wheel: Wheel, props: Partial<Props>);
    /**
     * Initialise all properties.
     */
    init(props: Partial<Props>): void;
    /**
     * The background color of the item.
     * When `null`, the actual color rendered will fall back to `Wheel.itemBackgroundColors`.
     * Example: `'#fff'`.
     */
    get backgroundColor(): string | null;
    set backgroundColor(val: string | null | undefined);
    /**
     * The url of an image that will be drawn on the item.
     * Any part of the image that extends outside the item will be clipped.
     * The image will be drawn over the top of `Item.backgroundColor`.
     */
    get image(): HTMLImageElement | null;
    set image(val: string | HTMLImageElement | null | undefined);
    /**
     * The opacity (as a percent) of `Item.image`.
     * Useful if you want to fade the image to make the item's label stand out.
     */
    get imageOpacity(): number;
    set imageOpacity(val: number | undefined);
    /**
     * The point along the radius (as a percent, starting from the center of the wheel) to draw the center of `Item.image`.
     */
    get imageRadius(): number;
    set imageRadius(val: number | undefined);
    /**
     * The rotation (angle in degrees) of `Item.image`.
     */
    get imageRotation(): number;
    set imageRotation(val: number | undefined);
    /**
     * The scale (as a percent) to resize `Item.image`.
     */
    get imageScale(): number;
    set imageScale(val: number | undefined);
    /**
     * The text that will be drawn on the item.
     */
    get label(): string;
    set label(val: string | undefined);
    /**
     * The color of the label.
     * When `null`, the actual color rendered will fall back to `Wheel.itemLabelColors`.
     * Example: `'#000'`.
     */
    get labelColor(): string | null;
    set labelColor(val: string | null | undefined);
    /**
     * Some value that has meaning to your application.
     * For example, a reference to the object representing the item on the wheel, or a database id.
     */
    get value(): string | null;
    set value(val: string | null | undefined);
    /**
     * The proportional size of the item relative to other items on the wheel.
     * For example, if you have 2 items where `item[0]` has a weight of `1` and `item[1]` has a weight of `2`,
     * then `item[0]` will take up 1/3 of the space on the wheel.
     */
    get weight(): number;
    set weight(val: number | undefined);
    /**
     * Get the 0-based index of this item.
     */
    getIndex(): number;
    /**
     * Get the angle (in degrees) that this item ends at (exclusive), ignoring the current `rotation` of the wheel.
     */
    getCenterAngle(): number;
    /**
     * Get the angle (in degrees) that this item starts at (inclusive), ignoring the current `rotation` of the wheel.
     */
    getStartAngle(): number;
    /**
     * Get the angle (in degrees) that this item ends at (inclusive), ignoring the current `rotation` of the wheel.
     */
    getEndAngle(): number;
    /**
     * Return a random angle (in degrees) between this item's start angle (inclusive) and end angle (inclusive).
     */
    getRandomAngle(): number;
}
export {};
