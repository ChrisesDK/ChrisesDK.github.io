// generateThumbnails.js
// Generates small WebP thumbnails for every image in mediaData.json so the
// project cards load fast. Full-res files are only ever fetched inside the
// modal viewer.
//
// run: node generateThumbnails.js
//
// Thumbnails mirror the Media tree under Assets/Thumbs and always use a .webp
// extension, e.g.
//   Assets/Media/Game Development/Bachelor Project/1.png
//   -> Assets/Thumbs/Game Development/Bachelor Project/1.webp
// The same path mapping is recreated in script.js (thumbFor()).

import fs from "fs";
import path from "path";
import sharp from "sharp";

const MEDIA_ROOT = path.join("Assets", "Media");
const THUMB_ROOT = path.join("Assets", "Thumbs");

const THUMB_WIDTH = 500;   // plenty for a ~360px card on retina screens
const THUMB_QUALITY = 72;

const IMAGE_EXT = /\.(png|jpe?g|gif|webp)$/i;

// Web path (Assets/Media/...) -> thumbnail web path (Assets/Thumbs/....webp)
function thumbWebPath(mediaWebPath) {
    return mediaWebPath
        .replace(/^Assets\/Media\//, "Assets/Thumbs/")
        .replace(/\.[^.]+$/, ".webp");
}

function collectImages(obj, out = []) {
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (Array.isArray(val)) {
            for (const p of val) if (IMAGE_EXT.test(p)) out.push(p);
        } else if (val && typeof val === "object") {
            collectImages(val, out);
        }
    }
    return out;
}

async function run() {
    const mediaData = JSON.parse(fs.readFileSync("mediaData.json", "utf-8"));
    const images = collectImages(mediaData);

    let made = 0;
    let skipped = 0;
    let failed = 0;

    console.log(`Found ${images.length} images. Generating thumbnails...`);

    for (const webPath of images) {
        const srcPath = webPath.replace(/\//g, path.sep);
        const outWeb = thumbWebPath(webPath);
        const outPath = outWeb.replace(/\//g, path.sep);

        if (!fs.existsSync(srcPath)) {
            console.warn(`  ! missing source: ${webPath}`);
            failed++;
            continue;
        }

        // Skip if an up-to-date thumbnail already exists (incremental runs).
        if (fs.existsSync(outPath)) {
            if (fs.statSync(outPath).mtimeMs >= fs.statSync(srcPath).mtimeMs) {
                skipped++;
                continue;
            }
        }

        fs.mkdirSync(path.dirname(outPath), { recursive: true });

        try {
            await sharp(srcPath)
                .rotate() // respect EXIF orientation
                .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
                .webp({ quality: THUMB_QUALITY })
                .toFile(outPath);
            made++;
            if (made % 50 === 0) console.log(`  ...${made} created`);
        } catch (err) {
            console.error(`  ! failed ${webPath}: ${err.message}`);
            failed++;
        }
    }

    console.log(
        `Done. ${made} created, ${skipped} up-to-date, ${failed} failed.`
    );
}

run();
