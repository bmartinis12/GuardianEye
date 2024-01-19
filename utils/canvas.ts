import { RefObject } from "react";
import Webcam from "react-webcam";
import * as cocossd from '@tensorflow-models/coco-ssd'

export function resizeCanvas(canvasRef: RefObject<HTMLCanvasElement>, webcamRef: RefObject<Webcam>) {

    // Get canvas and video DOM elements
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video;

    // If canvas and video element
    if (canvas && video) {
        // Set canvas to video element dimensions
        const { videoWidth, videoHeight } = video;
        canvas.width = videoWidth;
        canvas.height = videoHeight;
    };

    return;
};

export function drawOnCanvas(mirrored: boolean, predictions: cocossd.DetectedObject[], ctx: CanvasRenderingContext2D | null | undefined) {

    // create visual for each prediction on the canvas
    predictions.forEach((detectedObject: cocossd.DetectedObject) => {

        // extract varialbles from prediction
        const { class: name, bbox, score } = detectedObject;
        const [x, y, width, height] = bbox;

        // if ctx exists
        if (ctx) {
            ctx.beginPath();

            // fill styling
            ctx.fillStyle = name === 'person' ? '#FF0F0F' : '#00B612';
            ctx.globalAlpha = 0.4;

            // determine location of rectangle
            mirrored ? ctx.roundRect(ctx.canvas.width - x, y, -width, height, 8) : ctx.roundRect(x, y, width, height, 8);

            // draw stroke or fill
            ctx.fill();

            // text styling 
            ctx.font = "12px Courier New";
            ctx.fillStyle = 'black'
            ctx.globalAlpha = 1;

            // determine the location of the text
            mirrored ? ctx.fillText(name, ctx.canvas.width - x - width + 10, y + 20) : ctx.fillText(name, x + 10, y + 20)

        }
    })
}