const fs = require('fs');
const path = require('path');

const directories = ['src/pages', 'src/components'];

function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('grid-cols-1 md:')) {
                // We only want to replace in "grid grid-cols-1 md:..."
                // Sometimes it's grid-cols-1 md:grid-cols-2, sometimes md:grid-cols-3
                // Let's replace 'grid-cols-1 md:' with 'grid-cols-2 lg:' or 'grid-cols-2 md:' 
                // Using grid-cols-2 md: is safe to make mobile = 2 cols.
                const newContent = content.replace(/grid-cols-1 md:/g, 'grid-cols-2 md:');
                if (newContent !== content) {
                    fs.writeFileSync(fullPath, newContent, 'utf8');
                    console.log('Updated', fullPath);
                }
            }
        }
    }
}

directories.forEach(processDirectory);
console.log('Done');
