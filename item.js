import * as util from './util.js';
import { Defaults } from './constants.js';

/**
 * Represents an item on the wheel.
 */
export class Item {

    /**
  * Constructs an instance of the Item class.
  * @param {Object} wheel - The wheel this item belongs to.
  * @param {Object} [props={}] - An object containing properties for initializing the item.
  * @throws {Error} If wheel or props are invalid.
  */
    constructor(wheel, props = {}) {

        // Validate params.
        if (!util.isObject(wheel)) throw new Error('wheel must be an instance of Wheel'); // Ideally we would use instanceof, however importing the Wheel class would create a circular ref.
        if (!util.isObject(props) && props !== null) throw new Error('props must be an Object or null');

        this._wheel = wheel;

        // Assign default values.
        // This avoids null exceptions when we initalise each property one-by-one in `init()`.
        for (const i of Object.keys(Defaults.item)) {
            this['_' + i] = Defaults.item[i];
        }

        if (props) {
            this.init(props);
        } else {
            this.init(Defaults.item);
        }

    }

    /**
    * Initializes item properties.
    * @param {Object} [props={}] - An object containing properties for initializing the item.
    */
    init(props = {}) {
        this.backgroundColor = props.backgroundColor;
        this.image = props.image;
        this.imageOpacity = props.imageOpacity;
        this.imageRadius = props.imageRadius;
        this.imageRotation = props.imageRotation;
        this.imageScale = props.imageScale;
        this.label = props.label;
        this.labelColor = props.labelColor;
        this.value = props.value;
        this.weight = props.weight;
    }


    /**
     * @returns {string|null} The background color of the item.
     */
    get backgroundColor() {
        return this._backgroundColor;
    }
    /**
    * Sets the background color of the item.
    * @param {string|null} val - The new background color.
    */
    set backgroundColor(val) {
        if (typeof val === 'string') {
            this._backgroundColor = val;
        } else {
            this._backgroundColor = Defaults.item.backgroundColor;
        }
        this._wheel.refresh();
    }

    /**
 * Gets the image URL.
 * @returns {Image|null} The current image.
 */
    get image() {
        return this._image;
    }
    /**
 * Sets the image URL.
 * @param {string|null} val - The new image URL.
 */
    set image(val) {
        let img;
        if (typeof val === 'string') {
            img = new Image();
            img.src = val;
            img.onload = e => this._wheel.refresh();
        } else {
            img = Defaults.item.image;
        }
        this._image = img;
        this._wheel.refresh();
    }

    /**
  * Gets the image opacity.
  * @returns {number} The current image opacity.
  */
    get imageOpacity() {
        return this._imageOpacity;
    }
    /**
 * Sets the image opacity.
 * @param {number|null} val - The new image opacity.
 */
    set imageOpacity(val) {
        if (typeof val === 'number') {
            this._imageOpacity = val;
        } else {
            this._imageOpacity = Defaults.item.imageOpacity;
        }
        this._wheel.refresh();
    }

    /**
 * Gets the image radius.
 * @returns {number} The current image radius.
 */
    get imageRadius() {
        return this._imageRadius;
    }
    /**
 * Sets the image radius.
 * @param {number|null} val - The new image radius.
 */
    set imageRadius(val) {
        if (typeof val === 'number') {
            this._imageRadius = val;
        } else {
            this._imageRadius = Defaults.item.imageRadius;
        }
        this._wheel.refresh();
    }

    /**
 * Gets the image rotation.
 * @returns {number} The current image rotation in degrees.
 */
    get imageRotation() {
        return this._imageRotation;
    }

    /**
 * Sets the image rotation.
 * @param {number|null} val - The new image rotation in degrees.
 */
    set imageRotation(val) {
        if (typeof val === 'number') {
            this._imageRotation = val;
        } else {
            this._imageRotation = Defaults.item.imageRotation;
        }
        this._wheel.refresh();
    }

    /**
  * Gets the image scale.
  * @returns {number} The current image scale as a percentage.
  */
    get imageScale() {
        return this._imageScale;
    }
    /**
 * Sets the image scale.
 * @param {number|null} val - The new image scale as a percentage.
 */
    set imageScale(val) {
        if (typeof val === 'number') {
            this._imageScale = val;
        } else {
            this._imageScale = Defaults.item.imageScale;
        }
        this._wheel.refresh();
    }

    /**
 * Gets the label text.
 * @returns {string} The current label text.
 */
    get label() {
        return this._label;
    }
    /**
 * Sets the label text.
 * @param {string|null} val - The new label text.
 */
    set label(val) {
        if (typeof val === 'string') {
            this._label = val;
        } else {
            this._label = Defaults.item.label;
        }
        this._wheel.refresh();
    }

    /**
  * Gets the label color.
  * @returns {string} The current label color.
  */
    get labelColor() {
        return this._labelColor;
    }
    /**
 * Sets the label color.
 * @param {string|null} val - The new label color.
 */
    set labelColor(val) {
        if (typeof val === 'string') {
            this._labelColor = val;
        } else {
            this._labelColor = Defaults.item.labelColor;
        }
        this._wheel.refresh();
    }

    /**
 * Gets the value.
 * @returns {*} The current value.
 */
    get value() {
        return this._value;
    }
    /**
 * Sets the value.
 * @param {*} val - The new value.
 */
    set value(val) {
        if (val !== undefined) {
            this._value = val;
        } else {
            this._value = Defaults.item.value;
        }
    }

    /**
     * Gets the weight of the item.
     * @returns {number} The current weight of the item.
     */
    get weight() {
        return this._weight;
    }
    /**
 * Sets the weight of the item.
 * @param {number|null} val - The new weight of the item.
 */
    set weight(val) {
        if (typeof val === 'number') {
            this._weight = val;
        } else {
            this._weight = Defaults.item.weight;
        }
    }

    /**
     * Returns the 0-based index of this item.
     * @returns {number} The index of this item.
     * @throws {Error} If the item is not found in the parent Wheel.
     */
    getIndex() {
        const index = this._wheel.items.findIndex(i => i === this);
        if (index === -1) throw new Error('Item not found in parent Wheel');
        return index;
    }

    /**
    * Returns the center angle of this item in degrees.
    * @returns {number} The center angle in degrees.
    */
    getCenterAngle() {
        const angle = this._wheel.getItemAngles()[this.getIndex()];
        return angle.start + ((angle.end - angle.start) / 2);
    }

    /**
   * Returns the start angle of this item in degrees.
   * @returns {number} The start angle in degrees.
   */
    getStartAngle() {
        return this._wheel.getItemAngles()[this.getIndex()].start;
    }

    /**
     * Returns the end angle of this item in degrees.
     * @returns {number} The end angle in degrees.
     */
    getEndAngle() {
        return this._wheel.getItemAngles()[this.getIndex()].end;
    }

    /**
    * Returns a random angle between this item's start and end angles.
    * @returns {number} A random angle in degrees.
    */
    getRandomAngle() {
        return util.getRandomFloat(this.getStartAngle(), this.getEndAngle());
    }

}
