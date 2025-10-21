#!/usr/bin/env node
/*
  Convert providers/jefit/exercises.normalized.json to xwalk_exercise.import.json
  for consumption by scripts/import_exercises.js
*/
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const normalizedPath = path.join(root, 'data/xwalk/providers/jefit/exercises.normalized.json');
const outPath = path.join(root, 'data/xwalk/xwalk_exercise.import.json');

function readJson(p){ return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeJson(p, obj){ fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8'); }

function toImportRow(n){
  return {
    slug: n.slug,
    name: n.name || n.name_en,
    name_en: n.name_en || n.name,
    description: n.description || null,
    gif_demo_url: n.gif_url || null,
    primary_video_url: n.primary_video_url || null,
    thumbnail_url: n.thumbnail_url || null,
    equipment_needed: n.equipment_key || null,
    bodyparts_keys: Array.isArray(n.bodyparts_keys) ? n.bodyparts_keys : [],
    target_muscle_slugs: Array.isArray(n.target_muscle_slugs) ? n.target_muscle_slugs : [],
    secondary_muscle_slugs: Array.isArray(n.secondary_muscle_slugs) ? n.secondary_muscle_slugs : [],
  };
}

function main(){
  if (!fs.existsSync(normalizedPath)) {
    console.error('Missing normalized file at', normalizedPath);
    process.exit(1);
  }
  const list = readJson(normalizedPath);
  const out = list.map(toImportRow);
  writeJson(outPath, out);
  console.log(`Wrote ${out.length} rows -> ${outPath}`);
}

main();

