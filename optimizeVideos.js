// optimizeVideos.js
// Re-encodes every video in mediaData.json into a web-friendly MP4, fixing the
// two video bugs at the source:
//
//   1. "Duration keeps growing while watching" and "won't play on phones"
//      -> caused by the `moov` atom (the duration/seek index) sitting at the
//         END of the file. `-movflags +faststart` moves it to the front so the
//         browser knows the full length immediately and can start/seek right
//         away (mobile Safari/Chrome require this).
//
//   2. Huge downloads (originals run up to ~180 MB each, ~1 GB total) that are
//      unwatchable over mobile data -> re-encoded H.264 at a sane resolution
//      and bitrate, typically shrinking files by 80-95%.
//
// Originals are backed up next to each file as `<name>.orig.mp4` (once) before
// being overwritten, so nothing is lost.
//
// Requires ffmpeg + ffprobe on PATH (https://ffmpeg.org/).
//   node optimizeVideos.js            # encode all
//   node optimizeVideos.js --dry-run  # just list what would happen

import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";

const VIDEO_EXT = /\.(mp4|webm|ogg|mov|m4v)$/i;
const MAX_HEIGHT = 720;     // cap resolution for the web
const CRF = "28";           // 23 = high quality / 28 = smaller; tune to taste
const DRY_RUN = process.argv.includes("--dry-run");

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

function mb(bytes) { return (bytes / 1024 / 1024).toFixed(1) + " MB"; }

function run() {
    const mediaData = JSON.parse(fs.readFileSync("mediaData.json", "utf-8"));
    const videos = collectVideos(mediaData);

    let done = 0, skipped = 0, failed = 0, savedBytes = 0;
    console.log(`Found ${videos.length} videos.${DRY_RUN ? " (dry run)" : ""}`);

    for (const webPath of videos) {
        const srcPath = webPath.replace(/\//g, path.sep);
        if (!fs.existsSync(srcPath)) { console.warn(`  ! missing: ${webPath}`); failed++; continue; }

        const dir = path.dirname(srcPath);
        const ext = path.extname(srcPath);
        const base = path.basename(srcPath, ext);
        const backup = path.join(dir, `${base}.orig${ext}`);
        const tmp = path.join(dir, `${base}.opt.mp4`);

        // Already optimized (a backup exists) -> skip.
        if (fs.existsSync(backup)) { skipped++; continue; }

        const before = fs.statSync(srcPath).size;
        console.log(`  • ${webPath}  (${mb(before)})`);
        if (DRY_RUN) continue;

        try {
            execFileSync("ffmpeg", [
                "-y",
                "-i", srcPath,
                // cap height at MAX_HEIGHT, keep aspect, and force both
                // dimensions even (-2) — libx264/yuv420p rejects odd sizes
                "-vf", `scale=-2:'min(ih,${MAX_HEIGHT})':flags=lanczos`,
                "-c:v", "libx264", "-preset", "medium", "-crf", CRF,
                "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "128k",
                "-movflags", "+faststart",
                tmp,
            ], { stdio: "inherit" });

            fs.renameSync(srcPath, backup);   // keep the original
            fs.renameSync(tmp, srcPath);      // optimized takes the original's path

            const after = fs.statSync(srcPath).size;
            savedBytes += before - after;
            console.log(`    -> ${mb(after)} (saved ${mb(before - after)})`);
            done++;
        } catch (err) {
            if (fs.existsSync(tmp)) fs.rmSync(tmp);
            console.error(`  ! failed ${webPath}: ${err.message}`);
            failed++;
        }
    }

    console.log(`\nDone. ${done} encoded, ${skipped} already optimized, ${failed} failed. Saved ${mb(savedBytes)}.`);
    if (done) console.log("Originals saved as *.orig" + " files — delete them once you've verified playback.");
}

run();
