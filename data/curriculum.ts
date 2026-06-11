export type Lesson = {
  id: string
  title: string
  isBridge?: boolean
  visualizer?: string
}

export type Chapter = {
  id: string
  title: string
  order: number
  isNationalExtension?: boolean
  isBaraj?: boolean
  lessons: Lesson[]
}

export type Grade = {
  id: string
  label: string
  chapters: Chapter[]
}

export type LevelDef = {
  id: number
  title: string
  topics: string[]
}

export function getGradeById(id: string): Grade | undefined {
  return CURRICULUM.find((g) => g.id === id)
}

export function getGradeByNumber(n: number): Grade | undefined {
  if (n === 11 || n === 12) return getGradeById('11-12')
  return getGradeById(String(n))
}

export function getGradeData(gradeNum: number): Grade | undefined {
  return getGradeByNumber(gradeNum)
}

export function getChapterTitle(grade: number, chapterId: string): string {
  return (
    getGradeData(grade)?.chapters.find((c) => c.id === chapterId)?.title ??
    chapterId
  )
}

export function gradeNumbers(id: string): number[] {
  if (id === '11-12') return [11, 12]
  const n = parseInt(id, 10)
  return isNaN(n) ? [] : [n]
}

export function gradeSubtitle(id: string): string {
  if (id === '11-12') return 'XI–XII'
  if (id === 'baraj-gimnaziu') return 'Baraj'
  return `Clasa ${id}`
}

export function gradeIdFromNumber(n: number): string {
  if (n === 11 || n === 12) return '11-12'
  return String(n)
}

export const CURRICULUM: Grade[] = [
  {
    id: '5',
    label: 'Clasa a V-a',
    chapters: [
      {
        id: 'fundamente',
        title: 'Fundamente de programare',
        order: 1,
        lessons: [
          { id: 'ce-este-un-algoritm', title: 'Ce este un algoritm' },
          { id: 'variabile-si-tipuri-simple', title: 'Variabile și tipuri simple de date' },
          { id: 'tipul-intreg', title: 'Tipul întreg' },
          { id: 'tipul-logic', title: 'Tipul logic' },
          { id: 'citire-si-afisare', title: 'Citire și afișare' },
          { id: 'expresii-aritmetice-simple', title: 'Expresii aritmetice simple' },
          { id: 'structura-liniara', title: 'Structura liniară' },
          { id: 'structura-alternativa', title: 'Structura alternativă' },
          { id: 'structura-repetitiva', title: 'Structura repetitivă' },
          { id: 'punte-urmarire-manuala', title: 'Lecție-punte: urmărirea manuală a unui algoritm', isBridge: true },
          { id: 'punte-debugging-baza', title: 'Lecție-punte: debugging de bază', isBridge: true },
        ],
      },
      {
        id: 'numere-naturale',
        title: 'Prelucrarea numerelor naturale',
        order: 2,
        lessons: [
          { id: 'cifrele-unui-numar', title: 'Cifrele unui număr' },
          { id: 'suma-produsul-cifrelor', title: 'Suma și produsul cifrelor' },
          { id: 'maxim-minim-cifre', title: 'Maximul și minimul cifrelor' },
          { id: 'inversul-unui-numar', title: 'Inversul unui număr' },
          { id: 'verificari-pe-cifre', title: 'Verificări pe cifre' },
          { id: 'divizori-si-multipli', title: 'Divizori și multipli' },
          { id: 'numere-prime', title: 'Numere prime' },
          { id: 'algoritmul-euclid-cmmdc', title: 'Algoritmul lui Euclid pentru CMMDC' },
          { id: 'cmmmc', title: 'CMMMC' },
          { id: 'numere-prime-intre-ele', title: 'Numere prime între ele' },
          { id: 'simplificarea-fractiilor', title: 'Simplificarea fracțiilor' },
          { id: 'factorial', title: 'Factorial' },
          { id: 'ridicare-la-putere', title: 'Ridicare la putere prin înmulțiri repetate' },
        ],
      },
      {
        id: 'siruri-generate',
        title: 'Șiruri generate',
        order: 3,
        lessons: [
          { id: 'generarea-sirurilor', title: 'Generarea șirurilor după reguli' },
          { id: 'sirul-fibonacci', title: 'Șirul lui Fibonacci' },
          { id: 'siruri-recurente', title: 'Șiruri recurente simple' },
          { id: 'punte-regula-sir', title: 'Lecție-punte: cum recunoști regula unui șir', isBridge: true },
        ],
      },
      {
        id: 'fisiere-text',
        title: 'Fișiere text',
        order: 4,
        lessons: [
          { id: 'citire-din-fisier', title: 'Citirea datelor din fișier' },
          { id: 'scriere-in-fisier', title: 'Scrierea rezultatelor în fișier' },
          { id: 'organizare-date-io', title: 'Organizarea datelor de intrare și ieșire' },
        ],
      },
      {
        id: 'prelucrare-succesiv',
        title: 'Prelucrarea numerelor citite succesiv',
        order: 5,
        lessons: [
          { id: 'prelucrari-fara-memorare', title: 'Prelucrări fără memorarea tuturor valorilor' },
          { id: 'maxim-si-minim', title: 'Maxim și minim' },
          { id: 'primele-doua-maxime', title: 'Primele două maxime sau minime' },
          { id: 'stocarea-ultimului-element', title: 'Stocarea ultimului element' },
          { id: 'stocarea-ultimelor-p-elemente', title: 'Stocarea ultimelor p elemente' },
          { id: 'secvente-cu-proprietati', title: 'Secvențe cu proprietăți' },
          { id: 'numararea-secventelor', title: 'Numărarea secvențelor cu proprietăți' },
        ],
      },
      {
        id: 'vectori',
        title: 'Vectori',
        order: 6,
        isNationalExtension: true,
        lessons: [
          { id: 'notiunea-de-vector', title: 'Noțiunea de vector' },
          { id: 'parcurgerea-unui-vector', title: 'Parcurgerea unui vector', visualizer: 'array-traversal' },
          { id: 'inversarea-unui-vector', title: 'Inversarea unui vector' },
          { id: 'verificarea-proprietatilor-vector', title: 'Verificarea proprietăților unui vector' },
          { id: 'cautare-liniara', title: 'Căutare liniară' },
          { id: 'vectori-de-frecventa', title: 'Vectori de frecvență', visualizer: 'frequency' },
          { id: 'vectori-caracteristici', title: 'Vectori caracteristici', visualizer: 'frequency' },
          { id: 'sortare-prin-selectie', title: 'Sortare prin selecție', visualizer: 'sorting' },
          { id: 'sortare-prin-insertie', title: 'Sortare prin inserție', visualizer: 'sorting' },
          { id: 'bubble-sort', title: 'Bubble sort', visualizer: 'bubble-sort' },
          { id: 'sortare-prin-numarare', title: 'Sortare prin numărare', visualizer: 'counting-sort' },
          { id: 'punte-vector-vs-frecventa', title: 'Lecție-punte: când folosim vector simplu și când folosim vector de frecvență', isBridge: true },
        ],
      },
    ],
  },
  {
    id: '6',
    label: 'Clasa a VI-a',
    chapters: [
      {
        id: 'tipuri-date',
        title: 'Tipuri de date și reprezentări',
        order: 1,
        lessons: [
          { id: 'tipuri-intregi', title: 'Tipuri întregi' },
          { id: 'tipuri-reale', title: 'Tipuri reale' },
          { id: 'tipul-char', title: 'Tipul char' },
          { id: 'punte-alegerea-tipului', title: 'Lecție-punte: alegerea tipului potrivit', isBridge: true },
          { id: 'punte-overflow', title: 'Lecție-punte: overflow', isBridge: true },
        ],
      },
      {
        id: 'sisteme-numeratie',
        title: 'Sisteme de numerație',
        order: 2,
        lessons: [
          { id: 'baze-de-numeratie', title: 'Baze de numerație' },
          { id: 'conversii-intre-baze', title: 'Conversii între baze' },
          { id: 'reprezentare-in-baze', title: 'Reprezentarea numerelor în baze diferite' },
        ],
      },
      {
        id: 'aritmetica-modulara',
        title: 'Aritmetică modulară',
        order: 3,
        lessons: [
          { id: 'restul-impartirii', title: 'Restul împărțirii' },
          { id: 'adunare-modulo', title: 'Adunare modulo' },
          { id: 'scadere-modulo', title: 'Scădere modulo' },
          { id: 'inmultire-modulo', title: 'Înmulțire modulo' },
          { id: 'punte-de-ce-modulo', title: 'Lecție-punte: de ce folosim modulo în probleme', isBridge: true },
        ],
      },
      {
        id: 'divizibilitate-avansata',
        title: 'Divizibilitate avansată',
        order: 4,
        lessons: [
          { id: 'ciurul-eratostene', title: 'Ciurul lui Eratostene' },
          { id: 'descompunere-factori-primi', title: 'Descompunerea în factori primi' },
          { id: 'precalculare', title: 'Precalcularea informațiilor despre numere' },
          { id: 'punte-precalculare', title: 'Lecție-punte: ideea de precalculare', isBridge: true },
        ],
      },
      {
        id: 'vectori-mediu',
        title: 'Vectori — nivel mediu',
        order: 5,
        lessons: [
          { id: 'operatii-cu-multimi', title: 'Operații cu mulțimi' },
          { id: 'interclasare', title: 'Interclasarea vectorilor' },
          { id: 'cautare-binara', title: 'Căutare binară', visualizer: 'cautare-binara' },
          { id: 'sume-partiale', title: 'Sume parțiale', visualizer: 'prefix-sums' },
          { id: 'maxime-minime-prefixe', title: 'Maxime și minime pe prefixe' },
          { id: 'maxime-minime-sufixe', title: 'Maxime și minime pe sufixe' },
          { id: 'secvente-lungime-fixa', title: 'Secvențe de lungime fixă' },
          { id: 'secvente-maximale', title: 'Secvențe maximale cu proprietăți' },
          { id: 'numarare-secvente-6', title: 'Numărarea secvențelor' },
          { id: 'cautarea-subsecventei-patratic', title: 'Căutarea unei subsecvențe în timp pătratic' },
          { id: 'punte-interval-subsecventa', title: 'Lecție-punte: interval, subsecvență și subșir', isBridge: true },
        ],
      },
      {
        id: 'matrice',
        title: 'Matrice',
        order: 6,
        isNationalExtension: true,
        lessons: [
          { id: 'notiunea-de-matrice', title: 'Noțiunea de matrice' },
          { id: 'parcurgeri-linii', title: 'Parcurgeri pe linii' },
          { id: 'parcurgeri-coloane', title: 'Parcurgeri pe coloane' },
          { id: 'parcurgeri-diagonale', title: 'Parcurgeri pe diagonale' },
          { id: 'parcurgeri-spirala', title: 'Parcurgeri în spirală' },
          { id: 'generarea-matricelor', title: 'Generarea matricelor' },
          { id: 'transpunere-matrice', title: 'Transpunerea unei matrice' },
          { id: 'bordare-matrice', title: 'Bordarea unei matrice' },
          { id: 'zone-diagonale', title: 'Zone determinate de diagonale' },
          { id: 'cautari-in-matrice', title: 'Căutări în matrice' },
          { id: 'cautarea-submatricei', title: 'Căutarea unei submatrice' },
          { id: 'vectori-de-directie', title: 'Vectori de direcție' },
          { id: 'punte-erori-indici-matrice', title: 'Lecție-punte: cum eviți erorile de indici în matrice', isBridge: true },
        ],
      },
      {
        id: 'simulari',
        title: 'Simulări',
        order: 7,
        isNationalExtension: true,
        lessons: [
          { id: 'reprezentarea-sistemului', title: 'Reprezentarea sistemului simulat' },
          { id: 'starea-sistemului', title: 'Starea sistemului' },
          { id: 'evenimente-stare', title: 'Evenimente care modifică starea' },
          { id: 'simulari-pe-vectori', title: 'Simulări pe vectori' },
          { id: 'simulari-pe-matrice', title: 'Simulări pe matrice' },
          { id: 'punte-ce-memoram-simulare', title: 'Lecție-punte: ce trebuie memorat într-o simulare', isBridge: true },
        ],
      },
    ],
  },
  {
    id: '7',
    label: 'Clasa a VII-a',
    chapters: [
      {
        id: 'functii',
        title: 'Funcții',
        order: 1,
        lessons: [
          { id: 'declararea-functiilor', title: 'Declararea funcțiilor' },
          { id: 'definirea-functiilor', title: 'Definirea funcțiilor' },
          { id: 'apelul-functiilor', title: 'Apelul funcțiilor' },
          { id: 'variabile-locale', title: 'Variabile locale' },
          { id: 'variabile-globale', title: 'Variabile globale' },
          { id: 'parametri-prin-valoare', title: 'Parametri transmiși prin valoare' },
          { id: 'parametri-prin-referinta', title: 'Parametri transmiși prin referință' },
          { id: 'punte-problema-in-functii', title: 'Lecție-punte: cum împarți o problemă mare în funcții mici', isBridge: true },
        ],
      },
      {
        id: 'tehnici-tablouri',
        title: 'Tehnici pe tablouri',
        order: 2,
        lessons: [
          { id: 'two-pointers', title: 'Two Pointers', visualizer: 'two-pointers' },
          { id: 'difference-arrays-1d', title: 'Difference Arrays 1D', visualizer: 'difference-array' },
          { id: 'secventa-suma-maxima', title: 'Secvența de sumă maximă', visualizer: 'kadane' },
          { id: 'elementul-majoritar', title: 'Elementul majoritar' },
          { id: 'sume-partiale-matrice', title: 'Sume parțiale în matrice', visualizer: 'prefix-sums-2d' },
          { id: 'prefixe-sufixe-matrice', title: 'Prefixe și sufixe pe linii și coloane' },
          { id: 'tablouri-multidimensionale', title: 'Tablouri multidimensionale' },
          { id: 'punte-invariant', title: 'Lecție-punte: invariantul unui algoritm', isBridge: true },
        ],
      },
      {
        id: 'structuri-neomogene',
        title: 'Structuri de date neomogene',
        order: 3,
        lessons: [
          { id: 'tipul-struct', title: 'Tipul struct' },
          { id: 'vectori-de-structuri', title: 'Vectori de structuri' },
          { id: 'sortarea-structurilor', title: 'Sortarea structurilor' },
          { id: 'punte-campuri-struct', title: 'Lecție-punte: alegerea câmpurilor importante', isBridge: true },
        ],
      },
      {
        id: 'stl-sortare-cautare',
        title: 'STL pentru sortare și căutare',
        order: 4,
        lessons: [
          { id: 'stl-sort', title: 'sort' },
          { id: 'comparatori', title: 'Comparatori' },
          { id: 'stl-binary-search', title: 'binary_search' },
          { id: 'lower-bound', title: 'lower_bound' },
          { id: 'upper-bound', title: 'upper_bound' },
          { id: 'punte-sortare-criterii', title: 'Lecție-punte: sortare după mai multe criterii', isBridge: true },
        ],
      },
      {
        id: 'greedy',
        title: 'Greedy',
        order: 5,
        lessons: [
          { id: 'ideea-greedy', title: 'Ideea metodei Greedy' },
          { id: 'alegere-locala-optima', title: 'Alegerea locală optimă' },
          { id: 'greedy-cu-sortare', title: 'Probleme Greedy cu sortare' },
          { id: 'greedy-cu-intervale', title: 'Probleme Greedy cu intervale' },
          { id: 'punte-justificare-greedy', title: 'Lecție-punte: cum justifici corectitudinea unei soluții Greedy', isBridge: true },
        ],
      },
      {
        id: 'numere-mari',
        title: 'Numere mari',
        order: 6,
        isNationalExtension: true,
        lessons: [
          { id: 'reprezentarea-numerelor-mari', title: 'Reprezentarea numerelor mari' },
          { id: 'adunare-numere-mari', title: 'Adunarea numerelor mari' },
          { id: 'scadere-numere-mari', title: 'Scăderea numerelor mari' },
          { id: 'inmultire-numar-mare', title: 'Înmulțirea unui număr mare cu un număr natural' },
          { id: 'impartire-numar-mare', title: 'Împărțirea unui număr mare la un număr natural' },
        ],
      },
      {
        id: 'exponentiere-rapida',
        title: 'Exponențiere rapidă',
        order: 7,
        isNationalExtension: true,
        lessons: [
          { id: 'putere-logaritmica', title: 'Ridicare la putere în timp logaritmic' },
          { id: 'exponentiere-modulo', title: 'Exponențiere rapidă modulo' },
        ],
      },
      {
        id: 'stiva',
        title: 'Stiva',
        order: 8,
        isNationalExtension: true,
        lessons: [
          { id: 'notiunea-de-stiva', title: 'Noțiunea de stivă' },
          { id: 'operatii-stiva', title: 'Operații cu stiva' },
          { id: 'aplicatii-stiva', title: 'Aplicații specifice' },
          { id: 'paranteze-corecte', title: 'Paranteze corecte' },
          { id: 'elemente-urmatoare-mai-mari', title: 'Elemente următoare mai mari sau mai mici' },
          { id: 'punte-stiva-memorie', title: 'Lecție-punte: stiva ca memorie a elementelor nerezolvate', isBridge: true },
        ],
      },
    ],
  },
  {
    id: '8',
    label: 'Clasa a VIII-a',
    chapters: [
      {
        id: 'siruri-caractere',
        title: 'Șiruri de caractere',
        order: 1,
        lessons: [
          { id: 'tipul-char-8', title: 'Tipul char' },
          { id: 'tipul-string', title: 'Tipul string' },
          { id: 'parcurgerea-sirului', title: 'Parcurgerea unui șir de caractere' },
          { id: 'functii-siruri', title: 'Funcții specifice pentru șiruri' },
          { id: 'frecvente-caractere', title: 'Frecvențe de caractere', visualizer: 'frequency' },
          { id: 'prefixe-sufixe-siruri', title: 'Prefixe și sufixe' },
          { id: 'palindroame', title: 'Palindroame' },
          { id: 'cautari-in-siruri', title: 'Căutări în șiruri' },
          { id: 'punte-sir-vs-vector', title: 'Lecție-punte: șir de caractere vs vector de valori', isBridge: true },
        ],
      },
      {
        id: 'generari-combinatoriale',
        title: 'Generări combinatoriale',
        order: 2,
        lessons: [
          { id: 'algoritmi-succesor', title: 'Algoritmi de tip succesor' },
          { id: 'submultimi', title: 'Submulțimi' },
          { id: 'produs-cartezian', title: 'Produs cartezian' },
          { id: 'permutari', title: 'Permutări' },
          { id: 'combinari', title: 'Combinări' },
          { id: 'aranjamente', title: 'Aranjamente' },
          { id: 'stl-permutari', title: 'Funcții STL pentru permutări' },
          { id: 'punte-ordine-lexicografica', title: 'Lecție-punte: ordine lexicografică', isBridge: true },
        ],
      },
      {
        id: 'coada',
        title: 'Coada',
        order: 3,
        isNationalExtension: true,
        lessons: [
          { id: 'notiunea-de-coada', title: 'Noțiunea de coadă' },
          { id: 'operatii-coada', title: 'Operații cu coada' },
          { id: 'aplicatii-coada', title: 'Aplicații specifice' },
        ],
      },
      {
        id: 'deque',
        title: 'Deque',
        order: 4,
        isNationalExtension: true,
        lessons: [
          { id: 'notiunea-de-deque', title: 'Noțiunea de deque' },
          { id: 'operatii-deque', title: 'Operații cu deque' },
          { id: 'aplicatii-deque', title: 'Aplicații specifice' },
          { id: 'punte-stack-queue-deque', title: 'Lecție-punte: diferența dintre stack, queue și deque', isBridge: true },
        ],
      },
      {
        id: 'geometrie-8',
        title: 'Geometrie',
        order: 5,
        isNationalExtension: true,
        lessons: [
          { id: 'sistemul-cartezian', title: 'Sistemul de coordonate cartezian' },
          { id: 'puncte-in-plan', title: 'Puncte în plan' },
          { id: 'distanta-doua-puncte', title: 'Distanța dintre două puncte' },
          { id: 'arii', title: 'Arii' },
          { id: 'punte-geometrie-desen', title: 'Lecție-punte: geometrie cu desen și formule', isBridge: true },
        ],
      },
    ],
  },
  {
    id: 'baraj-gimnaziu',
    label: 'Baraj gimnaziu',
    chapters: [
      {
        id: 'baraj',
        title: 'Baraj',
        order: 1,
        isBaraj: true,
        lessons: [
          { id: 'operatii-pe-biti', title: 'Operații pe biți' },
          { id: 'indicatorul-euler', title: 'Indicatorul lui Euler' },
          { id: 'difference-arrays-2d', title: 'Difference Arrays 2D' },
          { id: 'recursivitate', title: 'Recursivitate' },
          { id: 'algoritmul-fill', title: 'Algoritmul de fill' },
          { id: 'algoritmul-lee', title: 'Algoritmul lui Lee' },
          { id: 'sqrt-decomposition', title: 'Square Root Decomposition' },
          { id: 'programare-dinamica-baraj', title: 'Programare dinamică' },
          { id: 'punte-stari-tranzitii-dp', title: 'Lecție-punte: stări și tranziții în programarea dinamică', isBridge: true },
        ],
      },
    ],
  },
  {
    id: '9',
    label: 'Clasa a IX-a',
    chapters: [
      {
        id: 'fundamente-cpp',
        title: 'Fundamente C++',
        order: 1,
        lessons: [
          { id: 'structura-program-cpp', title: 'Structura unui program C++' },
          { id: 'tipuri-simple-date', title: 'Tipuri simple de date' },
          { id: 'variabile-9', title: 'Variabile' },
          { id: 'expresii', title: 'Expresii' },
          { id: 'citire-afisare', title: 'Citire și afișare' },
          { id: 'structura-liniara-9', title: 'Structura liniară' },
          { id: 'structura-alternativa-9', title: 'Structura alternativă' },
          { id: 'structura-repetitiva-9', title: 'Structura repetitivă' },
          { id: 'fisiere-text-9', title: 'Fișiere text' },
          { id: 'punte-complexitate', title: 'Lecție-punte: complexitate O(1), O(n), O(n²), O(log n)', isBridge: true },
        ],
      },
      {
        id: 'numere-divizibilitate-9',
        title: 'Numere și divizibilitate',
        order: 2,
        lessons: [
          { id: 'prelucrarea-cifrelor', title: 'Prelucrarea cifrelor' },
          { id: 'divizori', title: 'Divizori' },
          { id: 'numere-prime-9', title: 'Numere prime' },
          { id: 'cmmdc', title: 'CMMDC' },
          { id: 'cmmmc-9', title: 'CMMMC' },
          { id: 'numere-prime-intre-ele-9', title: 'Numere prime între ele' },
          { id: 'simplificarea-fractiilor-9', title: 'Simplificarea fracțiilor' },
          { id: 'descompunere-factori-primi-9', title: 'Descompunerea în factori primi' },
          { id: 'factorial-9', title: 'Factorial' },
          { id: 'ridicare-la-putere-9', title: 'Ridicare la putere' },
          { id: 'exponentiere-rapida-9', title: 'Exponențiere rapidă' },
        ],
      },
      {
        id: 'sisteme-biti-9',
        title: 'Sisteme de numerație și biți',
        order: 3,
        lessons: [
          { id: 'sisteme-numeratie-9', title: 'Sisteme de numerație' },
          { id: 'conversii-intre-baze-9', title: 'Conversii între baze' },
          { id: 'reprezentare-memorie', title: 'Reprezentarea numerelor în memorie' },
          { id: 'operatii-biti-9', title: 'Operații pe biți' },
          { id: 'punte-masti-biti', title: 'Lecție-punte: măști de biți pentru începători', isBridge: true },
        ],
      },
      {
        id: 'siruri-generate-9',
        title: 'Șiruri generate',
        order: 4,
        lessons: [
          { id: 'generarea-sirurilor-9', title: 'Generarea șirurilor după reguli' },
          { id: 'sirul-fibonacci-9', title: 'Șirul lui Fibonacci' },
          { id: 'alte-siruri-recurente', title: 'Alte șiruri recurente' },
          { id: 'punte-formula-simulare-recurenta', title: 'Lecție-punte: formulă, simulare și recurență', isBridge: true },
        ],
      },
      {
        id: 'vectori-9',
        title: 'Vectori',
        order: 5,
        lessons: [
          { id: 'parcurgerea-vectorilor', title: 'Parcurgerea vectorilor', visualizer: 'array-traversal' },
          { id: 'inversarea-vectorilor', title: 'Inversarea vectorilor' },
          { id: 'verificarea-proprietatilor', title: 'Verificarea proprietăților' },
          { id: 'sortari-patratice', title: 'Sortări pătratice', visualizer: 'sorting' },
          { id: 'sortare-numarare-9', title: 'Sortare prin numărare', visualizer: 'counting-sort' },
          { id: 'interclasare-9', title: 'Interclasare' },
          { id: 'vectori-frecventa-9', title: 'Vectori de frecvență', visualizer: 'frequency' },
          { id: 'vectori-caracteristici-9', title: 'Vectori caracteristici', visualizer: 'frequency' },
          { id: 'operatii-multimi-9', title: 'Operații cu mulțimi' },
          { id: 'ciurul-eratostene-9', title: 'Ciurul lui Eratostene' },
          { id: 'cautare-binara-9', title: 'Căutare binară', visualizer: 'cautare-binara' },
          { id: 'elementul-majoritar-9', title: 'Elementul majoritar' },
          { id: 'sume-partiale-9', title: 'Sume parțiale', visualizer: 'prefix-sums' },
          { id: 'secvente-de-valori', title: 'Secvențe de valori', visualizer: 'sliding-window' },
          { id: 'two-pointers-9', title: 'Two Pointers', visualizer: 'two-pointers' },
          { id: 'difference-arrays-1d-9', title: 'Difference Arrays 1D', visualizer: 'difference-array' },
          { id: 'secventa-suma-maxima-9', title: 'Secvența de sumă maximă', visualizer: 'kadane' },
          { id: 'punte-tehnica-vectori', title: 'Lecție-punte: alegerea tehnicii potrivite pentru vectori', isBridge: true },
        ],
      },
      {
        id: 'matrice-9',
        title: 'Matrice',
        order: 6,
        lessons: [
          { id: 'parcurgeri-matrice-9', title: 'Parcurgeri în matrice' },
          { id: 'generari-matrice-9', title: 'Generări în matrice' },
          { id: 'simulari-matrice-9', title: 'Simulări în matrice' },
          { id: 'diagonale-9', title: 'Diagonale' },
          { id: 'zone-diagonale-9', title: 'Zone determinate de diagonale' },
          { id: 'sume-partiale-matrice-9', title: 'Sume parțiale în matrice', visualizer: 'prefix-sums-2d' },
          { id: 'punte-indici-matrice', title: 'Lecție-punte: indicii în matrice', isBridge: true },
        ],
      },
      {
        id: 'structuri-greedy-9',
        title: 'Structuri și Greedy',
        order: 7,
        lessons: [
          { id: 'tipul-struct-9', title: 'Tipul struct' },
          { id: 'vectori-structuri-9', title: 'Vectori de structuri' },
          { id: 'sortarea-structurilor-9', title: 'Sortarea structurilor' },
          { id: 'metoda-greedy', title: 'Metoda Greedy' },
          { id: 'greedy-sortare-9', title: 'Probleme Greedy cu sortare' },
          { id: 'punte-demonstratie-greedy', title: 'Lecție-punte: demonstrația intuitivă a unui Greedy', isBridge: true },
        ],
      },
      {
        id: 'extensie-nationala-9',
        title: 'Extensie pentru etapa națională',
        order: 8,
        isNationalExtension: true,
        lessons: [
          { id: 'difference-arrays-2d-9', title: 'Difference Arrays 2D' },
          { id: 'indicatorul-euler-9', title: 'Indicatorul lui Euler' },
          { id: 'functii-9-ext', title: 'Funcții' },
          { id: 'stl-sortare-cautare-9', title: 'STL pentru sortare și căutare' },
          { id: 'generari-combinatoriale-9', title: 'Generări combinatoriale' },
          { id: 'submultimi-9', title: 'Submulțimi' },
          { id: 'produs-cartezian-9', title: 'Produs cartezian' },
          { id: 'permutari-9', title: 'Permutări' },
          { id: 'combinari-9', title: 'Combinări' },
          { id: 'aranjamente-9', title: 'Aranjamente' },
        ],
      },
    ],
  },
  {
    id: '10',
    label: 'Clasa a X-a',
    chapters: [
      {
        id: 'siruri-caractere-10',
        title: 'Șiruri de caractere',
        order: 1,
        lessons: [
          { id: 'tipul-string-10', title: 'Tipul string' },
          { id: 'functii-string', title: 'Funcții specifice' },
          { id: 'parcurgeri-string', title: 'Parcurgeri' },
          { id: 'frecvente-string', title: 'Frecvențe', visualizer: 'frequency' },
          { id: 'prefixe-sufixe-string', title: 'Prefixe și sufixe' },
          { id: 'palindroame-10', title: 'Palindroame' },
          { id: 'cautari-siruri-10', title: 'Căutări în șiruri' },
        ],
      },
      {
        id: 'structuri-liniare-10',
        title: 'Structuri de date liniare',
        order: 2,
        lessons: [
          { id: 'stiva-10', title: 'Stiva' },
          { id: 'coada-10', title: 'Coada' },
          { id: 'algoritmul-lee-10', title: 'Algoritmul lui Lee' },
          { id: 'deque-10', title: 'Deque' },
          { id: 'liste-simplu-inlantuite', title: 'Liste simplu înlănțuite' },
          { id: 'liste-dublu-inlantuite', title: 'Liste dublu înlănțuite' },
          { id: 'punte-cand-folosim-structura', title: 'Lecție-punte: când folosim fiecare structură', isBridge: true },
        ],
      },
      {
        id: 'stl-10',
        title: 'STL',
        order: 3,
        lessons: [
          { id: 'stl-pair', title: 'pair' },
          { id: 'stl-vector', title: 'vector' },
          { id: 'stl-list', title: 'list' },
          { id: 'stl-deque', title: 'deque' },
          { id: 'stl-queue', title: 'queue' },
          { id: 'stl-priority-queue', title: 'priority_queue' },
          { id: 'stl-stack', title: 'stack' },
          { id: 'stl-set', title: 'set' },
          { id: 'stl-multiset', title: 'multiset' },
          { id: 'stl-unordered-set', title: 'unordered_set' },
          { id: 'stl-map', title: 'map' },
          { id: 'stl-multimap', title: 'multimap' },
          { id: 'stl-unordered-map', title: 'unordered_map' },
          { id: 'stl-bitset', title: 'bitset' },
          { id: 'punte-complexitati-stl', title: 'Lecție-punte: complexitățile structurilor STL', isBridge: true },
        ],
      },
      {
        id: 'numere-mari-10',
        title: 'Numere mari',
        order: 4,
        lessons: [
          { id: 'reprezentare-numere-mari-10', title: 'Reprezentarea numerelor mari' },
          { id: 'adunare-numere-mari-10', title: 'Adunare' },
          { id: 'scadere-numere-mari-10', title: 'Scădere' },
          { id: 'inmultire-numere-mari', title: 'Înmulțire cu număr natural' },
          { id: 'impartire-numere-mari', title: 'Împărțire cu rest la număr natural' },
        ],
      },
      {
        id: 'combinatorica-modulara-10',
        title: 'Combinatorică și modulară',
        order: 5,
        lessons: [
          { id: 'numarare-submultimi', title: 'Numărarea submulțimilor' },
          { id: 'numarare-permutari', title: 'Numărarea permutărilor' },
          { id: 'numarare-aranjamente', title: 'Numărarea aranjamentelor' },
          { id: 'numarare-combinari', title: 'Numărarea combinărilor' },
          { id: 'parantezari', title: 'Parantezări' },
          { id: 'partitii', title: 'Partiții' },
          { id: 'numar-de-ordine', title: 'Număr de ordine' },
          { id: 'aritmetica-modulara-10', title: 'Aritmetică modulară' },
          { id: 'invers-modular', title: 'Invers modular pentru modulo prim' },
          { id: 'punte-de-ce-modulo-10', title: 'Lecție-punte: de ce lucrăm modulo', isBridge: true },
        ],
      },
      {
        id: 'recursivitate-10',
        title: 'Recursivitate',
        order: 6,
        lessons: [
          { id: 'functii-recursive', title: 'Funcții recursive' },
          { id: 'caz-de-baza', title: 'Caz de bază' },
          { id: 'apel-recursiv', title: 'Apel recursiv' },
          { id: 'stiva-apelurilor', title: 'Stiva apelurilor' },
          { id: 'relatii-recurenta', title: 'Relații de recurență' },
          { id: 'punte-arbore-recursie', title: 'Lecție-punte: desenarea arborelui de recursie', isBridge: true },
        ],
      },
      {
        id: 'divide-et-impera-10',
        title: 'Divide et Impera',
        order: 7,
        lessons: [
          { id: 'ideea-divide-et-impera', title: 'Ideea metodei Divide et Impera' },
          { id: 'impartirea-problemei', title: 'Împărțirea problemei' },
          { id: 'rezolvarea-subproblemelor', title: 'Rezolvarea subproblemelor' },
          { id: 'combinarea-rezultatelor', title: 'Combinarea rezultatelor' },
          { id: 'exemple-clasice-divide', title: 'Exemple clasice' },
        ],
      },
      {
        id: 'geometrie-10',
        title: 'Geometrie',
        order: 8,
        isNationalExtension: true,
        lessons: [
          { id: 'sistemul-cartezian-10', title: 'Sistemul cartezian' },
          { id: 'distanta-doua-puncte-10', title: 'Distanța dintre două puncte' },
          { id: 'ecuatia-dreptei', title: 'Ecuația dreptei' },
          { id: 'panta-dreptei', title: 'Panta unei drepte' },
          { id: 'distanta-punct-dreapta', title: 'Distanța dintre punct și dreaptă' },
          { id: 'intersectii-drepte', title: 'Intersecții de drepte și segmente' },
          { id: 'arii-10', title: 'Arii' },
          { id: 'algoritmi-baleiere', title: 'Algoritmi de baleiere' },
          { id: 'infasuratoare-convexa', title: 'Înfășurătoare convexă' },
        ],
      },
      {
        id: 'backtracking-10',
        title: 'Backtracking',
        order: 9,
        isNationalExtension: true,
        lessons: [
          { id: 'backtracking-elementar', title: 'Backtracking elementar' },
          { id: 'backtracking-in-plan', title: 'Backtracking în plan' },
          { id: 'generarea-solutiilor', title: 'Generarea soluțiilor' },
          { id: 'taiere-ramuri', title: 'Tăierea ramurilor inutile' },
        ],
      },
      {
        id: 'programare-dinamica-10',
        title: 'Programare dinamică',
        order: 10,
        isNationalExtension: true,
        lessons: [
          { id: 'ideea-programarii-dinamice', title: 'Ideea programării dinamice' },
          { id: 'stari-dp', title: 'Stări' },
          { id: 'tranzitii-dp', title: 'Tranziții' },
          { id: 'initializare-dp', title: 'Inițializare' },
          { id: 'probleme-numarare-dp', title: 'Probleme de numărare' },
          { id: 'probleme-optimizare-dp', title: 'Probleme de optimizare' },
          { id: 'memoizare-dp', title: 'Memoizare' },
          { id: 'punte-alegerea-starii-dp', title: 'Lecție-punte: cum alegi starea într-un DP', isBridge: true },
        ],
      },
    ],
  },
  {
    id: '11-12',
    label: 'Clasele XI–XII',
    chapters: [
      {
        id: 'grafuri-notiuni',
        title: 'Grafuri — noțiuni de bază',
        order: 1,
        lessons: [
          { id: 'graf-neorientat', title: 'Graf neorientat' },
          { id: 'graf-orientat', title: 'Graf orientat' },
          { id: 'lant', title: 'Lanț' },
          { id: 'drum', title: 'Drum' },
          { id: 'ciclu', title: 'Ciclu' },
          { id: 'circuit', title: 'Circuit' },
          { id: 'grad', title: 'Grad' },
          { id: 'graf-partial', title: 'Graf parțial' },
          { id: 'subgraf', title: 'Subgraf' },
          { id: 'conexitate', title: 'Conexitate' },
          { id: 'tare-conexitate', title: 'Tare conexitate' },
          { id: 'graf-ponderat', title: 'Graf ponderat' },
          { id: 'arbore', title: 'Arbore' },
          { id: 'arbore-partial', title: 'Arbore parțial' },
          { id: 'arbore-partial-cost-minim', title: 'Arbore parțial de cost minim' },
          { id: 'punte-problema-in-graf', title: 'Lecție-punte: transformarea unei probleme într-un graf', isBridge: true },
        ],
      },
      {
        id: 'tipuri-grafuri',
        title: 'Tipuri speciale de grafuri',
        order: 2,
        lessons: [
          { id: 'graf-complet', title: 'Graf complet' },
          { id: 'graf-hamiltonian', title: 'Graf hamiltonian' },
          { id: 'graf-eulerian', title: 'Graf eulerian' },
          { id: 'graf-bipartit', title: 'Graf bipartit' },
          { id: 'graf-turneu', title: 'Graf turneu' },
        ],
      },
      {
        id: 'reprezentare-grafuri',
        title: 'Reprezentarea grafurilor',
        order: 3,
        lessons: [
          { id: 'matrice-adiacenta', title: 'Matrice de adiacență' },
          { id: 'liste-adiacenta', title: 'Liste de adiacență' },
          { id: 'lista-muchiilor', title: 'Lista muchiilor' },
          { id: 'lista-arcelor', title: 'Lista arcelor' },
          { id: 'matricea-costurilor', title: 'Matricea costurilor' },
          { id: 'liste-adiacenta-costuri', title: 'Liste de adiacență cu costuri' },
          { id: 'lista-muchiilor-costuri', title: 'Lista muchiilor cu costuri' },
          { id: 'punte-reprezentare-graf', title: 'Lecție-punte: alegerea reprezentării potrivite', isBridge: true },
        ],
      },
      {
        id: 'parcurgeri-grafuri',
        title: 'Parcurgeri și conectivitate',
        order: 4,
        lessons: [
          { id: 'bfs', title: 'BFS' },
          { id: 'dfs', title: 'DFS' },
          { id: 'componente-conexe', title: 'Componente conexe' },
          { id: 'componente-tare-conexe', title: 'Componente tare conexe' },
          { id: 'algoritmul-kosaraju', title: 'Algoritmul Kosaraju-Sharir' },
          { id: 'graful-ctc', title: 'Graful componentelor tare conexe' },
          { id: 'parcurgere-euleriana', title: 'Parcurgere euleriană' },
          { id: 'punte-dfs-unealta', title: 'Lecție-punte: DFS ca unealtă generală', isBridge: true },
        ],
      },
      {
        id: 'drumuri-ordine',
        title: 'Drumuri și ordine în grafuri',
        order: 5,
        lessons: [
          { id: 'roy-warshall', title: 'Roy-Warshall' },
          { id: 'sortare-topologica', title: 'Sortare topologică' },
          { id: 'descompunere-dag', title: 'Descompunerea pe niveluri a unui DAG' },
          { id: 'dijkstra', title: 'Dijkstra' },
          { id: 'bellman-ford', title: 'Bellman-Ford' },
          { id: 'roy-floyd', title: 'Roy-Floyd' },
          { id: 'drumuri-cost-minim', title: 'Drumuri de cost minim' },
          { id: 'lant-ciclu-hamiltonian', title: 'Lanț/ciclu hamiltonian' },
          { id: 'lant-ciclu-eulerian', title: 'Lanț/ciclu eulerian' },
          { id: 'punte-parcurgere-vs-drum', title: 'Lecție-punte: diferența dintre parcurgere și drum minim', isBridge: true },
        ],
      },
      {
        id: 'structuri-arborescente',
        title: 'Structuri de date arborescente',
        order: 6,
        lessons: [
          { id: 'arbori-cu-radacina', title: 'Arbori cu rădăcină' },
          { id: 'arbori-binari', title: 'Arbori binari' },
          { id: 'arbore-binar-complet', title: 'Arbore binar complet' },
          { id: 'reprezentare-secventiala', title: 'Reprezentare secvențială' },
          { id: 'heap', title: 'Heap' },
          { id: 'arbore-binar-cautare', title: 'Arbore binar de căutare' },
          { id: 'operatii-structuri-date', title: 'Operații pe structuri de date' },
          { id: 'interogari', title: 'Interogări' },
          { id: 'actualizari', title: 'Actualizări' },
          { id: 'union-find', title: 'Union-Find / Disjoint Set Union' },
          { id: 'punte-structuri-interogari', title: 'Lecție-punte: structuri pentru interogări și actualizări rapide', isBridge: true },
        ],
      },
      {
        id: 'arbori-acm',
        title: 'Arbori și arbori de cost minim',
        order: 7,
        lessons: [
          { id: 'proprietatile-arborilor', title: 'Proprietățile arborilor' },
          { id: 'arbori-partiali', title: 'Arbori parțiali' },
          { id: 'kruskal', title: 'Kruskal' },
          { id: 'prim', title: 'Prim' },
          { id: 'punte-arbore-n-minus-1', title: 'Lecție-punte: de ce un arbore cu n noduri are n−1 muchii', isBridge: true },
        ],
      },
      {
        id: 'dp-avansat',
        title: 'Programare dinamică avansată',
        order: 8,
        lessons: [
          { id: 'recapitulare-dp', title: 'Recapitulare DP' },
          { id: 'dp-pe-arbori', title: 'DP pe arbori' },
          { id: 'dp-pe-grafuri', title: 'DP pe grafuri' },
          { id: 'dp-stari-exponentiale', title: 'DP pe stări exponențiale' },
          { id: 'dp-bitmask', title: 'DP cu bitmask' },
          { id: 'punte-modelare-dp', title: 'Lecție-punte: modelarea unei probleme ca DP', isBridge: true },
        ],
      },
      {
        id: 'grafuri-avansate',
        title: 'Grafuri avansate',
        order: 9,
        isNationalExtension: true,
        lessons: [
          { id: 'puncte-de-articulatie', title: 'Puncte de articulație' },
          { id: 'punti', title: 'Punți' },
          { id: 'componente-biconexe', title: 'Componente biconexe' },
          { id: 'algoritmul-dial', title: 'Algoritmul lui Dial' },
        ],
      },
      {
        id: 'arbori-avansati',
        title: 'Arbori și structuri avansate',
        order: 10,
        isNationalExtension: true,
        lessons: [
          { id: 'lca', title: 'LCA' },
          { id: 'diametrul-arborelui', title: 'Diametrul unui arbore' },
          { id: 'fenwick-tree', title: 'Fenwick Tree' },
          { id: 'segment-tree', title: 'Segment Tree' },
          { id: 'rmq', title: 'RMQ' },
        ],
      },
      {
        id: 'tehnici-avansate-11-12',
        title: 'Tehnici avansate',
        order: 11,
        isNationalExtension: true,
        lessons: [
          { id: 'sqrt-decomp-1112', title: 'Square Root Decomposition' },
          { id: 'algoritmul-mo', title: 'Algoritmul lui Mo' },
          { id: 'meet-in-the-middle', title: 'Meet in the Middle' },
          { id: 'matrici-logaritmice', title: 'Ridicarea matricilor la putere în timp logaritmic' },
          { id: 'recurente-matrici', title: 'Recurențe liniare cu matrici' },
          { id: 'includere-excludere', title: 'Principiul includerii și excluderii' },
          { id: 'functia-mobius', title: 'Funcția Mobius' },
          { id: 'punte-alegere-structuri-avansate', title: 'Lecție-punte: cum alegi între Fenwick, Segment Tree, RMQ, Sqrt Decomposition și Mo', isBridge: true },
        ],
      },
    ],
  },
]

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    title: 'Start',
    topics: ['Variabile', 'Condiții', 'Bucle', 'Fișiere', 'Cifrele unui număr', 'Probleme simple cu numere'],
  },
  {
    id: 2,
    title: 'Date',
    topics: ['Vectori', 'Frecvențe', 'Sortări', 'Căutări', 'Matrice'],
  },
  {
    id: 3,
    title: 'Tehnici de bază',
    topics: ['Sume parțiale', 'Căutare binară', 'Two Pointers', 'Difference Arrays', 'Greedy'],
  },
  {
    id: 4,
    title: 'Structuri și generări',
    topics: ['Funcții', 'Struct', 'STL', 'Stack', 'Queue', 'Deque', 'Stringuri', 'Generări combinatoriale'],
  },
  {
    id: 5,
    title: 'Algoritmi clasici',
    topics: ['Recursivitate', 'Backtracking', 'Divide et Impera', 'Programare dinamică', 'Lee', 'Geometrie'],
  },
  {
    id: 6,
    title: 'Grafuri și arbori',
    topics: ['BFS', 'DFS', 'Componente conexe', 'Componente tare conexe', 'Drumuri minime', 'Arbori', 'MST', 'DSU'],
  },
  {
    id: 7,
    title: 'Performanță',
    topics: [
      'DP avansat',
      'LCA',
      'Fenwick Tree',
      'Segment Tree',
      'RMQ',
      'Square Root Decomposition',
      'Mo',
      'Meet in the Middle',
      'Mobius',
      'Matrici logaritmice',
    ],
  },
]

export const RECOMMENDED_ORDER: string[] = [
  'Fundamente C++',
  'Numere și cifre',
  'Divizibilitate',
  'Fișiere',
  'Vectori',
  'Frecvențe și sortări',
  'Căutare binară',
  'Sume parțiale',
  'Matrice',
  'Two Pointers',
  'Difference Arrays',
  'Funcții',
  'Structuri',
  'STL de bază',
  'Greedy',
  'Stack, Queue, Deque',
  'Șiruri de caractere',
  'Recursivitate',
  'Backtracking',
  'Divide et Impera',
  'Programare dinamică',
  'Grafuri',
  'Arbori',
  'Structuri de date avansate',
  'Tehnici pentru națională și baraj',
]
