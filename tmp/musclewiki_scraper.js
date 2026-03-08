import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function scrapeExercise(url) {
    try {
        console.log(`Scraping: ${url}`);
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const name_en = $('h1').text().trim();
        const slug = url.split('/').pop().split('?')[0];
        const difficulty = $('.exercise-difficulty').text().trim().toLowerCase() || 'beginner';
        const equipment = $('.exercise-equipment').text().trim().toLowerCase();

        // Exercise type logic (Compound if more than 1 primary muscle or if it feels like one)
        const exercise_type = equipment === 'bodyweight' && !name_en.toLowerCase().includes('press') ? 'isolation' : 'compound';

        const instructions = [];
        $('.exercise-instructions ol li').each((i, el) => {
            instructions.push({
                step_number: i + 1,
                instruction_text: $(el).text().trim()
            });
        });

        const video_url = $('video source').first().attr('src') || '';
        const extra_videos = [];
        $('video source').each((i, el) => {
            if (i > 0) {
                extra_videos.push({
                    file: $(el).attr('src'),
                    title: `Góc nhìn ${i + 1}`
                });
            }
        });

        const primary = [];
        $('.primary-muscles .muscle-name').each((i, el) => primary.push($(el).text().trim().toLowerCase()));

        const secondary = [];
        $('.secondary-muscles .muscle-name').each((i, el) => secondary.push($(el).text().trim().toLowerCase()));

        return {
            slug,
            name_en,
            difficulty_level: difficulty,
            exercise_type,
            equipment_needed: equipment,
            video_url,
            primary_video_url: video_url,
            thumbnail_url: video_url,
            extra_videos,
            source_name: 'MuscleWiki',
            source_url: url,
            instructions,
            muscles_raw: { primary, secondary }
        };
    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        return null;
    }
}

const urls = [
    'https://musclewiki.com/exercise/dumbbell-seated-overhead-press',
    'https://musclewiki.com/exercise/cable-low-single-arm-lateral-raise',
    'https://musclewiki.com/exercise/elevated-pike-press',
    'https://musclewiki.com/exercise/dumbbell-seated-rear-delt-fly'
];

(async () => {
    const results = [];
    for (const url of urls) {
        const data = await scrapeExercise(url);
        if (data) results.push(data);
    }
    fs.writeFileSync('tmp/scraped_results.json', JSON.stringify(results, null, 2));
    console.log('Saved results to tmp/scraped_results.json');
})();
