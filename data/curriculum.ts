export interface Chapter {
  id: string
  title: string
  order: number
}

export interface GradeData {
  grade: 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  label: string
  chapters: Chapter[]
}

export const CURRICULUM: GradeData[] = [
  {
    grade: 5,
    label: 'Clasa a V-a',
    chapters: [
      { id: 'introducere', title: 'Introducere în algoritmică', order: 1 },
      { id: 'variabile', title: 'Variabile și tipuri de date', order: 2 },
      { id: 'conditii', title: 'Instrucțiuni condiționale', order: 3 },
      { id: 'cicluri', title: 'Cicluri repetitive', order: 4 },
    ],
  },
  {
    grade: 6,
    label: 'Clasa a VI-a',
    chapters: [
      { id: 'tablouri', title: 'Tablouri unidimensionale', order: 1 },
      { id: 'siruri', title: 'Șiruri de caractere', order: 2 },
      { id: 'functii', title: 'Funcții și subprograme', order: 3 },
      { id: 'matrice', title: 'Matrice', order: 4 },
    ],
  },
  {
    grade: 7,
    label: 'Clasa a VII-a',
    chapters: [
      { id: 'recursivitate', title: 'Recursivitate', order: 1 },
      { id: 'divide-et-impera', title: 'Divide et Impera', order: 2 },
      { id: 'sortare', title: 'Algoritmi de sortare', order: 3 },
      { id: 'complexitate', title: 'Complexitate algoritmică', order: 4 },
    ],
  },
  {
    grade: 8,
    label: 'Clasa a VIII-a',
    chapters: [
      { id: 'stive-cozi', title: 'Stive și cozi', order: 1 },
      { id: 'liste', title: 'Liste înlănțuite', order: 2 },
      { id: 'greedy', title: 'Algoritmi Greedy', order: 3 },
      { id: 'oji-8', title: 'Pregătire OJI — clasa 8', order: 4 },
    ],
  },
  {
    grade: 9,
    label: 'Clasa a IX-a',
    chapters: [
      { id: 'sortare', title: 'Sortare avansată', order: 1 },
      { id: 'cautare-binara', title: 'Căutare binară', order: 2 },
      { id: 'greedy', title: 'Algoritmi Greedy', order: 3 },
      { id: 'backtracking', title: 'Backtracking', order: 4 },
    ],
  },
  {
    grade: 10,
    label: 'Clasa a X-a',
    chapters: [
      { id: 'grafuri', title: 'Introducere în grafuri', order: 1 },
      { id: 'bfs-dfs', title: 'BFS și DFS', order: 2 },
      { id: 'arbori', title: 'Arbori', order: 3 },
      { id: 'drumuri-minime', title: 'Drumuri minime', order: 4 },
    ],
  },
  {
    grade: 11,
    label: 'Clasa a XI-a',
    chapters: [
      { id: 'programare-dinamica', title: 'Programare dinamică', order: 1 },
      { id: 'fluxuri', title: 'Fluxuri în rețele', order: 2 },
      { id: 'geometrie', title: 'Geometrie computațională', order: 3 },
      { id: 'tehnici-avansate', title: 'Tehnici avansate', order: 4 },
    ],
  },
  {
    grade: 12,
    label: 'Clasa a XII-a',
    chapters: [
      { id: 'algoritmi-avansati', title: 'Algoritmi avansați', order: 1 },
      { id: 'structuri-date', title: 'Structuri de date avansate', order: 2 },
      { id: 'oni-pregatire', title: 'Pregătire ONI', order: 3 },
    ],
  },
]

export function getGradeData(grade: number): GradeData | undefined {
  return CURRICULUM.find((g) => g.grade === grade)
}

export function getChapterTitle(grade: number, chapterId: string): string {
  const gradeData = getGradeData(grade)
  return gradeData?.chapters.find((c) => c.id === chapterId)?.title ?? chapterId
}
