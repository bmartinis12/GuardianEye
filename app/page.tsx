"use client"

import InfoPopup from "@/components/InfoPopup";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { beep } from "@/utils/audio";
import { base64toBlob, formatDate } from "@/utils/convert";
import { Camera, FlipHorizontal, PersonStanding, Video, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Rings } from "react-loader-spinner";
import Webcam from "react-webcam";
import * as cocossd from '@tensorflow-models/coco-ssd';
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-backend-webgl";
import { drawOnCanvas, resizeCanvas } from "@/utils/canvas";
import { initModel } from "@/utils/model";
import { toast } from "sonner";

let interval: any = null;
let stopTimeout: any = null;

const HomePage = () => {

  // Webcamref
  const webcamRef = useRef<Webcam>(null);

  // CanvasRef
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // MediaRecorderRef
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Mirrored state
  const [mirrored, setMirrored] = useState<boolean>(false);

  // Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);

  // Auto record state 
  const [autoRecordEnabled, setAutoRecordEnabled] = useState<boolean>(false);

  // Volume state
  const [volume, setVolume] = useState<number>(0.8);

  // Model loading state 
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Model state 
  const [model, setModel] = useState<cocossd.ObjectDetection>();

  // Initialize the media recorder
  useEffect(() => {

    if (webcamRef && webcamRef.current) {
      const stream = (webcamRef.current.video as any).captureStream() ? (webcamRef.current.video as any).captureStream() : (webcamRef.current.video as any).mozCaptureStream();

      if (stream) {
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            const recordedBlob = new Blob([e.data], { type: 'video' });
            const videoURL = URL.createObjectURL(recordedBlob);

            const a = document.createElement('a');
            a.href = videoURL;
            a.download = `${formatDate(new Date())}.webm`;
            a.click();
          }
        };
        mediaRecorderRef.current.onstart = (e) => {
          setIsRecording(true);
        }
        mediaRecorderRef.current.onstop = (e) => {
          setIsRecording(false);
        }
      }
    }
  }, [webcamRef])


  // ML model start on page load
  useEffect(() => {
    setIsLoading(true);
    initModel(setModel)
  }, []);

  // Close loading state on model complete loading
  useEffect(() => {
    if (model) {
      setIsLoading(false);
    }
  }, [model]);

  // ML model prediction function
  const runPrediction = async () => {
    if (model && webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
      const predictions = await model.detect(webcamRef.current.video);

      resizeCanvas(canvasRef, webcamRef)
      drawOnCanvas(mirrored, predictions, canvasRef.current?.getContext('2d'));

      let isPerson: boolean = false;
      if (predictions.length > 0) {
        predictions.forEach((prediction) => {
          isPerson = prediction.class === 'person'
        });

        if (isPerson && autoRecordEnabled) {
          startRecording(true);
        }
      }
    }
  }

  // Prediction function interval
  useEffect(() => {
    interval = setInterval(() => {
      runPrediction();
    }, 100);

    return () => clearInterval(interval)
  }, [webcamRef.current, model, mirrored, autoRecordEnabled, runPrediction]) // eslint-disable-line

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col items-center">
      {/* Left section of screen - webcam and canvas */}
      <div className="w-full lg:w-3/4 pt-16 pb-2 px-2">
        <div className="relative">
          <Webcam ref={webcamRef} mirrored={mirrored} className="h-full w-full object-contain" />
          <canvas ref={canvasRef} className="absolute top-0 left-0 h-full w-full object-contain"></canvas>
        </div>
      </div>
      {/* Right section of screen - container for button panel and wiki section */}
      <div className="sm:w-full lg:w-3/4 pt-2 px-2 pb-16">
        <div className="border-primary/5 justify-between flex-wrap border-2 flex flex-col sm:flex-row gap-10 sm:gap-4 shadow-md rounded-md p-6 w-full">
          {/* Top section */}
          <div className="flex justify-evenly gap-x-10 sm:gap-x-4">
            <div className="flex items-center justify-center gap-x-2">
              <ModeToggle />
              <InfoPopup title='Dark Mode/System Theme 🌗' description="Toggle between dark mode and system theme." />
            </div>
            <div className="flex items-center justify-center gap-x-2">
              <Button variant={'outline'} size={'icon'} onClick={() => {
                setMirrored((state) => !state)
              }}>
                <FlipHorizontal />
              </Button>
              <InfoPopup title='Horizontal Flip ↔️' description="Adjust horizontal orientation." />
            </div>
          </div>
          <hr className="w-[2px] h-[40px] bg-primary/5 rounded-md sm:block hidden" />
          {/* Middle section */}
          <div className="flex justify-evenly gap-x-10 sm:gap-x-4">
            <div className="flex items-center justify-center gap-x-2">
              <Button variant={'outline'} size={'icon'} onClick={userPromptScreenshot}>
                <Camera />
              </Button>
              <InfoPopup title='Take Pictures 📸' description="Capture snapshots at any moment from the video feed." />
            </div>
            <div className="flex items-center justify-center gap-x-2">
              <Button variant={isRecording ? 'destructive' : 'outline'} size={'icon'} onClick={userPromptRecord}>
                <Video />
              </Button>
              <InfoPopup title='Manual Video Recording 📽️' description="Manually record video clips as needed." />
            </div>
          </div>
          <hr className="w-[2px] h-[40px] bg-primary/5 rounded-md sm:block hidden" />
          {/* Bottom section */}
          <div className="flex justify-evenly gap-x-10 sm:gap-x-4">
            <div className="flex items-center justify-center gap-x-2">
              <Button variant={autoRecordEnabled ? 'destructive' : 'outline'} size={'icon'} onClick={toggleAutoRecord}>
                {autoRecordEnabled ? (
                  <Rings color="white" height={45} />
                ) : (
                  <PersonStanding />
                )}
              </Button>
              <InfoPopup title='Enable/Disable Auto Record 🚫' description="Option to enable/disable automatic video recording when the systems detects a person." />
            </div>
            <Popover>
              <div className="flex items-center justify-center gap-x-4">
                <PopoverTrigger asChild>
                  <Button variant={'outline'} size={'icon'}>
                    <Volume2 />
                  </Button>
                </PopoverTrigger>
                <InfoPopup title='Volume Slider 🔊' description="Adjust the volume level of the notifications." />
              </div>
              <PopoverContent>
                <Slider max={1} min={0} step={0.2} defaultValue={[volume]} onValueCommit={(val) => {
                  setVolume(val[0]);
                  beep(val[0])
                }} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div >
      {
        isLoading ? (
          <div className="z-50 absolute w-full h-full flex flex-col items-center justify-center gap-y-2 bg-primary-foreground" >
            <p className="font-medium text-lg sm:text-xl md:text-2xl">Getting things ready...</p>
            <Rings height={100} color="red" />
          </div>
        ) : null}
    </div >
  )

  function userPromptScreenshot() {

    // check for webcam 
    if (!webcamRef.current) {
      toast('Camera not found. Please refresh!')
    } else {
      // take picture
      const imgSrc = webcamRef.current.getScreenshot();

      const blob = base64toBlob(imgSrc);

      // save picture to download
      const imgURL = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = imgURL;
      a.download = `${formatDate(new Date())}.png`;
      a.click();
    }
  };

  function userPromptRecord() {

    // Check for webcam
    if (!webcamRef.current) {
      toast.error('Camera not found. Please refresh!');
      return;
    }

    // check if recording
    if (mediaRecorderRef.current?.state == 'recording') {
      mediaRecorderRef.current.requestData();

      //then stop recording 
      clearTimeout(stopTimeout);
      mediaRecorderRef.current.stop();

      // and save to downloads 
      toast.success('Recording saved to downloads.');

      // if not recording 
    } else {
      // start recording
      startRecording(false)
    }
  }

  function startRecording(doBeep: boolean) {

    if (webcamRef.current && mediaRecorderRef.current?.state !== 'recording') {
      mediaRecorderRef.current?.start();
      if (doBeep) beep(volume);

      stopTimeout = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.requestData();
          mediaRecorderRef.current.stop();
        }
      }, 30000)
    }
  }

  function toggleAutoRecord() {
    // check if auto record is enabled 
    if (autoRecordEnabled) {
      setAutoRecordEnabled(false);

      // show toast to notify change
      toast.warning("Autorecord disabled")
    } else {
      setAutoRecordEnabled(true);

      // show toast to notify change
      toast.success("Autorecord enabled")
    }
  };
}

export default HomePage;

