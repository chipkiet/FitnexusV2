#!/usr/bin/env node
/*
  Import steps from data/xwalk/xwalk_exercise_steps.import.json
  - For each entry: find exercise by slug, delete existing steps, insert ordered steps
  - Safe to re-run (idempotent per exercise via full replace)
*/
import fs from 'fs';
import path from 'path';
import { sequelize } from '../packages/backend/config/database.js';

const root = process.cwd();
const inPath = path.join(root, 'data/xwalk/xwalk_exercise_steps.import.json');

function readJson(p){ return JSON.parse(fs.readFileSync(p, 'utf8')); }

async function getExerciseIdBySlug(slug, t){
  const [rows] = await sequelize.query(
    'SELECT exercise_id FROM exercises WHERE slug = $1 LIMIT 1',
    { transaction: t, bind: [slug] }
  );
  return rows[0]?.exercise_id || null;
}

async function replaceSteps(exerciseId, steps, t){
  await sequelize.query('DELETE FROM exercise_steps WHERE exercise_id = $1', { transaction: t, bind: [exerciseId] });
  for (const s of steps || []){
    const num = Number(s.step_number) || 0;
    const title = s.title || null;
    const text = s.instruction_text || s.text || null;
    const mediaUrl = s.media_url || null;
    const mediaType = s.media_type || null;
    await sequelize.query(
      `INSERT INTO exercise_steps (exercise_id, step_number, title, instruction_text, media_url, media_type)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      { transaction: t, bind: [exerciseId, num, title, text, mediaUrl, mediaType] }
    );
  }
}

async function main(){
  if (!fs.existsSync(inPath)){
    console.error('Missing steps file at', inPath);
    process.exit(1);
  }
  const data = readJson(inPath);
  await sequelize.authenticate();
  console.log(`DB connected. Importing steps for ${data.length} exercises...`);
  let ok = 0, miss = 0;
  for (const row of data){
    const t = await sequelize.transaction();
    try {
      const exId = await getExerciseIdBySlug(row.slug, t);
      if (!exId){
        console.warn('Skip unknown exercise slug:', row.slug);
        miss += 1;
        await t.rollback();
        continue;
      }
      await replaceSteps(exId, row.steps, t);
      await t.commit();
      ok += 1;
    } catch (e) {
      await t.rollback();
      console.error('Error for', row.slug, e.message);
      process.exitCode = 1;
    }
  }
  console.log(`Finished. Updated steps: ${ok}, skipped: ${miss}`);
  await sequelize.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
