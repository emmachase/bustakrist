import { CiTwoTone } from "@ant-design/icons";
import { Howl, Howler } from "howler";
import spritesheet from "./spritesheet.json";
import music from "./music.json";
import { shuffle } from "../util/math";

const sprites: Record<string, [number, number]> = {};
for (const [key, s] of Object.entries(spritesheet.spritemap)) {
  sprites[key] = [s.start*1000, (s.end - s.start)*1000];
}

const musicVolume = +(localStorage.getItem("musicVolume") ?? 0.2);
const sfxVolume = +(localStorage.getItem("sfxVolume") ?? 0.8);

export const musicHowls = shuffle(music.map(m => {
  return {
    ...m,
    howl: new Howl({
      src: ["audio/" + m.filename],
      preload: false,
      volume: musicVolume,
    }),
  };
}));

// ls | xargs -I _ bash -c 'ffprobe _ 2>&1 | grep -E "artist|from|title"'

export const AudioSprites = new Howl({
  src: ["audio/0_spritesheet.ogg", "audio/0_spritesheet.m4a",
    "audio/0_spritesheet.mp3", "audio/0_spritesheet.ac3"],
  sprite: sprites,
  volume: sfxVolume,
});

export function playSound(spriteKey: keyof typeof spritesheet.spritemap) {
  AudioSprites.play(spriteKey);
}

Howler.mute(true); // Start muted
