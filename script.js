const HIDDEN_CHARS = {
    '\u200B': 'Zero Width Space',
    '\u200C': 'Zero Width Non-Joiner',
    '\u200D': 'Zero Width Joiner',
    '\u202F': 'Narrow No-Break Space',
    '\u2060': 'Word Joiner',
    '\u2061': 'Function Application',
    '\u2062': 'Invisible Times',
    '\u2063': 'Invisible Separator',
    '\u2064': 'Invisible Plus',
    '\uFEFF': 'Zero Width No-Break Space',
    '\u180E': 'Mongolian Vowel Separator',
    '\u034F': 'Combining Grapheme Joiner',
    '\u061C': 'Arabic Letter Mark',
    '\u115F': 'Hangul Choseong Filler',
    '\u1160': 'Hangul Jungseong Filler',
    '\u17B4': 'Khmer Vowel Inherent Aq',
    '\u17B5': 'Khmer Vowel Inherent O',
    '\u3164': 'Hangul Filler',
    '\uEE88': 'Cite'
}

const SUSPICIOUS_RANGES = [
    { start: 0x2000, end: 0x206F, name: 'General Punctuation' },
    { start: 0xFE00, end: 0xFE0F, name: 'Variation Selectors' },
    { start: 0xE0100, end: 0xE01EF, name: 'Variation Selectors Supplement' }
]

function analyzeText() {
    const text = document.getElementById('inputText').value;
    if (!text) {
        alert('Bitte geben Sie Text zum Analysieren ein.');
        return;
    }

    const results = performAnalysis(text);
    displayResults(results);
}

function performAnalysis(text) {
    const chars = Array.from(text);
    const hiddenChars = [];
    const suspiciousChars = [];
    const charPositions = {}
    
    chars.forEach((char, index) => {
        const code = char.codePointAt(0);
        
        // Check for known hidden characters
        if (HIDDEN_CHARS[char]) {
            hiddenChars.push({
                char: char,
                name: HIDDEN_CHARS[char],
                position: index,
                code: code.toString(16).toUpperCase()
            });
        }
        
        // Check for suspicious areas
        SUSPICIOUS_RANGES.forEach(range => {
            if (code >= range.start && code <= range.end) {
                suspiciousChars.push({
                    char: char,
                    name: range.name,
                    position: index,
                    code: code.toString(16).toUpperCase()
                });
            }
        })
        
        // Collect all characters for statistics
        if (!charPositions[char]) {
            charPositions[char] = [];
        }
        charPositions[char].push(index);
    })

    return {
        originalText: text,
        totalChars: chars.length,
        hiddenChars: hiddenChars,
        suspiciousChars: suspiciousChars,
        charPositions: charPositions,
        uniqueChars: Object.keys(charPositions).length
    };
}

function displayResults(results) {
    document.getElementById('results').classList.remove('hidden');
    
    // Statistiken
    const statsDiv = document.getElementById('stats');
    statsDiv.innerHTML = `
        <div class="text-sm">
            <div>Total characters: <span class="font-bold text-blue-300">${results.totalChars}</span></div>
            <div>Unique characters: <span class="font-bold text-blue-300">${results.uniqueChars}</span></div>
            <div>Hidden characters: <span class="font-bold text-red-300">${results.hiddenChars.length}</span></div>
            <div>Suspicious characters: <span class="font-bold text-yellow-300">${results.suspiciousChars.length}</span></div>
        </div>
    `
    const suspiciousDiv = document.getElementById('suspiciousChars');
    if (results.hiddenChars.length === 0 && results.suspiciousChars.length === 0) {
        suspiciousDiv.innerHTML = '<div class="text-green-400 text-sm">No hidden characters found!</div>';
    } else {
        const allSuspicious = [...results.hiddenChars, ...results.suspiciousChars];
        suspiciousDiv.innerHTML = allSuspicious.slice(0, 10).map(char => 
            `<div class="text-xs bg-gray-600 rounded p-2">
                <div class="font-bold text-red-300">${char.name}</div>
                <div>Position: ${char.position}, Code: U+${char.code}</div>
            </div>`
        ).join('');
    
    const detailedDiv = document.getElementById('detailedAnalysis');
    const allFindings = [...results.hiddenChars, ...results.suspiciousChars]
        .sort((a, b) => a.position - b.position);
    
    if (allFindings.length > 0) {
        detailedDiv.innerHTML = allFindings.map(finding => 
            `<div class="text-xs p-2 bg-gray-600 rounded mb-1">
                <span class="text-red-300 font-bold">Position ${finding.position}:</span> 
                ${finding.name} (U+${finding.code})
                <span class="text-gray-400">- Character: "${finding.char === ' ' ? '[SPACE]' : finding.char || '[UNSICHTBAR]'}"</span>
            </div>`
        ).join('');
    } else {
        detailedDiv.innerHTML = '<div class="text-green-400">No suspicious signs found.</div>';
    }

    // Visualization
    const visualDiv = document.getElementById('visualization');
    visualDiv.innerHTML = createVisualization(results);
    }
}

function createVisualization(results) {
    const chars = Array.from(results.originalText);
    const allFindings = [...results.hiddenChars, ...results.suspiciousChars];
    const findingPositions = new Set(allFindings.map(f => f.position));
    
    return chars.map((char, index) => {
        if (findingPositions.has(index)) {
            const finding = allFindings.find(f => f.position === index);
            return `<span class="bg-red-500 text-white px-1 rounded" title="${finding.name} (U+${finding.code})">${char === '\n' ? '\\n' : char || '◯'}</span>`;
        }
        return char === '\n' ? '\n' : char;
    }).join('');
}