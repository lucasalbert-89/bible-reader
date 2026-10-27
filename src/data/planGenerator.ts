import { ALL_BIBLE_CHAPTERS, ChapterPointer, BIBLE_BOOKS } from './bibleStructure';
import { DayReading, ReadingSegment, PlanId, ReadingMode } from '../types';
import { getInspirationalMessage } from './dailyVerses';

// Distribute an array of chapters across N days smoothly
function partitionChapters(chapters: ChapterPointer[], totalDays: number): ChapterPointer[][] {
  const result: ChapterPointer[][] = [];
  const total = chapters.length;

  for (let day = 0; day < totalDays; day++) {
    const startIndex = Math.floor((day * total) / totalDays);
    const endIndex = Math.floor(((day + 1) * total) / totalDays);
    result.push(chapters.slice(startIndex, endIndex));
  }
  return result;
}

// Slice chapters according to an explicit per-day count array
function sliceByCounts(chapters: ChapterPointer[], counts: number[]): ChapterPointer[][] {
  const result: ChapterPointer[][] = [];
  let cursor = 0;
  for (const count of counts) {
    result.push(chapters.slice(cursor, cursor + count));
    cursor += count;
  }
  return result;
}

// Group chapters into concise reading segments by book
function groupIntoSegments(
  chapters: ChapterPointer[],
  defaultTitle = 'Leitura',
  forceCategory?: 'ot' | 'sapiential' | 'nt' | 'geral'
): ReadingSegment[] {
  if (chapters.length === 0) return [];

  const groups: { book: string; chapters: number[]; testament: 'ot' | 'nt'; category?: string }[] = [];

  for (const c of chapters) {
    const last = groups[groups.length - 1];
    if (last && last.book === c.book) {
      last.chapters.push(c.chapter);
    } else {
      const bookDef = BIBLE_BOOKS.find(b => b.name === c.book);
      groups.push({
        book: c.book,
        chapters: [c.chapter],
        testament: bookDef?.testament || 'ot',
        category: bookDef?.category
      });
    }
  }

  return groups.map(g => {
    let title = defaultTitle;
    let category: 'ot' | 'sapiential' | 'nt' | 'geral' = forceCategory || 'geral';

    if (!forceCategory) {
      if (g.book === 'Salmos' || g.book === 'Provérbios') {
        title = 'Salmos e Provérbios';
        category = 'sapiential';
      } else if (g.testament === 'ot') {
        title = 'Antigo Testamento';
        category = 'ot';
      } else if (g.testament === 'nt') {
        title = 'Novo Testamento';
        category = 'nt';
      }
    }

    const first = g.chapters[0];
    const last = g.chapters[g.chapters.length - 1];
    const rangeStr =
      first === last
        ? `${g.book} ${first}`
        : g.chapters.length === 2 && last - first === 1
        ? `${g.book} ${first} e ${last}`
        : `${g.book} ${first} a ${last}`;

    return {
      title,
      chapters: rangeStr,
      category,
      bookName: g.book,
      chapterNumbers: g.chapters
    };
  });
}

// Helper to get the 3 base chapter pools for the Mixed Mode (AT + Salmos/Provérbios + NT)
function getMixedPools() {
  // Antigo Testamento completo (incluindo Jó, Eclesiastes e Cantares na ordem bíblica), exceto Salmos e Provérbios (748 cap.)
  const otChapters = ALL_BIBLE_CHAPTERS.filter(c => {
    const book = BIBLE_BOOKS.find(b => b.name === c.book);
    return book?.testament === 'ot' && c.book !== 'Salmos' && c.book !== 'Provérbios';
  });

  // Apenas Salmos (150) e Provérbios (31) = 181 capítulos
  const psalmsProverbsChapters = ALL_BIBLE_CHAPTERS.filter(
    c => c.book === 'Salmos' || c.book === 'Provérbios'
  );

  // Novo Testamento (Mateus a Apocalipse) = 260 capítulos
  const ntChapters = ALL_BIBLE_CHAPTERS.filter(c => {
    const book = BIBLE_BOOKS.find(b => b.name === c.book);
    return book?.testament === 'nt';
  });

  return { otChapters, psalmsProverbsChapters, ntChapters };
}

/**
 * 1. Plano 365 Dias — Modo Misto (Antigo Testamento 1x + Salmos/Provérbios 2x + Novo Testamento 2x)
 * Alinhado dia a dia (início, meio e fim) com o plano anual de 365 dias:
 * - Antigo Testamento (exceto Salmos e Provérbios): Gênesis 1 a Malaquias 4 direto (1x)
 * - Salmos e Provérbios: 1º ciclo (Dias 1 a 181) e 2º ciclo (Dias 182 a 362)
 * - Novo Testamento: 1º ciclo (Dias 1 a 182) e 2º ciclo (Dias 183 a 365)
 */
function generatePlan365Misto(): DayReading[] {
  const { otChapters, ntChapters } = getMixedPools();

  // Contagem exata por dia do Antigo Testamento (748 capítulos em 365 dias)
  const otOneCapDays = new Set([12, 52, 53, 59, 64, 69, 95, 113, 145, 147, 149, 153, 169, 174, 214, 311, 351]);
  const otThreeCapDays = new Set([
    3, 92, 129, 192, 193, 239, 240, 254, 255, 257, 261, 328, 329,
    342, 343, 345, 346, 347, 348, 349, 350, 354, 355, 356, 357, 361, 363
  ]);
  const otFourCapDays = new Set([120, 352, 353, 365]);

  const otCounts: number[] = [];
  for (let d = 1; d <= 365; d++) {
    if (otOneCapDays.has(d)) otCounts.push(1);
    else if (otThreeCapDays.has(d)) otCounts.push(3);
    else if (otFourCapDays.has(d)) otCounts.push(4);
    else otCounts.push(2);
  }
  const otPartition = sliceByCounts(otChapters, otCounts);

  // Salmos e Provérbios (2 ciclos: Dias 1–181 e Dias 182–362)
  const sapientialPartition: ChapterPointer[][] = [];
  // 1º Ciclo (Dias 1 a 181)
  for (let s = 1; s <= 118; s++) sapientialPartition.push([{ book: 'Salmos', chapter: s }]);
  sapientialPartition.push([{ book: 'Salmos', chapter: 119 }]); // Dia 119
  sapientialPartition.push([{ book: 'Salmos', chapter: 119 }]); // Dia 120
  for (let s = 120; s <= 125; s++) sapientialPartition.push([{ book: 'Salmos', chapter: s }]);
  sapientialPartition.push([{ book: 'Salmos', chapter: 126 }, { book: 'Salmos', chapter: 127 }]); // Dia 127
  for (let s = 128; s <= 150; s++) sapientialPartition.push([{ book: 'Salmos', chapter: s }]);
  for (let p = 1; p <= 31; p++) sapientialPartition.push([{ book: 'Provérbios', chapter: p }]); // Dias 151 a 181

  // 2º Ciclo (Dias 182 a 362)
  for (let s = 1; s <= 11; s++) sapientialPartition.push([{ book: 'Salmos', chapter: s }]); // Dias 182 a 192
  sapientialPartition.push([{ book: 'Salmos', chapter: 12 }, { book: 'Salmos', chapter: 13 }]); // Dia 193
  for (let s = 14; s <= 118; s++) sapientialPartition.push([{ book: 'Salmos', chapter: s }]); // Dias 194 a 298
  sapientialPartition.push([{ book: 'Salmos', chapter: 119 }]); // Dia 299
  sapientialPartition.push([{ book: 'Salmos', chapter: 119 }]); // Dia 300
  sapientialPartition.push([{ book: 'Salmos', chapter: 119 }]); // Dia 301
  for (let s = 120; s <= 146; s++) sapientialPartition.push([{ book: 'Salmos', chapter: s }]); // Dias 302 a 328
  sapientialPartition.push([{ book: 'Salmos', chapter: 147 }, { book: 'Salmos', chapter: 148 }]); // Dia 329
  sapientialPartition.push([{ book: 'Salmos', chapter: 149 }]); // Dia 330
  sapientialPartition.push([{ book: 'Salmos', chapter: 150 }]); // Dia 331
  for (let p = 1; p <= 31; p++) sapientialPartition.push([{ book: 'Provérbios', chapter: p }]); // Dias 332 a 362
  // Dias 363 a 365 (ciclo duplo de Salmos e Provérbios já concluído no Dia 362)
  sapientialPartition.push([], [], []);

  // Novo Testamento — 1º Ciclo (Dias 1 a 182: 260 capítulos)
  const ntCycle1TwoCapDays = new Set([
    1, 2, 4, 5, 6, 9, 10, 12,
    62, 74,
    82, 83, 88, 97,
    104, 105, 106, 107, 108, 109, 110, 111,
    112, 113, 114, 116,
    125, 126, 127,
    132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143,
    146, 147, 148, 149, 150,
    153, 154, 155, 156, 157,
    165, 166, 168, 169,
    174, 176, 178, 179, 181
  ]);
  const ntCycle1ThreeCapDays = new Set([128, 145, 151, 163, 167, 175, 177, 180, 182]);

  const ntCounts1: number[] = [];
  for (let d = 1; d <= 182; d++) {
    if (ntCycle1ThreeCapDays.has(d)) ntCounts1.push(3);
    else if (ntCycle1TwoCapDays.has(d)) ntCounts1.push(2);
    else ntCounts1.push(1);
  }

  // Novo Testamento — 2º Ciclo (Dias 183 a 365: 260 capítulos)
  const ntCycle2TwoCapDays = new Set([
    183, 184, 185, 187, 188, 191, 192,
    243, 254,
    263, 264, 269, 281,
    285, 286, 287, 288, 289, 290, 291, 292,
    293, 294, 295, 297,
    306, 307, 308, 310,
    314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325,
    328, 330, 331,
    334, 335, 336, 337, 338,
    343, 345, 346, 348, 349,
    354, 356, 358, 361, 364, 365
  ]);
  const ntCycle2ThreeCapDays = new Set([193, 327, 332, 342, 347, 355, 357]);
  const ntCycle2FourCapDays = new Set([329]);

  const ntCounts2: number[] = [];
  for (let d = 183; d <= 365; d++) {
    if (ntCycle2FourCapDays.has(d)) ntCounts2.push(4);
    else if (ntCycle2ThreeCapDays.has(d)) ntCounts2.push(3);
    else if (ntCycle2TwoCapDays.has(d)) ntCounts2.push(2);
    else ntCounts2.push(1);
  }

  const ntPartition = [
    ...sliceByCounts(ntChapters, ntCounts1),
    ...sliceByCounts(ntChapters, ntCounts2)
  ];

  const days: DayReading[] = [];

  for (let d = 0; d < 365; d++) {
    const dayNumber = d + 1;
    const otSegs = groupIntoSegments(otPartition[d], 'Antigo Testamento', 'ot');
    const sapSegs = groupIntoSegments(sapientialPartition[d], 'Salmos e Provérbios', 'sapiential');
    const ntSegs = groupIntoSegments(ntPartition[d], 'Novo Testamento', 'nt');

    const message = getInspirationalMessage(dayNumber);

    days.push({
      day: dayNumber,
      segments: [...otSegs, ...sapSegs, ...ntSegs],
      verse: message.verse,
      reference: message.reference,
      reflection: message.reflection,
      authorOrCatechism: message.authorOrCatechism,
      sola: message.sola,
    });
  }

  return days;
}

/**
 * 2. Plano de N Dias (180 ou 90) — Modo Misto
 * Adequação proporcional da mesma regra:
 * - Antigo Testamento (sem Salmos e Provérbios): lido 1x direto do Dia 1 ao Dia N
 * - Salmos e Provérbios: repete 1x (1º ciclo na 1ª metade, 2º ciclo na 2ª metade)
 * - Novo Testamento: repete 1x (1º ciclo na 1ª metade, 2º ciclo na 2ª metade)
 */
function generatePlanMixedCustomDays(totalDays: number): DayReading[] {
  const { otChapters, psalmsProverbsChapters, ntChapters } = getMixedPools();
  const halfDays = Math.floor(totalDays / 2);
  const secondHalfDays = totalDays - halfDays;

  const otPartition = partitionChapters(otChapters, totalDays);

  const sapPartition = [
    ...partitionChapters(psalmsProverbsChapters, halfDays),
    ...partitionChapters(psalmsProverbsChapters, secondHalfDays),
  ];

  const ntPartition = [
    ...partitionChapters(ntChapters, halfDays),
    ...partitionChapters(ntChapters, secondHalfDays),
  ];

  const days: DayReading[] = [];

  for (let d = 0; d < totalDays; d++) {
    const dayNumber = d + 1;
    const otSegs = groupIntoSegments(otPartition[d], 'Antigo Testamento', 'ot');
    const sapSegs = groupIntoSegments(sapPartition[d], 'Salmos e Provérbios', 'sapiential');
    const ntSegs = groupIntoSegments(ntPartition[d], 'Novo Testamento', 'nt');

    const message = getInspirationalMessage(dayNumber);

    days.push({
      day: dayNumber,
      segments: [...otSegs, ...sapSegs, ...ntSegs],
      verse: message.verse,
      reference: message.reference,
      reflection: message.reflection,
      authorOrCatechism: message.authorOrCatechism,
      sola: message.sola,
    });
  }

  return days;
}

/**
 * 3. Modo Sequencial (Gênesis a Apocalipse direto, sem pular entre AT, Poéticos e NT)
 * Disponível para 365, 180 e 90 dias.
 */
function generatePlanSequential(totalDays: number): DayReading[] {
  const partition = partitionChapters(ALL_BIBLE_CHAPTERS, totalDays);
  const days: DayReading[] = [];

  for (let d = 0; d < totalDays; d++) {
    const dayNumber = d + 1;
    const segs = groupIntoSegments(partition[d], 'Leitura Sequencial');
    const message = getInspirationalMessage(dayNumber);

    days.push({
      day: dayNumber,
      segments: segs,
      verse: message.verse,
      reference: message.reference,
      reflection: message.reflection,
      authorOrCatechism: message.authorOrCatechism,
      sola: message.sola,
    });
  }

  return days;
}

const planCache: Record<string, DayReading[]> = {};

export function getPlanDays(planId: PlanId, mode: ReadingMode = 'misto'): DayReading[] {
  const cacheKey = `${planId}_${mode}`;
  if (planCache[cacheKey]) {
    return planCache[cacheKey];
  }

  const totalDays = planId === 'plano-365' ? 365 : planId === 'plano-180' ? 180 : 90;

  let generated: DayReading[];
  if (mode === 'sequencial') {
    generated = generatePlanSequential(totalDays);
  } else {
    if (planId === 'plano-365') {
      generated = generatePlan365Misto();
    } else {
      generated = generatePlanMixedCustomDays(totalDays);
    }
  }

  planCache[cacheKey] = generated;
  return generated;
}
