// generateMediaJSON.js
// run: node generateMediaJSON.js

import fs from "fs";
import path from "path";

const ROOT_MEDIA = path.join("Assets", "Media");

// valid media extensions
const VALID_EXT = /\.(png|jpe?g|gif|webp|mp4|webm|ogg)$/i;

// this sorts "1.jpg", "2.png", "10.mp4", "1_1x.jpg" in the right order
function sortMediaFiles(files) {
    return files.sort((a, b) => {
        // extract leading number
        const getNum = (name) => {
            const m = name.match(/^(\d+)/);
            return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
        };
        const na = getNum(a);
        const nb = getNum(b);
        if (na !== nb) return na - nb;
        // if same leading number, just alphabetical
        return a.localeCompare(b);
    });
}

function buildMediaMap(rootDir) {
    const result = {};

    // top-level = 5 categories
    const categories = fs.readdirSync(rootDir);

    for (const category of categories) {
        const categoryPath = path.join(rootDir, category);
        if (!fs.lstatSync(categoryPath).isDirectory()) continue;

        // init category
        result[category] = {};

        // project folders inside category
        const projects = fs.readdirSync(categoryPath);
        for (const project of projects) {
            const projectPath = path.join(categoryPath, project);
            if (!fs.lstatSync(projectPath).isDirectory()) continue;

            // media files
            const mediaFiles = fs
                .readdirSync(projectPath)
                .filter((f) => VALID_EXT.test(f));

            const sortedMedia = sortMediaFiles(mediaFiles).map((filename) =>
                // make it a web-friendly path
                path
                    .join("Assets", "Media", category, project, filename)
                    .replace(/\\/g, "/")
            );

            result[category][project] = sortedMedia;
        }
    }

    return result;
}

const mediaMap = buildMediaMap(ROOT_MEDIA);
fs.writeFileSync("mediaData.json", JSON.stringify(mediaMap, null, 2), "utf-8");
console.log("mediaData.json generated.");
