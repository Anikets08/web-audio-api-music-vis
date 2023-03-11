import { useEffect, useRef, useState } from "react";
import "./App.css";

import AudioContext from "./AudioFunc/AudioContext";
import autoCorrelate from "./AudioFunc/AutoCorrelate";
import {
  noteFromPitch,
  centsOffFromPitch,
  getDetunePercent,
} from "./AudioFunc/Helpers";
import Music from "./assets/music.mp3";

const audioCtx = AudioContext.getAudioContext();
const analyserNode = AudioContext.getAnalyser();
const buflen = 2048;
var buf = new Float32Array(buflen);

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [pitch, setPitch] = useState(0);
  const [pitchScale, setPitchScale] = useState(0);
  const audio = useRef(null);
  const [source, setSource] = useState(null);
  const [detune, setDetune] = useState("0");

  const updatePitch = (time) => {
    analyserNode.getFloatTimeDomainData(buf);
    var ac = autoCorrelate(buf, audioCtx.sampleRate);
    if (ac > -1) {
      let note = noteFromPitch(ac);
      let scl = Math.floor(note / 12) - 1;
      let dtune = centsOffFromPitch(ac, note);
      setPitch(ac);
      setPitchScale(scl);
      setDetune(dtune);
      console.log(pitchScale, pitch, detune);
    }
  };

  useEffect(() => {
    if (source != null) {
      source.connect(analyserNode);
    }
  }, [source]);

  setInterval(updatePitch, 1);

  const start = async () => {
    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }
    setSource(
      audioCtx.createMediaStreamSource(await audio.current.captureStream())
    );
  };

  const stop = () => {
    source.disconnect(analyserNode);
  };

  return (
    <>
      <audio
        src={Music}
        ref={audio}
        onEnded={() => {
          setIsPlaying(false);
          stop();
        }}
      ></audio>

      <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100">
        <div className="h-[900px] w-[800px] bg-white rounded-3xl relative">
          <img
            src="https://images.unsplash.com/photo-1678008583224-cd4f9582ef37?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1064&q=80"
            alt=""
            className="h-full w-full object-cover rounded-3xl brightness-50"
          />
          <h1 className="text-white absolute bottom-10 right-10 font-black text-7xl leading-[60px] max-w-xs text-right">
            It's Going Down
          </h1>
          {isPlaying ? (
            <svg
              onClick={() => {
                setIsPlaying(false);
                audio.current.pause();
                stop();
              }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="white"
              className="w-16 h-16 absolute bottom-10 left-10 cursor-pointer"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 5.25v13.5m-7.5-13.5v13.5"
              />
            </svg>
          ) : (
            <svg
              onClick={() => {
                setIsPlaying(true);
                audio.current.play();
                start();
              }}
              xmlns="http://www.w3.org/2000/svg"
              fill="white"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
              className="w-16 h-16 absolute bottom-10 left-10 cursor-pointer"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
              />
            </svg>
          )}

          <div className="h-[100px] w-full  flex items-start justify-between absolute top-0">
            {Array(10)
              .fill(0)
              .map((item, index) => {
                return (
                  <div
                    className="w-7 max-h-[600px] rounded-md bg-slate-300 opacity-30"
                    style={{
                      height: `${Math.floor(
                        (Math.random() * pitch) / pitchScale
                      )}px`,
                    }}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
