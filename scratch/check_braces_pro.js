import fs from 'fs';

const content = fs.readFileSync('app/page.tsx', 'utf8');

let braceStack = [];
let parenStack = [];
let inString = null;
let inComment = null;

const lines = content.split('\n');
for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i+1];
    
    if (inComment === 'line') {
        if (char === '\n') inComment = null;
        continue;
    }
    if (inComment === 'block') {
        if (char === '*' && nextChar === '/') {
            inComment = null;
            i++;
        }
        continue;
    }
    if (inString) {
        if (char === inString) {
            if (content[i-1] !== '\\') inString = null;
        }
        continue;
    }
    
    if (char === '/' && nextChar === '/') {
        inComment = 'line';
        i++;
    } else if (char === '/' && nextChar === '*') {
        inComment = 'block';
        i++;
    } else if (char === '"' || char === "'" || char === '`') {
        inString = char;
    } else if (char === '{') {
        braceStack.push({ line: content.substring(0, i).split('\n').length });
    } else if (char === '}') {
        if (braceStack.length === 0) {
            console.log(`Extra } at line ${content.substring(0, i).split('\n').length}`);
        } else {
            braceStack.pop();
        }
    } else if (char === '(') {
        parenStack.push({ line: content.substring(0, i).split('\n').length });
    } else if (char === ')') {
        if (parenStack.length === 0) {
            console.log(`Extra ) at line ${content.substring(0, i).split('\n').length}`);
        } else {
            parenStack.pop();
        }
    }
}
