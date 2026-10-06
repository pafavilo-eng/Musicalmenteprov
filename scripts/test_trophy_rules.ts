import { calculateScoreTrophy } from '../src/services/scoreTrophyService';

const TEST_CASES = [
  { score: 0, expectedType: 'none', expectedGold: 0 },
  { score: 4999, expectedType: 'none', expectedGold: 0 },
  { score: 5000, expectedType: 'bronze', expectedGold: 0 },
  { score: 9999, expectedType: 'bronze', expectedGold: 0 },
  { score: 10000, expectedType: 'silver', expectedGold: 0 },
  { score: 14999, expectedType: 'silver', expectedGold: 0 },
  { score: 15000, expectedType: 'gold', expectedGold: 1 },
  { score: 16500, expectedType: 'gold', expectedGold: 1 },
  { score: 29999, expectedType: 'gold', expectedGold: 1 },
  { score: 30000, expectedType: 'gold', expectedGold: 2 },
  { score: 44999, expectedType: 'gold', expectedGold: 2 },
  { score: 45000, expectedType: 'gold', expectedGold: 3 },
  { score: 60000, expectedType: 'gold', expectedGold: 4 },
  { score: 100000, expectedType: 'gold', expectedGold: 6 },
];

let allPassed = true;
console.log('--- TESTE DAS REGRAS DE MEDALHAS E TROFÉUS ---');
for (const tc of TEST_CASES) {
  const res = calculateScoreTrophy(tc.score);
  const passType = res.type === tc.expectedType;
  const passGold = res.goldCount === tc.expectedGold;
  const pass = passType && passGold;
  if (!pass) allPassed = false;
  console.log(
    `${pass ? '✅ PASS' : '❌ FAIL'} | Pontos: ${tc.score.toLocaleString()} -> Tipo: ${res.type} (${res.label}) | Ouro: ${res.goldCount} | Badge: "${res.badgeText}"`
  );
}

if (!allPassed) {
  console.error('ALERTA: Falha em um ou mais testes!');
  process.exit(1);
} else {
  console.log('TODOS OS TESTES PASSARAM COM SUCESSO! 100% de conformidade com as regras.');
}
