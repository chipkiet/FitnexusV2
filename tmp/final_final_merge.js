
import fs from 'fs';

const MOCK_PATH = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';
const CHEST = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';
const LEGS = 'c:/FEFV2/FitnexusV2/data/exercise/legs_data.json';
const BACK_SHOULDERS = 'c:/FEFV2/FitnexusV2/data/exercise/back_shoulders_data.json';

let updated = JSON.parse(fs.readFileSync(MOCK_PATH, 'utf8'));

const addOrUpdate = (path) => {
    const list = JSON.parse(fs.readFileSync(path, 'utf8'));
    for (const item of list) {
        const idx = updated.findIndex(ex => ex.slug === item.slug);
        if (idx !== -1) {
            updated[idx] = { ...updated[idx], ...item };
        } else {
            updated.push(item);
        }
    }
};

addOrUpdate(CHEST);
addOrUpdate(LEGS);
addOrUpdate(BACK_SHOULDERS);

fs.writeFileSync(MOCK_PATH, JSON.stringify(updated, null, 2));
console.log('Final merge complete!');
