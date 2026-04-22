const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-\[#121212\]/g, replacement: 'bg-[var(--color-bg-base)]' },
  { regex: /text-\[#121212\]/g, replacement: 'text-[var(--color-bg-base)]' },
  { regex: /border-\[#121212\]/g, replacement: 'border-[var(--color-bg-base)]' },
  { regex: /bg-\[#181818\]/g, replacement: 'bg-[var(--color-bg-surface)]' },
  { regex: /bg-\[#1f1f1f\]/g, replacement: 'bg-[var(--color-bg-elevated)]' },
  { regex: /bg-\[#252525\]/g, replacement: 'bg-[var(--color-bg-card)]' },
  { regex: /text-\[#b3b3b3\]/g, replacement: 'text-[var(--color-text-secondary)]' },
  { regex: /text-\[#7c7c7c\]/g, replacement: 'text-[var(--color-text-muted)]' },
  { regex: /border-\[#4d4d4d\]/g, replacement: 'border-[var(--color-border)]' },
  { regex: /text-white/g, replacement: 'text-[var(--color-text-primary)]' },
  { regex: /border-white\/5/g, replacement: 'border-[var(--color-border)]' },
  { regex: /border-white\/10/g, replacement: 'border-[var(--color-text-primary)]\/10' },
  { regex: /border-white\/20/g, replacement: 'border-[var(--color-text-primary)]\/20' },
  { regex: /bg-white\/5/g, replacement: 'bg-[var(--color-text-primary)]\/5' },
  { regex: /bg-white\/10/g, replacement: 'bg-[var(--color-text-primary)]\/10' },
  { regex: /'#121212'/g, replacement: "'var(--color-bg-base)'" },
  { regex: /'#181818'/g, replacement: "'var(--color-bg-surface)'" },
  { regex: /'#1f1f1f'/g, replacement: "'var(--color-bg-elevated)'" },
  { regex: /'#252525'/g, replacement: "'var(--color-bg-card)'" },
  { regex: /'#b3b3b3'/g, replacement: "'var(--color-text-secondary)'" },
  { regex: /'#7c7c7c'/g, replacement: "'var(--color-text-muted)'" },
  { regex: /'#ffffff'/g, replacement: "'var(--color-text-primary)'" },
  { regex: /'#4d4d4d'/g, replacement: "'var(--color-border)'" },
  { regex: /text-\[var\(--color-border\)\]\/5/g, replacement: 'border-[var(--color-border)]' } // Fix for border-white/5
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walk('client/src');
