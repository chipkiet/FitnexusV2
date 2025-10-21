#!/usr/bin/env node
/*
  Normalize JEFIT raw data into providers/jefit/exercises.normalized.json
  - Input: data/xwalk/providers/jefit/raw/*.json (array of exercises), or a single file path via --in
  - Output: data/xwalk/providers/jefit/exercises.normalized.json (VN preferred)
  - Uses alias maps to resolve primary/secondary muscles to canonical slugs
*/
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const inArgIdx = process.argv.indexOf('--in');
const inputPath = inArgIdx >= 0 ? process.argv[inArgIdx + 1] : null;
const rawDir = path.join(root, 'data/xwalk/providers/jefit/raw');
const outPath = path.join(root, 'data/xwalk/providers/jefit/exercises.normalized.json');

const baseAliasPath = path.join(root, 'data/xwalk/muscle_alias_map.json');
const jefitAliasPath = path.join(root, 'data/xwalk/providers/jefit/muscle_alias_map.jefit.json');

function readJson(p){ return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeJson(p, obj){ fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf8'); }

function toSlug(str = ''){
  return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().trim().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-');
}

function buildAliasMap(){
  const base = readJson(baseAliasPath);
  const jefit = fs.existsSync(jefitAliasPath) ? readJson(jefitAliasPath) : {};
  const map = new Map();
  for (const [k, v] of Object.entries(base)) map.set(k.toLowerCase(), v);
  for (const [k, v] of Object.entries(jefit)) map.set(k.toLowerCase(), v);
  return map;
}

function resolveAliasesToSlugs(aliasMap, aliases = []){
  const out = [];
  for (const a of aliases || []){
    const key = String(a).toLowerCase().replace(/\s+/g,'-');
    const mapped = aliasMap.get(key);
    if (Array.isArray(mapped)) {
      for (const v of mapped) if (!out.includes(v)) out.push(v);
    }
  }
  return out;
}

function normalizeOne(row, aliasMap){
  // Support multiple raw field shapes by defensive access
  const nameEn = row.name_en || row.nameEN || row.name || '';
  const nameVi = row.name_vi || row.name_vi_vn || row.name_vi_vietnamese || row.name_vi || row.name_vn || row.name_vi || row.name_vi || null;
  const displayName = row.name || nameVi || nameEn;
  const slug = row.slug || toSlug(nameEn);
  const primaryAliases = row.primary_muscles || row.target_muscles || row.primary_muscle_aliases || [];
  const secondaryAliases = row.secondary_muscles || row.secondary_muscle_aliases || [];

  const target = row.target_muscle_slugs || resolveAliasesToSlugs(aliasMap, primaryAliases);
  const secondary = row.secondary_muscle_slugs || resolveAliasesToSlugs(aliasMap, secondaryAliases);

  return {
    provider: 'jefit',
    provider_id: row.id || row.provider_id || null,
    slug,
    name_en: nameEn || null,
    name: displayName || null,
    description: row.description_vi || row.description || null,
    gif_url: row.gif_url || row.media_gif || null,
    primary_video_url: row.video_url || row.media_video || null,
    thumbnail_url: row.thumbnail_url || null,
    equipment_key: row.equipment_key || row.equipment || null,
    bodyparts_keys: row.bodyparts_keys || [],
    target_muscle_slugs: target,
    secondary_muscle_slugs: (secondary || []).filter(s => !target.includes(s)),
    difficulty: row.difficulty || null,
    exercise_type: row.exercise_type || null,
  };
}

function loadRaw(){
  if (inputPath) return readJson(path.resolve(inputPath));
  if (!fs.existsSync(rawDir)) return [];
  const files = fs.readdirSync(rawDir).filter(f => f.endsWith('.json'));
  const rows = [];
  for (const f of files){
    try { rows.push(...readJson(path.join(rawDir, f))); } catch {}
  }
  return rows;
}

function main(){
  if (!fs.existsSync(baseAliasPath)) {
    console.error('Missing base alias at', baseAliasPath);
    process.exit(1);
  }
  const aliasMap = buildAliasMap();
  const raw = loadRaw();
  if (!raw.length){
    console.error('No JEFIT raw input found. Place JSON files under', rawDir, 'or pass --in <path.json>');
    process.exit(2);
  }
  const out = raw.map(r => normalizeOne(r, aliasMap));
  writeJson(outPath, out);
  console.log(`Normalized ${out.length} exercises -> ${outPath}`);
}

main();

