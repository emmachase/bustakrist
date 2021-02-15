export class Color {
  public r: number
  public g: number
  public b: number

  public constructor(str: string);
  public constructor(r: number, g: number, b: number);
  public constructor(strOrR: string | number, g?: number, b?: number) {
    if (typeof strOrR === "string") {
      const hex = Number.parseInt(strOrR.match(/[^#]+/)![0], 16);
      this.r = hex >> 4*4;
      this.g = hex >> 2*4 & 0xFF;
      this.b = hex        & 0xFF;
    } else {
      this.r = strOrR;
      this.g = g as number;
      this.b = b as number;
    }
  }

  public asHSV(): HSVColor {
    return new HSVColor(this);
  }

  private formatHex(x: number): string {
    return x.toString(16).padStart(2, "0");
  }

  public toString() {
    return ("#" +
      this.formatHex(Math.round(this.r)) +
      this.formatHex(Math.round(this.g)) +
      this.formatHex(Math.round(this.b))
    );
  }
}

export class HSVColor {
  public h: number
  public s: number
  public v: number

  public constructor(src: Color);
  public constructor(h: number, s: number, v: number);
  public constructor(srcOrH: Color | number, s?: number, v?: number) {
    if (typeof srcOrH === "number") {
      this.h = srcOrH;
      this.s = s as number;
      this.v = v as number;
    } else {
      let { r, g, b } = srcOrH;
      r /= 255; g /= 255; b /= 255;

      // h, s, v = hue, saturation, value
      const cmax = Math.max(r, g, b); // maximum of r, g, b
      const cmin = Math.min(r, g, b); // minimum of r, g, b
      const diff = cmax-cmin;         // diff of cmax and cmin.

      // if cmax and cmax are equal then h = 0
      this.h = 0;
      if (cmax === cmin)
        this.h = 0;

      // if cmax equal r then compute h
      else if (cmax === r)
        this.h = (60 * ((g - b) / diff) + 360) % 360;

      // if cmax equal g then compute h
      else if (cmax == g)
        this.h = (60 * ((b - r) / diff) + 120) % 360;

      // if cmax equal b then compute h
      else if (cmax == b)
        this.h = (60 * ((r - g) / diff) + 240) % 360;

      // if cmax equal zero
      if (cmax === 0) this.s = 0;
      else this.s = (diff / cmax);

      // compute v
      this.v = cmax;

      // normalize h
      this.h /= 360;
    }
  }

  public asRGB(): Color {
    const out = new Color(0, 0, 0);

    if (this.s <= 0.0) {
      out.r = this.v;
      out.g = this.v;
      out.b = this.v;
      return out;
    }

    let hh = this.h*360.0;
    if (hh >= 360.0) hh = 0.0;

    hh /= 60.0;
    const i = hh | 0;
    const ff = hh - i;
    const p = this.v * (1.0 - this.s);
    const q = this.v * (1.0 - (this.s * ff));
    const t = this.v * (1.0 - (this.s * (1.0 - ff)));

    switch (i) {
      case 0:
        out.r = this.v;
        out.g = t;
        out.b = p;
        break;
      case 1:
        out.r = q;
        out.g = this.v;
        out.b = p;
        break;
      case 2:
        out.r = p;
        out.g = this.v;
        out.b = t;
        break;
      case 3:
        out.r = p;
        out.g = q;
        out.b = this.v;
        break;
      case 4:
        out.r = t;
        out.g = p;
        out.b = this.v;
        break;
      case 5:
      default:
        out.r = this.v;
        out.g = p;
        out.b = q;
        break;
    }

    out.r *= 255;
    out.g *= 255;
    out.b *= 255;

    return out;
  }

  public multSaturation(multiplier: number): HSVColor {
    this.s *= multiplier;
    return this;
  }

  public multValue(multiplier: number): HSVColor {
    this.v *= multiplier;
    return this;
  }
}

export function smartHSVLerp(a: HSVColor, b: HSVColor, t: number): HSVColor {
  // Hue interpolation
  let h: number;
  let d = b.h - a.h;
  if (a.h > b.h) {
    // Swap (a.h, b.h)
    const h3 = b.h;
    b.h = a.h;
    a.h = h3;

    d = -d;
    t = 1 - t;
  }

  if (d > 0.5) { // 180deg
    a.h = a.h + 1; // 360deg
    h = ( a.h + t * (b.h - a.h) ) % 1; // 360deg
  } else { // 180deg
    h = a.h + t * d;
  }

  // Interpolates the rest
  return new HSVColor(
      h,                    // H
      a.s + t * (b.s-a.s),  // S
      a.v + t * (b.v-a.v),  // V
      // a.a + t * (b.a-a.a),  // A
  );
}

export type HardColorStop = [number, string];
export type ColorStop = string | HardColorStop;

/**
 * Transform an implicit color stop list to an explicit one.
 * Example: [a, b, [0.7, c], d, e, f]
 *  => [[0, a], [0.35, b], [0.7, c], [0.8, d], [0.9, e], [1, f]]
 *
 * @param {ColorStop[]} stops - The color stops to be sanitized by interpolation
 */
export function sanitizeStops(stops: ColorStop[]): HardColorStop[] {
  const result: HardColorStop[] = [];

  let c;
  let last = null;
  let idx = 0;
  while ((c = stops[idx])) {
    if (typeof c === "string") {
      // Check for first element, which will always be zero
      if (last === null) {
        result.push([0, c]);
        last = 0;
        idx += 1;
        continue;
      }

      // Count run of non-explicit stops
      let next;
      let runLength = 1;
      while (typeof (next = stops[idx + runLength]) === "string") runLength++;

      // Fill in the gaps
      if (next) next = next[0];
      for (let i = 0; i < runLength; i++) {
        result.push([
          next
            ? last + (next - last)*((i + 1)/(runLength + 1))
            : last + (1    - last)*((i + 1)/ runLength),
          stops[idx + i] as string,
        ]);
      }

      // Advance
      idx += runLength;
      last = result[idx - 1][0];
    } else {
      // Trivial case, just trust the caller.
      result.push(c);
      last = c[0];
      idx += 1;
    }
  }

  return result;
}

export function lazyLerpColors(stops: ColorStop[], alpha: number): string {
  return lerpColors(sanitizeStops(stops), alpha);
}

export function lerpColors(stops: HardColorStop[], alpha: number): string {
  alpha = Math.min(1, Math.max(0, alpha));

  let idx = 0;
  while (alpha > stops[idx][0]) idx++;

  if (idx === 0) return stops[idx][1];

  const a = stops[idx - 1]; const ac = new Color(a[1]).asHSV();
  const b = stops[idx];     const bc = new Color(b[1]).asHSV();

  const alphaDiff = b[0] - a[0];
  const result = smartHSVLerp(ac, bc, (alpha - a[0]) / alphaDiff);
  return result.asRGB().toString();
}

export function lerpColorsRGB(stops: HardColorStop[], alpha: number): string {
  alpha = Math.min(1, Math.max(0, alpha));

  let idx = 0;
  while (alpha > stops[idx][0]) idx++;

  if (idx === 0) return stops[idx][1];

  const a = stops[idx - 1]; const ac = new Color(a[1]);
  const b = stops[idx];     const bc = new Color(b[1]);

  const alphaDiff = (alpha - a[0]) / (b[0] - a[0]);
  const result = new Color(
      ac.r + alphaDiff*(bc.r - ac.r),
      ac.g + alphaDiff*(bc.g - ac.g),
      ac.b + alphaDiff*(bc.b - ac.b),
  );

  return result.toString();
}
