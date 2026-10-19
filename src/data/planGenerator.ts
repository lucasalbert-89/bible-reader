import { ALL_BIBLE_CHAPTERS, ChapterPointer, BIBLE_BOOKS } from './bibleStructure';
import { DayReading, ReadingSegment, PlanId } from '../types';
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

// Group chapters into concise reading segments by book
function groupIntoSegments(chapters: ChapterPointer[], defaultTitle = 'Leitura'): ReadingSegment[] {
  if (chapters.length === 0) return [];

  const groups: { book: string; chapters: number[]; testament: 'ot' | 'nt'; category?: any }[] = [];

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
    let category: 'ot' | 'sapiential' | 'nt' | 'geral' = 'geral';

    if (g.category === 'poesia') {
      title = 'Poéticos e Sapienciais';
      category = 'sapiential';
    } else if (g.testament === 'ot') {
      title = 'Antigo Testamento';
      category = 'ot';
    } else if (g.testament === 'nt') {
      title = 'Novo Testamento';
      category = 'nt';
    }

    const first = g.chapters[0];
    const last = g.chapters[g.chapters.length - 1];
    const rangeStr = first === last ? `${g.book} ${first}` : `${g.book} ${first} a ${last}`;

    return {
      title,
      chapters: rangeStr,
      category,
      bookName: g.book,
      chapterNumbers: g.chapters
    };
  });
}

// 1. Generate 365 Days Plan (Antigo Testamento + Salmos/Sapienciais + Novo Testamento)
export function generatePlan365(): DayReading[] {
  const otChapters = ALL_BIBLE_CHAPTERS.filter(c => {
    const book = BIBLE_BOOKS.find(b => b.name === c.book);
    return book?.testament === 'ot' && book.category !== 'poesia';
  });

  const poetryChapters = ALL_BIBLE_CHAPTERS.filter(c => {
    const book = BIBLE_BOOKS.find(b => b.name === c.book);
    return book?.category === 'poesia';
  });

  const ntChapters = ALL_BIBLE_CHAPTERS.filter(c => {
    const book = BIBLE_BOOKS.find(b => b.name === c.book);
    return book?.testament === 'nt';
  });

  const otPartition = partitionChapters(otChapters, 365);
  const poetryPartition = partitionChapters(poetryChapters, 365);
  const ntPartition = partitionChapters(ntChapters, 365);

  const days: DayReading[] = [];

  for (let d = 0; d < 365; d++) {
    const dayNumber = d + 1;
    const segments: ReadingSegment[] = [];

    const otSegs = groupIntoSegments(otPartition[d], 'Antigo Testamento');
    const poetrySegs = groupIntoSegments(poetryPartition[d], 'Poéticos e Sapienciais');
    const ntSegs = groupIntoSegments(ntPartition[d], 'Novo Testamento');

    segments.push(...otSegs, ...poetrySegs, ...ntSegs);

    const message = getInspirationalMessage(dayNumber);

    days.push({
      day: dayNumber,
      segments,
      verse: message.verse,
      reference: message.reference,
      reflection: message.reflection,
      authorOrCatechism: message.authorOrCatechism,
      sola: message.sola,
    });
  }

  return days;
}

// 2. Generate 180 Days Plan (Semestral - Antigo + Novo Testamento combinados)
export function generatePlan180(): DayReading[] {
  const otChapters = ALL_BIBLE_CHAPTERS.filter(c => {
    const book = BIBLE_BOOKS.find(b => b.name === c.book);
    return book?.testament === 'ot';
  });
  const ntChapters = ALL_BIBLE_CHAPTERS.filter(c => {
    const book = BIBLE_BOOKS.find(b => b.name === c.book);
    return book?.testament === 'nt';
  });

  const otPart = partitionChapters(otChapters, 180);
  const ntPart = partitionChapters(ntChapters, 180);

  const days: DayReading[] = [];

  for (let d = 0; d < 180; d++) {
    const dayNumber = d + 1;
    const otSegs = groupIntoSegments(otPart[d], 'Antigo Testamento');
    const ntSegs = groupIntoSegments(ntPart[d], 'Novo Testamento');

    const message = getInspirationalMessage(dayNumber);

    days.push({
      day: dayNumber,
      segments: [...otSegs, ...ntSegs],
      verse: message.verse,
      reference: message.reference,
      reflection: message.reflection,
      authorOrCatechism: message.authorOrCatechism,
      sola: message.sola,
    });
  }

  return days;
}

// 3. Generate 90 Days Plan (Intensivo - Sequencial / Imersão)
export function generatePlan90(): DayReading[] {
  const partition = partitionChapters(ALL_BIBLE_CHAPTERS, 90);
  const days: DayReading[] = [];

  for (let d = 0; d < 90; d++) {
    const dayNumber = d + 1;
    const segs = groupIntoSegments(partition[d], 'Leitura das Escrituras');
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

let cached365: DayReading[] | null = null;
let cached180: DayReading[] | null = null;
let cached90: DayReading[] | null = null;

export function getPlanDays(planId: PlanId): DayReading[] {
  if (planId === 'plano-365') {
    if (!cached365) cached365 = generatePlan365();
    return cached365;
  }
  if (planId === 'plano-180') {
    if (!cached180) cached180 = generatePlan180();
    return cached180;
  }
  if (planId === 'plano-90') {
    if (!cached90) cached90 = generatePlan90();
    return cached90;
  }
  return [];
}
