import { BibleVersionId, BibleVersionInfo } from '../types';
import { BIBLE_BOOKS } from '../data/bibleStructure';

export interface RawBibleBook {
  abbrev: string;
  name: string;
  chapters: string[][];
}

export const BIBLE_VERSIONS: BibleVersionInfo[] = [
  {
    id: 'nvi',
    name: 'NVI',
    fullName: 'Nova Versão Internacional',
    badge: 'Contemporânea e Fluida',
    description: 'Tradução equilibrada e clara, excelente para leitura diária e compreensão.'
  },
  {
    id: 'naa',
    name: 'NAA',
    fullName: 'Nova Almeida Atualizada',
    badge: 'Formal e Precisa',
    description: 'Revisão erudita da Sociedade Bíblica do Brasil na norma culta contemporânea.'
  },
  {
    id: 'acf',
    name: 'ACF',
    fullName: 'Almeida Corrigida Fiel',
    badge: 'Clássica da Reforma',
    description: 'Baseada no Textus Receptus, com vocabulário tradicional e reverente.'
  }
];

// Memory cache to avoid re-fetching JSONs during the session
const bibleCache: Partial<Record<BibleVersionId, RawBibleBook[]>> = {};

// Normalize strings for resilient matching (ignores accents and lowercase)
function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Fetch and cache the full Bible text for a given version.
 */
export async function loadBible(version: BibleVersionId): Promise<RawBibleBook[]> {
  if (bibleCache[version]) {
    return bibleCache[version]!;
  }

  try {
    const res = await fetch(`/bibles/${version}.json`);
    if (!res.ok) {
      throw new Error(`Erro ao carregar a versão ${version}: HTTP ${res.status}`);
    }
    const data: RawBibleBook[] = await res.json();
    bibleCache[version] = data;
    return data;
  } catch (err) {
    console.error(`Falha ao carregar versão ${version}`, err);
    throw err;
  }
}

/**
 * Find canonical book index (0 to 65) by name or abbreviation.
 */
export function getBookIndex(bookName: string): number {
  const norm = normalizeName(bookName);
  
  // Try matching directly in BIBLE_BOOKS
  const index = BIBLE_BOOKS.findIndex(b => normalizeName(b.name) === norm);
  if (index !== -1) return index;

  // Common aliases
  const aliasMap: Record<string, number> = {
    'canticos': 21,
    'cantares': 21,
    'cantico dos canticos': 21,
    'lamentacoes': 24,
    'lamentacoes de jeremias': 24,
    'salmo': 18,
    'salmos': 18,
    'proverbio': 19,
    'proverbios': 19,
  };

  if (aliasMap[norm] !== undefined) {
    return aliasMap[norm];
  }

  return 0; // Fallback to Genesis
}

export interface ChapterData {
  bookName: string;
  bookIndex: number;
  chapter: number;
  totalChapters: number;
  verses: string[];
  version: BibleVersionId;
}

/**
 * Get verses for a specific book and chapter in the given version.
 */
export async function getChapterData(
  version: BibleVersionId,
  bookName: string,
  chapterNumber: number
): Promise<ChapterData> {
  const bible = await loadBible(version);
  const bookIdx = getBookIndex(bookName);
  const book = bible[bookIdx];

  if (!book) {
    throw new Error(`Livro não encontrado: ${bookName}`);
  }

  const totalChapters = book.chapters.length;
  const safeChapter = Math.max(1, Math.min(chapterNumber, totalChapters));
  const verses = book.chapters[safeChapter - 1] || [];

  // Use the canonical display name from BIBLE_BOOKS
  const canonicalName = BIBLE_BOOKS[bookIdx]?.name || book.name;

  return {
    bookName: canonicalName,
    bookIndex: bookIdx,
    chapter: safeChapter,
    totalChapters,
    verses,
    version,
  };
}

/**
 * Compute the next chapter pointer.
 */
export function getNextChapter(bookIdx: number, chapter: number): { bookName: string; chapter: number } | null {
  const currentBook = BIBLE_BOOKS[bookIdx];
  if (!currentBook) return null;

  if (chapter < currentBook.chapters) {
    return { bookName: currentBook.name, chapter: chapter + 1 };
  }

  // Move to next book
  if (bookIdx < BIBLE_BOOKS.length - 1) {
    const nextBook = BIBLE_BOOKS[bookIdx + 1];
    return { bookName: nextBook.name, chapter: 1 };
  }

  return null; // End of Revelation
}

/**
 * Compute the previous chapter pointer.
 */
export function getPrevChapter(bookIdx: number, chapter: number): { bookName: string; chapter: number } | null {
  const currentBook = BIBLE_BOOKS[bookIdx];
  if (!currentBook) return null;

  if (chapter > 1) {
    return { bookName: currentBook.name, chapter: chapter - 1 };
  }

  // Move to previous book
  if (bookIdx > 0) {
    const prevBook = BIBLE_BOOKS[bookIdx - 1];
    return { bookName: prevBook.name, chapter: prevBook.chapters };
  }

  return null; // Beginning of Genesis
}

/**
 * Local preference management.
 */
export function getSavedBibleVersion(): BibleVersionId {
  const saved = localStorage.getItem('biblia_preferred_version') as BibleVersionId | null;
  if (saved && (saved === 'nvi' || saved === 'naa' || saved === 'acf')) {
    return saved;
  }
  return 'nvi';
}

export function saveBibleVersion(version: BibleVersionId): void {
  localStorage.setItem('biblia_preferred_version', version);
}
