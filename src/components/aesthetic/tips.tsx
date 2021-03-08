import { FC, MutableRefObject, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useAnimationFrame from "use-animation-frame";
import { useElementSize } from "../../hooks/resize";
import { AlertStream, TipStream, TipToStream } from "../../meta/connection";
import { DepositStream } from "../../layout/modal/PlayerModal";

const imageShrink = 8;
function drawRotated(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  radians: number,
) {
  context.save();
  context.translate(x, y);
  context.rotate(radians);
  context.drawImage(
    image,
    -image.width/(imageShrink*2),
    -image.height/(imageShrink*2),
    image.width/imageShrink,
    image.height/imageShrink,
  );
  context.restore();
}

class FallingKrist {
  public x = Math.random();
  public y = -Math.random()*0.5;
  public r = Math.random()*Math.PI*2;

  private gravity = 0.5 + Math.random()*0.5;
  private velY = 0.0;
  private velR = 5+5*Math.random();

  public update(dt: number) {
    this.y += dt*this.velY;
    this.velY += dt*this.gravity;
    this.r += dt*this.velR;
  }
}

class TipCredit {
  private static FLASH_TIME = 4;
  public progress = -0.2;

  public constructor(public from: string, public amount: string) {}

  public update(dt: number) {
    this.progress += dt / TipCredit.FLASH_TIME;
  }

  public getPosition(): number {
    return 16*(this.progress - 0.5)**5 + 0.5;
  }
}

class ToastText {
  private FLASH_TIME = 2;
  public progress = -0.2;

  public constructor(public text: string, time?: number) {
    if (time) {
      this.FLASH_TIME = time;
    }
  }

  public update(dt: number) {
    this.progress += dt / this.FLASH_TIME;
  }

  public getPosition(): number {
    return -((2*this.progress - 1)**2) + 1;
  }
}

export const TipOverlay: FC = () => {
  const [t] = useTranslation();
  const [wrapper, setWrapper] = useState<HTMLElement>();
  const { w, h } = useElementSize(wrapper);

  const kristy = useMemo(() => {
    const im = new Image();
    im.src = "/krist.webp";

    return im;
  }, []);

  const credits = useRef<TipCredit[]>([]);
  const toCredits = useRef<ToastText[]>([]);
  const particles = useRef<FallingKrist[]>([]);
  useEffect(() => {
    return TipStream.subscribe(tip => {
      const amt = Math.min(tip.amount / 100, 200);
      for (let i = 0; i < Math.ceil(amt); i++) {
        particles.current.push(new FallingKrist());
      }

      credits.current.push(new TipCredit(tip.from, (tip.amount / 100).toLocaleString()));
    });
  });

  useEffect(() => {
    return TipToStream.subscribe(tip => {
      const to = tip.to;
      const amount = (tip.amount / 100).toLocaleString();
      const text = t("game.tipper", { to, amount });
      toCredits.current.push(new ToastText(text));
    });
  });

  useEffect(() => {
    return AlertStream.subscribe(() => {
      toCredits.current.push(new ToastText(t("errors.autoCashout"), 5));
    });
  });

  useEffect(() => {
    return DepositStream.subscribe(next => {
      toCredits.current.push(new ToastText(t("game.withdrew", { amount: next.amount }), 3));
    });
  });

  const canvas = useRef<HTMLCanvasElement>() as MutableRefObject<HTMLCanvasElement>;
  useAnimationFrame(frame => {
    if (!canvas.current) return;
    const cw = canvas.current.width;
    const ch = canvas.current.height;

    const complete = kristy.complete && kristy.naturalHeight !== 0;
    if (!complete) return; // Can't draw anything if the image hasn't loaded

    const ctx = canvas.current.getContext("2d")!;
    ctx.clearRect(0, 0, cw, ch);

    // Update the kristies
    ctx.shadowColor = "#55ff5599";
    ctx.shadowBlur = 12;
    particles.current = particles.current.filter(p => p.y < 1.5);
    particles.current.forEach(p => {
      drawRotated(ctx, kristy,
        p.x * cw,
        p.y * ch - 50,
        p.r,
      );
      p.update(frame.delta);
    });

    // Credit from
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff99";
    ctx.font = "italic bold 48px Roboto";

    ctx.shadowColor = "#ffffff99";
    ctx.shadowBlur = 16;

    credits.current = credits.current.filter(c => c.progress < 1.2);
    credits.current.forEach(c => {
      ctx.fillText(
        t("game.tipped", { from: c.from, amount: c.amount }),
        cw*c.getPosition(),
        ch*0.2,
      );
      c.update(frame.delta);
    });

    // Credit to
    ctx.font = "italic bold 20px Roboto";

    ctx.shadowColor = "#ffffff99";
    ctx.shadowBlur = 16;

    toCredits.current = toCredits.current.filter(c => c.progress < 1.2);
    toCredits.current.forEach(c => {
      ctx.fillText(
        c.text,
        cw*0.5,
        ch - 30*c.getPosition(),
      );
      c.update(frame.delta);
    });
  });

  return (
    <div className="tip-overlay" ref={r => setWrapper(r!)}>
      <canvas width={w} height={h} ref={canvas}></canvas>
    </div>
  );
};
