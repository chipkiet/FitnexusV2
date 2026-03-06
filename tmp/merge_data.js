
import fs from 'fs';
import path from 'path';

const MOCK_PATH = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';
const SCRAPED_PATH = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';

const mockExercises = JSON.parse(fs.readFileSync(MOCK_PATH, 'utf8'));
const scrapedExercises = JSON.parse(fs.readFileSync(SCRAPED_PATH, 'utf8'));

// Update existing if exists by slug, else add
const updated = [...mockExercises];

for (const scraped of scrapedExercises) {
    const idx = updated.findIndex(ex => ex.slug === scraped.slug);
    if (idx !== -1) {
        updated[idx] = { ...updated[idx], ...scraped };
    } else {
        updated.push(scraped);
    }
}

fs.writeFileSync(MOCK_PATH, JSON.stringify(updated, null, 2));
console.log('Merged scraped data into mock_exercise.json');
