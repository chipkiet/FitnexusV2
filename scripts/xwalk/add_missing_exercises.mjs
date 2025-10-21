#!/usr/bin/env node
/*
  Add/merge 6 missing exercises (by slug) into data/xwalk/xwalk_exercise.import.json
*/
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const filePath = path.join(root, 'data/xwalk/xwalk_exercise.import.json');

function readJson(p){ return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeJson(p, obj){ fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8'); }

const MISSING = [
  {
    slug: 'sled-45-leg-press',
    name: 'Máy ép chân 45°',
    name_en: 'Sled 45° Leg Press',
    description: null,
    gif_demo_url: null,
    primary_video_url: null,
    thumbnail_url: null,
    equipment_needed: 'machine',
    bodyparts_keys: ['legs'],
    target_muscle_slugs: ['quadriceps'],
    secondary_muscle_slugs: ['gluteus-maximus','hamstrings']
  },
  {
    slug: 'sled-45-leg-wide-press',
    name: 'Máy ép chân 45° (chân rộng)',
    name_en: 'Sled 45° Leg Wide Press',
    description: null,
    gif_demo_url: null,
    primary_video_url: null,
    thumbnail_url: null,
    equipment_needed: 'machine',
    bodyparts_keys: ['legs'],
    target_muscle_slugs: ['quadriceps'],
    secondary_muscle_slugs: ['hip-adductors','gluteus-maximus','hamstrings']
  },
  {
    slug: 'sled-45-leg-press-back-pov',
    name: 'Máy ép chân 45° (góc nhìn sau lưng)',
    name_en: 'Sled 45° Leg Press (Back POV)',
    description: null,
    gif_demo_url: null,
    primary_video_url: null,
    thumbnail_url: null,
    equipment_needed: 'machine',
    bodyparts_keys: ['legs'],
    target_muscle_slugs: ['quadriceps'],
    secondary_muscle_slugs: ['gluteus-maximus','hamstrings']
  },
  {
    slug: 'sled-45-calf-press',
    name: 'Máy ép bắp chân 45°',
    name_en: 'Sled 45° Calf Press',
    description: null,
    gif_demo_url: null,
    primary_video_url: null,
    thumbnail_url: null,
    equipment_needed: 'machine',
    bodyparts_keys: ['legs'],
    target_muscle_slugs: ['gastrocnemius'],
    secondary_muscle_slugs: ['soleus']
  },
  {
    slug: 'dumbbell-rear-delt-rowshoulder',
    name: 'Tạ tay kéo sau vai (rear delt row)',
    name_en: 'Dumbbell Rear Delt Row (Shoulder)',
    description: null,
    gif_demo_url: null,
    primary_video_url: null,
    thumbnail_url: null,
    equipment_needed: 'dumbbell',
    bodyparts_keys: ['shoulders','back'],
    target_muscle_slugs: ['posterior-deltoid'],
    secondary_muscle_slugs: ['rhomboids','trapezius']
  },
  {
    slug: 'sled-45-leg-wide-press---blunt-variation',
    name: 'Máy ép chân 45° (biến thể chân rộng)',
    name_en: 'Sled 45° Leg Wide Press — Variation',
    description: null,
    gif_demo_url: null,
    primary_video_url: null,
    thumbnail_url: null,
    equipment_needed: 'machine',
    bodyparts_keys: ['legs'],
    target_muscle_slugs: ['quadriceps'],
    secondary_muscle_slugs: ['hip-adductors','gluteus-maximus','hamstrings']
  }
];

function main(){
  if (!fs.existsSync(filePath)){
    console.error('Missing import file at', filePath);
    process.exit(1);
  }
  const arr = readJson(filePath);
  const bySlug = new Map(arr.map(x => [x.slug, x]));
  let added = 0;
  for (const row of MISSING){
    if (bySlug.has(row.slug)) continue;
    arr.push(row);
    added += 1;
  }
  writeJson(filePath, arr);
  console.log(`Merged ${added} missing exercises -> ${filePath}`);
}

main();

