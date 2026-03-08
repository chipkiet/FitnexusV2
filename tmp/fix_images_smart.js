
import fs from 'fs';
import axios from 'axios';

const mockPath = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';
const mainPath = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';

async function getBestImage(ex) {
    // 1. YouTube check
    const ytUrl = ex.primary_video_url || ex.video_url || "";
    const ytIdMatch = ytUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([a-zA-Z0-9_-]{11})/);
    if (ytIdMatch) {
        return `https://img.youtube.com/vi/${ytIdMatch[1]}/hqdefault.jpg`;
    }

    // 2. Scrape MuscleWiki page for og:image
    try {
        const pageUrl = `https://musclewiki.com/exercise/${ex.slug}`;
        const res = await axios.get(pageUrl, { timeout: 5000 });
        const ogMatch = res.data.match(/property="og:image" content="([^"]+)"/i);
        if (ogMatch) return ogMatch[1];
    } catch (e) {
        console.warn(`Failed to scrape ${ex.slug}: ${e.message}`);
    }

    // 3. Fallback pattern
    return `https://media.musclewiki.com/media/uploads/og-male-${ex.slug}-front.jpg`;
}

async function run() {
    for (const path of [mockPath, mainPath]) {
        if (!fs.existsSync(path)) continue;
        const data = JSON.parse(fs.readFileSync(path, 'utf8'));
        const newData = [];

        console.log(`Processing ${data.length} exercises in ${path}...`);

        for (const ex of data) {
            const img = await getBestImage(ex);
            newData.push({ ...ex, thumbnail_url: img, imageUrl: img });
            // Add a small delay to avoid rate limits
            await new Promise(r => setTimeout(r, 100));
        }

        fs.writeFileSync(path, JSON.stringify(newData, null, 4));
        console.log(`Updated ${path}`);
    }
}

run();
