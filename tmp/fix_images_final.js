
import fs from 'fs';

const mockPath = 'c:/FEFV2/FitnexusV2/data/exercise/mock_exercise.json';
const mainPath = 'c:/FEFV2/FitnexusV2/data/exercise/musclewiki_data.json';

function getYoutubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function fixData(path) {
    if (!fs.existsSync(path)) return;
    let data = JSON.parse(fs.readFileSync(path, 'utf8'));

    data = data.map(ex => {
        let thumb = ex.thumbnail_url || ex.imageUrl;

        // 1. Try YouTube first
        const ytId = getYoutubeId(ex.primary_video_url || ex.video_url);
        if (ytId) {
            thumb = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }
        // 2. If it's a broken mp4, try to derive from slug
        else if (thumb && thumb.endsWith('.mp4')) {
            // Pattern: https://media.musclewiki.com/media/uploads/og-male-[slug]-front.jpg
            // Note: Use the exercise slug, but MuscleWiki is tricky.
            // Let's use a very common one: 
            thumb = `https://media.musclewiki.com/media/uploads/og-male-${ex.slug}-front.jpg`;
        }

        // Ensure no .mp4 in thumbnail_url
        if (thumb && thumb.endsWith('.mp4')) {
            thumb = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=500"; // Fallback fitness image
        }

        return { ...ex, thumbnail_url: thumb, imageUrl: thumb };
    });

    fs.writeFileSync(path, JSON.stringify(data, null, 4));
    console.log(`Fixed thumbnails in ${path}`);
}

fixData(mockPath);
fixData(mainPath);
