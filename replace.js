const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('dist')) {
        results = results.concat(walk(file));
      }
    } else { 
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json')) {
        results.push(file);
      }
    }
  });
  return results;
}

const frontendFiles = walk('/media/vanir/SSD 2 UPGAMER1/superpostiz/apps/frontend/src');
const libFiles = walk('/media/vanir/SSD 2 UPGAMER1/superpostiz/libraries/react-shared-libraries/src');
const allFiles = frontendFiles.concat(libFiles);

let changed = 0;
allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace visible texts and URLs
  content = content.replace(/Postiz/g, 'Agenda Labs');
  content = content.replace(/postiz\.com/g, 'agendalabs.com');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changed++;
  }
});

console.log(`Substituição concluída em ${changed} arquivos.`);
