const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

console.log(
  `${colors.cyan}╔═══════════════════════════════════════════╗${colors.reset}`,
);
console.log(
  `${colors.cyan}║       Manual Mutation Testing Tool        ║${colors.reset}`,
);
console.log(
  `${colors.cyan}╔═══════════════════════════════════════════╗${colors.reset}\n`,
);

const targetFile = 'src/models/deck.model.ts';
const backupFile = targetFile + '.backup';

const originalCode = fs.readFileSync(targetFile, 'utf8');

fs.writeFileSync(backupFile, originalCode);

const mutations = [
  {
    name: 'Change ORDER BY DESC to ASC',
    search: 'ORDER BY created_at DESC',
    replace: 'ORDER BY created_at ASC',
    line: 11,
  },
  {
    name: 'Remove RETURNING * from getAllDecks',
    search: 'SELECT * FROM decks ORDER BY created_at DESC',
    replace: 'SELECT id, title FROM decks ORDER BY created_at DESC',
    line: 11,
  },
  {
    name: 'Change getDeckById to always return null',
    search: 'return result.rows[0] || null;',
    replace: 'return null;',
    line: 19,
  },
  {
    name: 'Change createDeck to not pass description',
    search: 'VALUES ($1, $2, $3)',
    replace: 'VALUES ($1, null, $3)',
    line: 27,
  },
  {
    name: 'Remove folder_id from createDeck',
    search: 'folderId || null',
    replace: 'null',
    line: 27,
  },
  {
    name: 'Change updateDeck to skip description update',
    search: 'description = $2',
    replace: 'description = description',
    line: 37,
  },
  {
    name: 'Change deleteDeck success condition',
    search: 'result.rowCount !== null && result.rowCount > 0',
    replace: 'result.rowCount !== null && result.rowCount >= 0',
    line: 44,
  },
  {
    name: 'Remove RETURNING from updateDeck',
    search: 'RETURNING *',
    replace: '',
    line: 37,
  },
  {
    name: 'Change getAllDecks to return empty array',
    search: 'return result.rows;',
    replace: 'return [];',
    line: 11,
    occurrenceIndex: 0,
  },
  {
    name: 'Remove null check in getDeckById',
    search: '|| null',
    replace: '',
    line: 19,
    occurrenceIndex: 0,
  },
];

let killed = 0;
let survived = 0;
let errors = 0;
const results = [];

console.log(`Target file: ${colors.cyan}${targetFile}${colors.reset}`);
console.log(
  `Total mutations: ${colors.cyan}${mutations.length}${colors.reset}\n`,
);
console.log('Starting mutation testing...\n');

mutations.forEach((mutation, index) => {
  console.log(
    `${colors.yellow}[${index + 1}/${mutations.length}]${colors.reset} Testing: ${mutation.name}`,
  );

  try {
    let mutatedCode = originalCode;

    if (mutation.occurrenceIndex !== undefined) {
      let count = 0;
      mutatedCode = mutatedCode.replace(
        new RegExp(mutation.search, 'g'),
        (match) => {
          if (count === mutation.occurrenceIndex) {
            count++;
            return mutation.replace;
          }
          count++;
          return match;
        },
      );
    } else {
      mutatedCode = mutatedCode.replace(mutation.search, mutation.replace);
    }

    if (mutatedCode === originalCode) {
      console.log(
        `  ${colors.yellow}  Mutation not applied (pattern not found)${colors.reset}\n`,
      );
      errors++;
      results.push({
        ...mutation,
        status: 'error',
        reason: 'Pattern not found',
      });
      return;
    }

    fs.writeFileSync(targetFile, mutatedCode);

    try {
      execSync('npx jest src/tests/deck.model.test.ts --silent --forceExit', {
        stdio: 'pipe',
        cwd: __dirname,
        env: { ...process.env, NODE_ENV: 'test' },
      });

      console.log(
        `  ${colors.red} SURVIVED - Tests passed with mutated code!${colors.reset}\n`,
      );
      survived++;
      results.push({ ...mutation, status: 'survived' });
    } catch (error) {
      console.log(
        `  ${colors.green} KILLED - Tests caught the mutation!${colors.reset}\n`,
      );
      killed++;
      results.push({ ...mutation, status: 'killed' });
    }
  } catch (error) {
    console.log(`  ${colors.red} ERROR - ${error.message}${colors.reset}\n`);
    errors++;
    results.push({ ...mutation, status: 'error', reason: error.message });
  } finally {
    fs.writeFileSync(targetFile, originalCode);
  }
});

fs.unlinkSync(backupFile);

console.log('\n' + '='.repeat(50));
console.log(`${colors.cyan} MUTATION TESTING RESULTS${colors.reset}`);
console.log('='.repeat(50) + '\n');

const total = mutations.length;
const mutationScore =
  total > 0 ? ((killed / (killed + survived)) * 100).toFixed(2) : 0;

console.log(`${colors.green} Killed:   ${killed}${colors.reset}`);
console.log(`${colors.red} Survived: ${survived}${colors.reset}`);
console.log(`${colors.yellow}  Errors:   ${errors}${colors.reset}`);
console.log(
  `${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`,
);
console.log(
  `${colors.cyan} Mutation Score: ${mutationScore}%${colors.reset}\n`,
);

// Інтерпретація
if (mutationScore >= 80) {
  console.log(
    `${colors.green} Excellent! Your tests are very robust.${colors.reset}`,
  );
} else if (mutationScore >= 60) {
  console.log(
    `${colors.yellow}  Good, but there's room for improvement.${colors.reset}`,
  );
} else {
  console.log(
    `${colors.red} Poor coverage. Consider adding more test cases.${colors.reset}`,
  );
}

if (survived > 0) {
  console.log(
    `\n${colors.red}Survived mutations (need more tests):${colors.reset}`,
  );
  results
    .filter((r) => r.status === 'survived')
    .forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.name} (line ${m.line})`);
    });
}

console.log('\n' + '='.repeat(50) + '\n');
