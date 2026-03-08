
import fs from 'fs';

const MOCK_PATH = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';
const CHEST_SCRAPED_PATH = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';
const LEGS_SCRAPED_PATH = 'c:/FEFV2/FitnexusV2/data/exercise/legs_data.json';

let updated = JSON.parse(fs.readFileSync(MOCK_PATH, 'utf8'));

const addOrUpdate = (list) => {
    for (const item of list) {
        const idx = updated.findIndex(ex => ex.slug === item.slug);
        if (idx !== -1) {
            updated[idx] = { ...updated[idx], ...item };
        } else {
            updated.push(item);
        }
    }
};

addOrUpdate(JSON.parse(fs.readFileSync(CHEST_SCRAPED_PATH, 'utf8')));
addOrUpdate(JSON.parse(fs.readFileSync(LEGS_SCRAPED_PATH, 'utf8')));

fs.writeFileSync(MOCK_PATH, JSON.stringify(updated, null, 2));
console.log('Successfully merged Chest and Legs data into mock_exercise.json');
