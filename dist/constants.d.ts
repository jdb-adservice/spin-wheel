/**
 * Adjustment when drawing arcs to ensure 0° is north (due to canvas drawing arcs from 90°).
 */
export declare const arcAdjust = -90;
export declare const baseCanvasSize = 500;
/**
 * The period in milliseconds that we record drag events.
 * Used to calculate how fast the wheel should spin after the drag ends.
 * For example, if the wheel was dragged 20 degrees over the last 250ms,
 * then it should continue rotating at a speed of 20 degrees every 250ms after the drag ends.
 */
export declare const dragCapturePeriod = 250;
/**
 * Text alignment enum.
 */
export declare const AlignText: Readonly<{
    left: "left";
    right: "right";
    center: "center";
}>;
/**
 * Wheel property defaults.
 */
export declare const Defaults: Readonly<{
    wheel: {
        borderColor: string;
        borderWidth: number;
        debug: boolean;
        image: null;
        isInteractive: boolean;
        itemBackgroundColors: string[];
        itemLabelAlign: "right";
        itemLabelBaselineOffset: number;
        itemLabelColors: string[];
        itemLabelFont: string;
        itemLabelFontSizeMax: number;
        itemLabelRadius: number;
        itemLabelRadiusMax: number;
        itemLabelRotation: number;
        itemLabelStrokeColor: string;
        itemLabelStrokeWidth: number;
        items: never[];
        lineColor: string;
        lineWidth: number;
        pixelRatio: number;
        radius: number;
        rotation: number;
        rotationResistance: number;
        rotationSpeedMax: number;
        offset: {
            w: number;
            h: number;
        };
        onCurrentIndexChange: null;
        onRest: null;
        onSpin: null;
        overlayImage: null;
        pointerAngle: number;
    };
    item: {
        backgroundColor: null;
        image: null;
        imageOpacity: number;
        imageRadius: number;
        imageRotation: number;
        imageScale: number;
        label: string;
        labelColor: null;
        value: null;
        weight: number;
    };
}>;
export declare const Debugging: Readonly<{
    pointerLineColor: "#ff00ff";
    labelOutlineColor: "#ff00ff";
    labelRadiusColor: "#00ff00";
    dragEventHue: 200;
}>;
