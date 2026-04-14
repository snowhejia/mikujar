/**
 * 本地自检：node scripts/heic-decode-selftest.mjs [path/to/file.heic]
 * 需 PATH 上为较新的 ffmpeg/ffprobe（约 6.1+），否则 HEIF 瓦片可能仍为小方块。
 */
import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { tryHeifLikeToJpegViaFfmpeg } from "../src/mediaUpload.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultSample = join(__dirname, "../../test/9AFD0AA5-F4FC-49BA-8F96-E03E795D409E.heic");
const path = process.argv[2] || defaultSample;
const buf = await readFile(path);
const r = await tryHeifLikeToJpegViaFfmpeg(buf);
if (!r) {
  console.error("decode failed (null)");
  process.exit(1);
}
const m = await sharp(r.buffer).metadata();
console.log("jpeg out:", m.width, "x", m.height);
