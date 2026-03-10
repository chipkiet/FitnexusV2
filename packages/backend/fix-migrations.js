import fs from 'fs';
import path from 'path';

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.js')) {
      const filePath = path.join(dir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace import with require
      content = content.replace(/import\s+(.*?)\s+from\s+['"](.*?)['"];?/g, 'const $1 = require("$2");');
      
      const hasUpExport = content.includes('export async function up');
      const hasDownExport = content.includes('export async function down');

      if (hasUpExport) {
        content = content.replace(/export\s+async\s+function\s+up/g, 'async function up');
      }
      if (hasDownExport) {
        content = content.replace(/export\s+async\s+function\s+down/g, 'async function down');
      }

      if (content.includes('export default')) {
          content = content.replace(/export\s+default/g, 'module.exports =');
      }

      if (hasUpExport || hasDownExport) {
          content += '\nmodule.exports = {\n';
          if (hasUpExport) content += '  up,\n';
          if (hasDownExport) content += '  down\n';
          content += '};\n';
      }

      const newFilePath = filePath.replace(/\.js$/, '.cjs');
      fs.writeFileSync(newFilePath, content, 'utf8');
      fs.unlinkSync(filePath);
      console.log(`Converted ${file} to .cjs`);
    } else if (file.endsWith('.cjs')) {
        // Just checking if we need to remove the test file
        if (file === '20260302000000-test.cjs') {
            fs.unlinkSync(path.join(dir, file));
            console.log(`Deleted ${file}`);
        }
    }
  }
}

processDir('./migrations');
processDir('./seeders');
