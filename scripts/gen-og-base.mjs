/*******************************************************************************
 * Generate the branded background canvas for Open Graph / social share images.
 *
 * Produces a 1200x630 PNG at assets/og/og-base.png. Hugo overlays the page
 * title on top of this canvas at build time via `images.Text` (see
 * partials/seo/og-image). Pure Node (zlib only) so it needs no ImageMagick or
 * native modules — run with `node scripts/gen-og-base.mjs`.
 ******************************************************************************/
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const W = 1200;
const H = 630;

// Brand palette (mirrors the dark theme in src/styles/main.scss).
const BG_TOP = [0x10, 0x17, 0x1e]; // #10171e
const BG_BOTTOM = [0x16, 0x1f, 0x29]; // #161f29
const TEAL = [0x03, 0xda, 0xc6]; // #03dac6
const GREEN = [0x4d, 0xb1, 0x46]; // #4db146

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

// RGB pixel buffer.
const px = Buffer.alloc(W * H * 3);
const set = (x, y, [r, g, b]) => {
  const i = (y * W + x) * 3;
  px[i] = r;
  px[i + 1] = g;
  px[i + 2] = b;
};

for (let y = 0; y < H; y++) {
  const ty = y / (H - 1);
  // Vertical gradient base.
  const base = [
    lerp(BG_TOP[0], BG_BOTTOM[0], ty),
    lerp(BG_TOP[1], BG_BOTTOM[1], ty),
    lerp(BG_TOP[2], BG_BOTTOM[2], ty),
  ];
  for (let x = 0; x < W; x++) {
    let color = base;

    // Soft teal glow radiating from the bottom-right corner.
    const dx = (x - W) / W;
    const dy = (y - H) / H;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const glow = Math.max(0, 1 - dist * 1.35) * 0.18;
    if (glow > 0) {
      color = [
        lerp(color[0], TEAL[0], glow),
        lerp(color[1], TEAL[1], glow),
        lerp(color[2], TEAL[2], glow),
      ];
    }

    set(x, y, color);
  }
}

// Left accent bar: teal fading into green (brand gradient).
const BAR_W = 14;
for (let y = 0; y < H; y++) {
  const t = y / (H - 1);
  const c = [
    lerp(TEAL[0], GREEN[0], t),
    lerp(TEAL[1], GREEN[1], t),
    lerp(TEAL[2], GREEN[2], t),
  ];
  for (let x = 0; x < BAR_W; x++) set(x, y, c);
}

// Thin baseline rule near the footer where the author byline sits.
const RULE_Y = 520;
for (let x = 80; x < W - 80; x++) {
  for (let y = RULE_Y; y < RULE_Y + 2; y++) set(x, y, [0x36, 0x40, 0x4c]);
}

// --- PNG encoding (color type 2, 8-bit RGB) ------------------------------
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
};

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type: truecolor
// compression, filter, interlace all default 0.

// Prepend a filter byte (0 = none) to each scanline.
const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) {
  raw[y * (1 + W * 3)] = 0;
  px.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

mkdirSync('assets/og', { recursive: true });
writeFileSync('assets/og/og-base.png', png);
console.log(`Wrote assets/og/og-base.png (${W}x${H}, ${png.length} bytes)`);
