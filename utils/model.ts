import * as cocossd from "@tensorflow-models/coco-ssd";

// Start ML model
export const initModel = async (setState: React.Dispatch<React.SetStateAction<cocossd.ObjectDetection | undefined>>) => {
    const loadedModel: cocossd.ObjectDetection = await cocossd.load({
        base: 'mobilenet_v2',
    });
    setState(loadedModel);
};