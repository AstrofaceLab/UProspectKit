import fs from 'fs';

const content = fs.readFileSync('app/page.tsx', 'utf8');

let stack = [];
let i = 0;
while (i < content.length) {
    if (content.substring(i, i + 4) === '<div') {
        let endOfTag = content.indexOf('>', i);
        if (endOfTag !== -1) {
            let tagContent = content.substring(i, endOfTag + 1);
            if (!tagContent.endsWith('/>')) {
                let lineNum = content.substring(0, i).split('\n').length;
                stack.push({ line: lineNum, pos: i });
            }
            i = endOfTag + 1;
        } else {
            i += 4;
        }
    } else if (content.substring(i, i + 6) === '</div>') {
        if (stack.length === 0) {
            let lineNum = content.substring(0, i).split('\n').length;
            console.log(`Extra </div> at line ${lineNum}`);
        } else {
            stack.pop();
        }
        i += 6;
    } else {
        i++;
    }
}

if (stack.length > 0) {
    console.log(`Unclosed <div> tags at lines: ${stack.map(s => s.line).join(', ')}`);
} else {
    console.log('No unclosed <div> tags found.');
}
