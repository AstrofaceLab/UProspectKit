import fs from 'fs';

const content = fs.readFileSync('app/page.tsx', 'utf8');

let braceStack = [];
let parenStack = [];

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '{') {
        let line = content.substring(0, i).split('\n').length;
        braceStack.push(line);
    } else if (char === '}') {
        if (braceStack.length === 0) {
            let line = content.substring(0, i).split('\n').length;
            console.log(`Extra } at line ${line}`);
        } else {
            braceStack.pop();
        }
    } else if (char === '(') {
        let line = content.substring(0, i).split('\n').length;
        parenStack.push(line);
    } else if (char === ')') {
        if (parenStack.length === 0) {
            let line = content.substring(0, i).split('\n').length;
            console.log(`Extra ) at line ${line}`);
        } else {
            parenStack.pop();
        }
    }
}

console.log(`Unclosed { at lines: ${braceStack.join(', ')}`);
console.log(`Unclosed ( at lines: ${parenStack.join(', ')}`);
