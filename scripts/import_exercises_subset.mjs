#!/usr/bin/env node
/*
  Import only specified slugs from data/xwalk/xwalk_exercise.import.json
  Usage: node scripts/import_exercises_subset.mjs sled-45-leg-press sled-45-leg-wide-press ...
*/
import fs from 'fs';
import path from 'path';
import process from 'process';
import { sequelize } from '../packages/backend/config/database.js';

const root = process.cwd();
const importPath = path.join(root, 'data/xwalk/xwalk_exercise.import.json');

function readJson(p){ return JSON.parse(fs.readFileSync(p, 'utf8')); }

async function upsertExercise(client, row, t) {
  const fields = [
    'slug','name','name_en','description','gif_demo_url','primary_video_url','thumbnail_url','equipment_needed'
  ];
  const values = fields.map(f => row[f] ?? null);
  const placeholders = fields.map((_, i) => `$${i+1}`).join(',');
  const updates = [
    'name = EXCLUDED.name',
    'name_en = EXCLUDED.name_en',
    'description = EXCLUDED.description',
    'gif_demo_url = EXCLUDED.gif_demo_url',
    'primary_video_url = EXCLUDED.primary_video_url',
    'thumbnail_url = EXCLUDED.thumbnail_url',
    'equipment_needed = EXCLUDED.equipment_needed',
    'updated_at = NOW()'
  ].join(',');
  const sql = `
    INSERT INTO exercises (slug, name, name_en, description, gif_demo_url, primary_video_url, thumbnail_url, equipment_needed, created_at, updated_at)
    VALUES (${placeholders}, NOW(), NOW())
    ON CONFLICT (slug) DO UPDATE SET ${updates}
    RETURNING exercise_id;
  `;
  const [res] = await client.query(sql, { transaction: t, bind: values });
  return res[0]?.exercise_id;
}

async function getMuscleIdBySlug(client, slug, cache, t) {
  if (cache.has(slug)) return cache.get(slug);
  const [rows] = await client.query(
    'SELECT muscle_group_id FROM muscle_groups WHERE slug = $1',
    { transaction: t, bind: [slug] }
  );
  const id = rows[0]?.muscle_group_id || null;
  cache.set(slug, id);
  return id;
}

async function replaceMuscles(client, exerciseId, targets, secondaries, t) {
  await client.query('DELETE FROM exercise_muscle_group WHERE exercise_id = $1', { transaction: t, bind: [exerciseId] });
  const cache = new Map();
  const insertOne = async (slug, impact) => {
    const mgId = await getMuscleIdBySlug(client, slug, cache, t);
    if (!mgId) return 0;
    await client.query(
      `INSERT INTO exercise_muscle_group (exercise_id, muscle_group_id, impact_level, created_at)
       VALUES ($1, $2, $3, NOW())`,
      { transaction: t, bind: [exerciseId, mgId, impact] }
    );
    return 1;
  };
  let count = 0;
  for (const s of targets || []) count += await insertOne(s, 'primary');
  for (const s of (secondaries || []).filter(s => !(targets||[]).includes(s))) count += await insertOne(s, 'secondary');
  return count;
}

async function main(){
  const slugs = process.argv.slice(2).map(s => String(s).trim()).filter(Boolean);
  if (!slugs.length){
    console.error('Usage: node scripts/import_exercises_subset.mjs <slug1> <slug2> ...');
    process.exit(1);
  }
  if (!fs.existsSync(importPath)){
    console.error('Missing import json at', importPath);
    process.exit(2);
  }
  const list = readJson(importPath);
  const bySlug = new Map(list.map(x => [x.slug, x]));
  await sequelize.authenticate();
  console.log('DB connected. Importing subset:', slugs.join(', '));
  for (const slug of slugs){
    const row = bySlug.get(slug);
    if (!row){
      console.warn('Skip, not found in import json:', slug);
      continue;
    }
    const t = await sequelize.transaction();
    try {
      const exId = await upsertExercise(sequelize, row, t);
      await replaceMuscles(sequelize, exId, row.target_muscle_slugs, row.secondary_muscle_slugs, t);
      await t.commit();
      console.log('Imported:', slug, '-> exercise_id', exId);
    } catch (e) {
      await t.rollback();
      console.error('Error importing', slug, e.message);
      process.exitCode = 1;
    }
  }
  await sequelize.close();
}

main().catch((e) => { console.error(e); process.exit(1); });

