
import axios from 'axios';

const url = process.argv[2] || 'https://musclewiki.com/exercise/barbell-bench-press';

async function check() {
    try {
        const res = await axios.get(url);
        const matches = res.data.match(/poster="([^"]+)"/i);
        if (matches) console.log('Poster:', matches[1]);
        const ogImage = res.data.match(/property="og:image" content="([^"]+)"/i);
        if (ogImage) console.log('OG Image:', ogImage[1]);
    } catch (e) {
        console.error(e.message);
    }
}
check();
