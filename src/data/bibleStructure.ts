export interface BibleBook {
  name: string;
  chapters: number;
  testament: 'ot' | 'nt';
  category: 'lei' | 'historia' | 'poesia' | 'profetas' | 'evangelhos' | 'cartas' | 'apocalipse';
}

export const BIBLE_BOOKS: BibleBook[] = [
  // Antigo Testamento - Pentateuco / Lei
  { name: 'Gênesis', chapters: 50, testament: 'ot', category: 'lei' },
  { name: 'Êxodo', chapters: 40, testament: 'ot', category: 'lei' },
  { name: 'Levítico', chapters: 27, testament: 'ot', category: 'lei' },
  { name: 'Números', chapters: 36, testament: 'ot', category: 'lei' },
  { name: 'Deuteronômio', chapters: 34, testament: 'ot', category: 'lei' },

  // Históricos
  { name: 'Josué', chapters: 24, testament: 'ot', category: 'historia' },
  { name: 'Juízes', chapters: 21, testament: 'ot', category: 'historia' },
  { name: 'Rute', chapters: 4, testament: 'ot', category: 'historia' },
  { name: '1 Samuel', chapters: 31, testament: 'ot', category: 'historia' },
  { name: '2 Samuel', chapters: 24, testament: 'ot', category: 'historia' },
  { name: '1 Reis', chapters: 22, testament: 'ot', category: 'historia' },
  { name: '2 Reis', chapters: 25, testament: 'ot', category: 'historia' },
  { name: '1 Crônicas', chapters: 29, testament: 'ot', category: 'historia' },
  { name: '2 Crônicas', chapters: 36, testament: 'ot', category: 'historia' },
  { name: 'Esdras', chapters: 10, testament: 'ot', category: 'historia' },
  { name: 'Neemias', chapters: 13, testament: 'ot', category: 'historia' },
  { name: 'Ester', chapters: 10, testament: 'ot', category: 'historia' },

  // Poéticos e Sapienciais
  { name: 'Jó', chapters: 42, testament: 'ot', category: 'poesia' },
  { name: 'Salmos', chapters: 150, testament: 'ot', category: 'poesia' },
  { name: 'Provérbios', chapters: 31, testament: 'ot', category: 'poesia' },
  { name: 'Eclesiastes', chapters: 12, testament: 'ot', category: 'poesia' },
  { name: 'Cantares', chapters: 8, testament: 'ot', category: 'poesia' },

  // Profetas Maiores
  { name: 'Isaías', chapters: 66, testament: 'ot', category: 'profetas' },
  { name: 'Jeremias', chapters: 52, testament: 'ot', category: 'profetas' },
  { name: 'Lamentações', chapters: 5, testament: 'ot', category: 'profetas' },
  { name: 'Ezequiel', chapters: 48, testament: 'ot', category: 'profetas' },
  { name: 'Daniel', chapters: 12, testament: 'ot', category: 'profetas' },

  // Profetas Menores
  { name: 'Oseias', chapters: 14, testament: 'ot', category: 'profetas' },
  { name: 'Joel', chapters: 3, testament: 'ot', category: 'profetas' },
  { name: 'Amós', chapters: 9, testament: 'ot', category: 'profetas' },
  { name: 'Obadias', chapters: 1, testament: 'ot', category: 'profetas' },
  { name: 'Jonas', chapters: 4, testament: 'ot', category: 'profetas' },
  { name: 'Miqueias', chapters: 7, testament: 'ot', category: 'profetas' },
  { name: 'Naum', chapters: 3, testament: 'ot', category: 'profetas' },
  { name: 'Habacuque', chapters: 3, testament: 'ot', category: 'profetas' },
  { name: 'Sofonias', chapters: 3, testament: 'ot', category: 'profetas' },
  { name: 'Ageu', chapters: 2, testament: 'ot', category: 'profetas' },
  { name: 'Zacarias', chapters: 14, testament: 'ot', category: 'profetas' },
  { name: 'Malaquias', chapters: 4, testament: 'ot', category: 'profetas' },

  // Novo Testamento - Evangelhos e História
  { name: 'Mateus', chapters: 28, testament: 'nt', category: 'evangelhos' },
  { name: 'Marcos', chapters: 16, testament: 'nt', category: 'evangelhos' },
  { name: 'Lucas', chapters: 24, testament: 'nt', category: 'evangelhos' },
  { name: 'João', chapters: 21, testament: 'nt', category: 'evangelhos' },
  { name: 'Atos', chapters: 28, testament: 'nt', category: 'historia' },

  // Cartas Paulinas e Gerais
  { name: 'Romanos', chapters: 16, testament: 'nt', category: 'cartas' },
  { name: '1 Coríntios', chapters: 16, testament: 'nt', category: 'cartas' },
  { name: '2 Coríntios', chapters: 13, testament: 'nt', category: 'cartas' },
  { name: 'Gálatas', chapters: 6, testament: 'nt', category: 'cartas' },
  { name: 'Efésios', chapters: 6, testament: 'nt', category: 'cartas' },
  { name: 'Filipenses', chapters: 4, testament: 'nt', category: 'cartas' },
  { name: 'Colossenses', chapters: 4, testament: 'nt', category: 'cartas' },
  { name: '1 Tessalonicenses', chapters: 5, testament: 'nt', category: 'cartas' },
  { name: '2 Tessalonicenses', chapters: 3, testament: 'nt', category: 'cartas' },
  { name: '1 Timóteo', chapters: 6, testament: 'nt', category: 'cartas' },
  { name: '2 Timóteo', chapters: 4, testament: 'nt', category: 'cartas' },
  { name: 'Tito', chapters: 3, testament: 'nt', category: 'cartas' },
  { name: 'Filemom', chapters: 1, testament: 'nt', category: 'cartas' },
  { name: 'Hebreus', chapters: 13, testament: 'nt', category: 'cartas' },
  { name: 'Tiago', chapters: 5, testament: 'nt', category: 'cartas' },
  { name: '1 Pedro', chapters: 5, testament: 'nt', category: 'cartas' },
  { name: '2 Pedro', chapters: 3, testament: 'nt', category: 'cartas' },
  { name: '1 João', chapters: 5, testament: 'nt', category: 'cartas' },
  { name: '2 João', chapters: 1, testament: 'nt', category: 'cartas' },
  { name: '3 João', chapters: 1, testament: 'nt', category: 'cartas' },
  { name: 'Judas', chapters: 1, testament: 'nt', category: 'cartas' },
  { name: 'Apocalipse', chapters: 22, testament: 'nt', category: 'apocalipse' },
];

export interface ChapterPointer {
  book: string;
  chapter: number;
}

// Flatten all 1,189 chapters
export const ALL_BIBLE_CHAPTERS: ChapterPointer[] = [];
for (const book of BIBLE_BOOKS) {
  for (let c = 1; c <= book.chapters; c++) {
    ALL_BIBLE_CHAPTERS.push({ book: book.name, chapter: c });
  }
}

// Helper to format ranges nicely: e.g. "Gênesis 1 a 3" or "Gênesis 1" or "Gênesis 49 a Êxodo 2"
export function formatChapterRange(chapters: ChapterPointer[]): string {
  if (chapters.length === 0) return '';
  if (chapters.length === 1) return `${chapters[0].book} ${chapters[0].chapter}`;
  
  const first = chapters[0];
  const last = chapters[chapters.length - 1];

  if (first.book === last.book) {
    return `${first.book} ${first.chapter} a ${last.chapter}`;
  }
  return `${first.book} ${first.chapter} a ${last.book} ${last.chapter}`;
}
