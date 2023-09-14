/**
 * Adjustment when drawing arcs to ensure 0° is north (due to canvas drawing arcs from 90°).
 * @type {number}
 */
export const arcAdjust = -90;

/**
 * The base size of the canvas.
 * @type {number}
 */
export const baseCanvasSize = 500; // 500 seemed to be a good value for this.

/**
 * The period in milliseconds that we record drag events.
 * @type {number}
 */
export const dragCapturePeriod = 250;

/**
 * Enum for text alignment.
 * @enum {string}
 */
export const AlignText = Object.freeze({
  left: 'left',
  right: 'right',
  center: 'center',
});

/**
 * Default properties for the wheel component.
 * @type {Object}
 */
export const Defaults = Object.freeze({
  wheel: {
    /** @type {string} Border color of the wheel */
    borderColor: '#000',
    /** @type {number} Border width of the wheel */
    borderWidth: 1,
    /** @type {boolean} Debugging flag */
    debug: false,
    /** @type {?string} Image source for the wheel background */
    image: null,
    /** @type {boolean} Is the wheel interactive */
    isInteractive: true,
    /** @type {string[]} Background colors for wheel items */
    itemBackgroundColors: ['#fff'],
    /** @type {string} Text alignment for item labels */
    itemLabelAlign: AlignText.right,
    /** @type {number} Baseline offset for item labels */
    itemLabelBaselineOffset: 0,
    /** @type {string[]} Text colors for item labels */
    itemLabelColors: ['#000'],
    /** @type {string} Font family for item labels */
    itemLabelFont: 'sans-serif',
    /** @type {number} Maximum font size for item labels */
    itemLabelFontSizeMax: baseCanvasSize,
    /** @type {number} Radius factor for positioning item labels */
    itemLabelRadius: 0.85,
    /** @type {number} Maximum radius factor for positioning item labels */
    itemLabelRadiusMax: 0.2,
    /** @type {number} Rotation angle for item labels */
    itemLabelRotation: 0,
    /** @type {string} Stroke color for item labels */
    itemLabelStrokeColor: '#fff',
    /** @type {number} Stroke width for item labels */
    itemLabelStrokeWidth: 0,
    /** @type {any[]} List of items in the wheel */
    items: [],
    /** @type {string} Line color between items */
    lineColor: '#000',
    /** @type {number} Line width between items */
    lineWidth: 1,
    /** @type {number} Pixel ratio for the canvas */
    pixelRatio: 0,
    /** @type {number} Radius factor for the wheel */
    radius: 0.95,
    /** @type {number} Current rotation angle of the wheel */
    rotation: 0,
    /** @type {number} Rotation resistance for wheel dragging */
    rotationResistance: -35,
    /** @type {number} Maximum rotation speed for wheel spinning */
    rotationSpeedMax: 300,
    /** @type {Object} Offset for wheel positioning */
    offset: {w: 0, h: 0},
    /** @type {?Function} Callback when the current index changes */
    onCurrentIndexChange: null,
    /** @type {?Function} Callback when the wheel comes to rest */
    onRest: null,
    /** @type {?Function} Callback when the wheel starts spinning */
    onSpin: null,
    /** @type {?string} Overlay image source */
    overlayImage: null,
    /** @type {number} Pointer angle for the wheel */
    pointerAngle: 0,
  },
  item: {
    /** @type {?string} Background color for the item */
    backgroundColor: null,
    /** @type {?string} Image source for the item */
    image: null,
    /** @type {number} Image opacity */
    imageOpacity: 1,
    /** @type {number} Radius factor for positioning the item image */
    imageRadius: 0.5,
    /** @type {number} Rotation angle for the item image */
    imageRotation: 0,
    /** @type {number} Scaling factor for the item image */
    imageScale: 1,
    /** @type {string} Label text for the item */
    label: '',
    /** @type {?string} Text color for the item label */
    labelColor: null,
    /** @type {?any} Value associated with the item */
    value: null,
    /** @type {number} Weight factor for the item */
    weight: 1,
  },
});

/**
 * Properties for debugging visualization.
 * @type {Object}
 */
export const Debugging = Object.freeze({
  /** @type {string} Line color for pointer during debugging */
  pointerLineColor: '#ff00ff',
  /** @type {string} Outline color for label during debugging */
  labelOutlineColor: '#ff00ff',
  /** @type {string} Radius color for label during debugging */
  labelRadiusColor: '#00ff00',
  /** @type {number} Hue value for drag events during debugging */
  dragEventHue: 200,
});
