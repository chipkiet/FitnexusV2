Exercise data import quick guide

compute popularity score
node scripts/compute_popularity_score.js

prepare normalized data
npm run xwalk:prepare

import exercises
npm run xwalk:import

import instruction steps from json
node scripts/import_exercise_steps_json.js

generate image_exercises preview
node scripts/import-image-exercise-from-data.js

commit images to database
node scripts/import-image-exercise-from-data.js --commit

