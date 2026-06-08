// generateVideoPosters.js
// Extracts a single poster frame from every video in mediaData.json and saves
// it as a WebP thumbnail under Assets/Thumbs (mirroring the media tree), so the
// project cards can show a real preview instead of a blank play button.
//
//   Assets/Media/Game Development/AR Path Finding/6.mp4
//   -> Assets/Thumbs/Game Development/AR Path Finding/6.webp
//
// The same path mapping is recreated in script.js (videoThumbFor()).
//
// A clean frame is grabbed a few seconds in with ffmpeg (to a temp PNG), then
// encoded to WebP with sharp — the exact same settings as generateThumbnails.js
// so video posters match image thumbnails in sharpness and colour.
//
// Requires ffmpeg + ffprobe on PATH (https://ffmpeg.org/) and sharp (npm).
//   node generateVideoPosters.js

import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import sharp from "sharp";

const VIDEO_EXT = /\.(mp4|webm|ogg|mov|m4v)$/i;
const THUMB_WIDTH = 500;
const THUMB_QUALITY = 82;
const TARGET_SECONDS = 3;   // grab a frame ~3s in (past black intros)

// Prefer the pre-compression original (`<name>.orig.<ext>`) as the frame
// source when it exists — sharper than the optimized 720p web copy.
function frameSourceFor(srcPath) {
    const ext = path.extname(srcPath);
    const orig = path.join(path.dirname(srcPath), path.basename(srcPath, ext) + ".orig" + ext);
    return fs.existsSync(orig) ? orig : srcPath;
}

function thumbWebPath(mediaWebPath) {
    return mediaWebPath
        .replace(/^Assets\/Media\//, "Assets/Thumbs/")
        .replace(/\.[^.]+$/, ".webp");
}

function collectVideos(obj, out = []) {
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (Array.isArray(val)) {
            for (const p of val) if (VIDEO_EXT.test(p)) out.push(p);
        } else if (val && typeof val === "object") {
            collectVideos(val, out);
        }
    }
    return out;
}

function probeDuration(srcPath) {
    try {
        const out = execFileSync("ffprobe", [
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            srcPath,
        ]).toString().trim();
        const d = parseFloat(out);
        return Number.isFinite(d) ? d : 0;
    } catch {
        return 0;
    }
}

async function run() {
    const mediaData = JSON.parse(fs.readFileSync("mediaData.json", "utf-8"));
    const videos = collectVideos(mediaData);

    let made = 0, skipped = 0, failed = 0;
    console.log(`Found ${videos.length} videos. Generating poster frames...`);

    for (const webPath of videos) {
        const srcPath = webPath.replace(/\//g, path.sep);
        const outPath = thumbWebPath(webPath).replace(/\//g, path.sep);

        if (!fs.existsSync(srcPath)) {
            console.warn(`  ! missing source: ${webPath}`);
            failed++;
            continue;
        }
        if (fs.existsSync(outPath) &&
            fs.statSync(outPath).mtimeMs >= fs.statSync(srcPath).mtimeMs) {
            skipped++;
            continue;
        }

        const frameSrc = frameSourceFor(srcPath);

        // Pick a sensible timestamp: ~3s in, but not past the midpoint of a
        // short clip (and never beyond the end).
        const dur = probeDuration(frameSrc);
        const t = dur > 0 ? Math.min(TARGET_SECONDS, dur * 0.4) : TARGET_SECONDS;

        const tmpPng = path.join(os.tmpdir(), `poster-${Date.now()}-${made}.png`);

        try {
            // Decode a single full frame to a lossless PNG (no quality loss here).
            execFileSync("ffmpeg", [
                "-y",
                "-ss", t.toFixed(2),
                "-i", frameSrc,
                "-frames:v", "1",
                "-q:v", "2",
                tmpPng,
            ], { stdio: "ignore" });

            // Encode to WebP exactly like the image thumbnails.
            fs.mkdirSync(path.dirname(outPath), { recursive: true });
            await sharp(tmpPng)
                .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
                .webp({ quality: THUMB_QUALITY })
                .toFile(outPath);

            made++;
        } catch (err) {
            console.error(`  ! failed ${webPath}: ${err.message}`);
            failed++;
        } finally {
            if (fs.existsSync(tmpPng)) fs.rmSync(tmpPng);
        }
    }

    console.log(`Done. ${made} created, ${skipped} up-to-date, ${failed} failed.`);
}

run();
