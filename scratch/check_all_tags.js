import fs from 'fs';

const content = fs.readFileSync('app/page.tsx', 'utf8');

let stack = [];
let i = 0;
while (i < content.length) {
    if (content[i] === '<') {
        if (content[i + 1] === '/') {
            // Closing tag </Tag> or </>
            let endOfTag = content.indexOf('>', i);
            let tagContent = content.substring(i + 2, endOfTag).trim();
            let tagName = tagContent.split(/\s/)[0] || 'FRAGMENT';
            
            if (stack.length === 0) {
                let lineNum = content.substring(0, i).split('\n').length;
                console.log(`Extra closing tag </${tagName}> at line ${lineNum}`);
            } else {
                let last = stack.pop();
                if (last.name !== tagName) {
                    let lineNum = content.substring(0, i).split('\n').length;
                    console.log(`Mismatched tag: opened <${last.name}> at line ${last.line}, closed </${tagName}> at line ${lineNum}`);
                }
            }
            i = endOfTag + 1;
        } else if (content.substring(i, i + 2) === '<!') {
            // Comment
            i = content.indexOf('-->', i) + 3;
        } else if (content.substring(i, i + 2) === '< ') {
             // Not a tag
             i++;
        } else {
            // Opening tag <Tag> or <>
            let endOfTag = content.indexOf('>', i);
            if (endOfTag !== -1) {
                let tagContent = content.substring(i + 1, endOfTag).trim();
                
                // Ignore self-closing and TS types in useState<...>
                // Simplest way: if it's useState< or something, it's a type.
                // But in JSX, tags start with < and are followed by a name or nothing.
                
                let isType = false;
                if (i > 0) {
                    let before = content.substring(Math.max(0, i - 10), i);
                    if (before.includes('useState') || before.includes('Array<')) isType = true;
                }
                
                if (!tagContent.endsWith('/') && !isType) {
                    let tagName = tagContent.split(/[\s\n>]/)[0] || 'FRAGMENT';
                    if (tagName && /^[A-Z_a-z]/.test(tagName) || tagName === 'FRAGMENT') {
                        let lineNum = content.substring(0, i).split('\n').length;
                        stack.push({ name: tagName, line: lineNum });
                    }
                }
                i = endOfTag + 1;
            } else {
                i++;
            }
        }
    } else {
        i++;
    }
}

if (stack.length > 0) {
    console.log(`Unclosed tags: ${stack.map(s => `<${s.name}> at line ${s.line}`).join(', ')}`);
} else {
    console.log('All tags are balanced.');
}
