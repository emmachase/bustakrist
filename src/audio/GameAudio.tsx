import { Howler } from "howler";
import { Dispatch, MutableRefObject, useEffect, useRef, useState } from "react";
import useAnimationFrame from "use-animation-frame";
import { getTimeDiff, usePerfOff } from "../hooks/time";
import { GameStream } from "../meta/connection";
import { clamp, shuffle } from "../util/math";
import { scoreFunction } from "../util/score";
import { useKState } from "../util/types";
import { AudioSprites, musicHowls, playSound } from "./AudioManager";
import { SoundOutlined } from "@ant-design/icons";
import { MutedSoundOutlined } from "../components/cicons/MutedSoundOutlined";
import { clazz } from "../util/class";
import { useTranslation } from "react-i18next";
import { useDrag } from "react-use-gesture";
import "./audioStyles.scss";

// function useStateEdge(...deps: unknown[]): [boolean[], (() => void)[]] {
//   const resultEdge = [];
//   const resultSet = [];

//   for (const dep of deps) {
//     const [state, setState] = useState(dep);
//     if (dep !== state) {
//       resultEdge.push(true);
//     } else {
//       resultEdge.push(false);
//     }

//     resultSet.push(() => setState(dep));
//   }

//   return [resultEdge, resultSet];
// }

const transitions = [
  2, 5, 25, 100, 500,
  // 1.1, 1.2, 1.3, 1.4, 1.5,
];

export function GameAudio() {
  const game = useKState(s => s.game);
  const user = useKState(s => s.user.name);
  const players = useKState(s => s.players);
  const inActiveGame = players.players.find(p => p.name === user);

  // const [[busted], [clearBusted]] = useStateEdge(bust);

  const state = useRef({
    started: true,
    t1: true,
    t2: true,
    t3: true,
    t4: true,
    t5: true,
    bust: false,
    pullout: false,
  });

  if (!state.current.pullout && inActiveGame?.multiplier) {
    state.current.pullout = true;
    playSound("bust-win");
  }

  const perfOff = usePerfOff();
  const runCheck = (real: boolean) => {
    const c = state.current;
    const timeDiff = getTimeDiff(perfOff, game.start, game.tdiff);

    const score = (game.bust/100) || scoreFunction(timeDiff);
    if (!c.started && timeDiff > 0.1) {
      c.started = true;
      if (real) playSound("transition-1");
    }

    for (let t = 0; t < transitions.length; t++) {
      const cx = c as any;
      const k = "t" + (t + 1);
      if (!cx[k] && score > transitions[t]) {
        cx[k] = true;
        if (real) playSound("transition-" + (t + 2) as any);
      }
    }

    if (!c.bust && game.bust) {
      c.bust = true;
      if (real) {
        if (inActiveGame && !inActiveGame.multiplier) {
          playSound("bust-lose");
        } else {
          playSound("bust");
        }
      }
    }
  };

  useEffect(() => {
    return GameStream.subscribe(() => {
      setTimeout(() => {
        Object.keys(state.current).forEach(key => {
          (state.current as any)[key] = false;
        });

        runCheck(false);
      }, 0);
    });
  }, [perfOff, game.tdiff]);

  useAnimationFrame(() => runCheck(true));

  return null;
}

export function VolumeSlider(props: {
  percent?: number
  onChange?: (percent: number) => void
}) {
  const [percent, setPercent] = useState(props.percent ?? 0.5);

  const [sliderRef, setSliderRef] = useState<HTMLDivElement>();
  const [handleRef, setHandleRef] = useState<HTMLDivElement>();

  const updatePosition = (newPercent: number) => {
    if (!handleRef) return;
    handleRef.style.width = 100*newPercent + "%";
  };

  updatePosition(percent);

  const bind = useDrag(({ xy: [x] }) => {
    if (!sliderRef || !handleRef) return;
    const barPosition = sliderRef.offsetLeft;
    const barWidth = sliderRef.clientWidth;

    const newPercent = clamp(0, 1, (x - barPosition)/barWidth);
    props.onChange?.(newPercent);
    setPercent(newPercent);
  });

  return (
    <div
      className="volume-slider"
      ref={r => setSliderRef(r as HTMLDivElement)}
      // onClick={handleDrag}
      // onDrag={handleDrag}
      // draggable
      {...bind()}
    >
      <div className="slider-handle" ref={r => setHandleRef(r as HTMLDivElement)}></div>
    </div>
  );
}

function advanceSong(idx: number): number {
  const newSong = idx + 1;
  if (musicHowls[newSong]) {
    return newSong;
  }

  // Otherwise we need to reshuffle the songs
  const lastSong = musicHowls[idx];
  do {
    shuffle(musicHowls);
  } while (musicHowls[0] === lastSong);

  return 0;
}

export function GameMusic() {
  const [t] = useTranslation();

  useEffect(() => {
    // Make sure none are playing when the component starts
    // (This is mainly for development purposes lol)
    musicHowls.forEach(h => h.howl.stop());
    // shuffle(musicHowls);
  }, []);

  const [globalMute, setGlobalMute] = useState(true);
  const [currentSongIdx, setSong] = useState(0);
  const [showTitle, setShowTitle] = useState(false);

  const currentSong = musicHowls[currentSongIdx];
  const loadNextSong = () => {
    if (!globalMute) {
      if (currentSong.howl.state() === "unloaded") {
        currentSong.howl.load();
        currentSong.howl.once("load", () => {
          currentSong.howl.play();
          setShowTitle(true);
          setTimeout(() => setShowTitle(false), 6000);
        });
      } else {
        currentSong.howl.play();
        setShowTitle(true);
        setTimeout(() => setShowTitle(false), 6000);
      }

      currentSong.howl.once("end", () => {
        setSong(advanceSong(currentSongIdx));
      });
    }
  };

  useEffect(() => {
    loadNextSong();
  }, [currentSongIdx, globalMute]);

  const mute = (whether: boolean) => {
    Howler.mute(whether);
    setGlobalMute(whether);

    if (whether) {
      musicHowls.forEach(h => h.howl.stop());
    } else {
      // loadNextSong();
    }
  };

  return <>
    <div className="unlock-button">
      { globalMute
      ? <MutedSoundOutlined onClick={() => mute(false)} />
      : <SoundOutlined onClick={() => mute(true)} />
      }
      <div className="sliders">
        <VolumeSlider percent={musicHowls[0].howl.volume()}
          onChange={p => {
            musicHowls.forEach(h => h.howl.volume(p));
            localStorage.setItem("musicVolume", p.toString());
          }}/>
        <VolumeSlider percent={AudioSprites.volume()} onChange={p => {
          AudioSprites.volume(p);
          localStorage.setItem("sfxVolume", p.toString());
        }}/>
      </div>
    </div>
    {currentSong && <div className={clazz("audio-track", showTitle && "show")}>
      {currentSong.title}<br/>{t("audio.songBy", { artist: currentSong.artist })}
    </div>}
  </>;
}
