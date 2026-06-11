/**
 * scaffold-lessons.ts — generează scheletele MDX goale pentru un capitol întreg.
 *
 * Pentru un (gradeId, chapterId) din data/curriculum.ts, creează câte un fișier
 * MDX per lecție, cu frontmatter precompletat (title, slug, grade, chapter,
 * isBridge, visualizers) și status: "draft". Corpul e un schelet conform
 * content/GHID-LECTIE.md, cu marcaje TODO de completat.
 *
 * NU suprascrie fișiere existente (lecțiile demo / publicate sunt în siguranță).
 *
 * Rulare:
 *   pnpm scaffold <gradeId> <chapterId>
 *   pnpm scaffold 5 vectori
 *   pnpm scaffold 11-12 grafuri-notiuni
 *   pnpm scaffold baraj-gimnaziu baraj
 *
 * (sub capotă: pnpm dlx tsx tools/scaffold-lessons.ts <gradeId> <chapterId>)
 */
import fs from 'fs'
import path from 'path'
import { CURRICULUM, type Chapter, type Lesson } from '../data/curriculum'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'lessons')

/** Mapează id-ul de clasă din curriculum la numărul de clasă din frontmatter (5–12). */
function gradeNumberFor(gradeId: string): number {
  if (gradeId === '11-12') return 11
  if (gradeId === 'baraj-gimnaziu') return 8
  const n = Number(gradeId)
  if (!Number.isInteger(n) || n < 5 || n > 12) {
    throw new Error(
      `Nu pot mapa gradeId="${gradeId}" la un număr de clasă valid (5–12).`,
    )
  }
  return n
}

/** Frontmatter precompletat din curriculum, în ordinea din GHID-LECTIE.md. */
function buildFrontmatter(
  lesson: Lesson,
  gradeNum: number,
  chapterId: string,
): string {
  const isBridge = lesson.isBridge ?? false
  const visualizers = lesson.visualizer ? `["${lesson.visualizer}"]` : '[]'

  return [
    '---',
    `title: "${lesson.title}"`,
    `slug: ${lesson.id}`,
    `grade: ${gradeNum}`,
    `chapter: ${chapterId}`,
    'difficulty: baza',
    'estimatedTime: 10',
    'free: true',
    'status: draft',
    `isBridge: ${isBridge}`,
    'tags: []',
    `visualizers: ${visualizers}`,
    'relatedProblems: []',
    '---',
  ].join('\n')
}

/** Schelet de corp conform structurii din GHID-LECTIE.md (cu TODO-uri). */
function buildBody(lesson: Lesson): string {
  const hasVisualizer = Boolean(lesson.visualizer)
  const isBridge = lesson.isBridge ?? false

  const parts: string[] = []

  parts.push(
    '<LessonHook>',
    'TODO: analogie din viața reală care introduce noțiunea (2–4 propoziții, fără cod).',
    '</LessonHook>',
  )

  if (isBridge) {
    parts.push(
      '',
      '## Ideea-cheie',
      '',
      'TODO: ce legătură / decizie consolidează această lecție-punte (când / de ce, nu un algoritm nou).',
      '',
      '<ObservationBox>',
      'TODO: intuiția centrală a punții.',
      '</ObservationBox>',
      '',
      '## Cum alegi',
      '',
      'TODO: criteriul practic de decizie, pe un exemplu concret.',
      '',
      '<MistakeBox>',
      'TODO: greșeala frecventă la acest tip de alegere și cum o eviți.',
      '</MistakeBox>',
    )
  } else {
    parts.push(
      '',
      '## Ce este',
      '',
      'TODO: definiția clară, în cuvinte simple. Listă cu proprietăți/pași dacă ajută.',
      '',
      '<ObservationBox>',
      'TODO: intuiția-cheie sau observația importantă.',
      '</ObservationBox>',
      '',
      '## Algoritmul pas cu pas',
      '',
      'TODO: explicație pe un exemplu concret cu numere. Pseudocod sau pași numerotați.',
      '',
      '## Implementare C++',
      '',
      '```cpp',
      '#include <iostream>',
      'using namespace std;',
      '',
      'int main() {',
      '    // TODO: implementare completă, compilabilă. Comentarii fara diacritice.',
      '    return 0;',
      '}',
      '```',
      '',
      '## Complexitate',
      '',
      '| Caz | Timp | Spațiu |',
      '|-----|------|--------|',
      '| Mediu | O(?) | O(?) |',
      '',
      '<MistakeBox>',
      'TODO: capcana clasică (overflow, inițializare, limită de timp) și cum o eviți.',
      '</MistakeBox>',
    )
  }

  if (hasVisualizer) {
    parts.push(
      '',
      '## Vizualizare',
      '',
      `<Visualizer name="${lesson.visualizer}" />`,
      '',
      '<HintBox>',
      'Folosește **←** și **→** pentru a avansa pas cu pas, sau apasă **Redă** pentru animație automată.',
      '</HintBox>',
    )
  }

  return parts.join('\n')
}

function findChapter(
  gradeId: string,
  chapterId: string,
): { chapter: Chapter; gradeNum: number } {
  const grade = CURRICULUM.find((g) => g.id === gradeId)
  if (!grade) {
    const ids = CURRICULUM.map((g) => g.id).join(', ')
    throw new Error(`Clasa "${gradeId}" nu există. Disponibile: ${ids}`)
  }
  const chapter = grade.chapters.find((c) => c.id === chapterId)
  if (!chapter) {
    const ids = grade.chapters.map((c) => c.id).join(', ')
    throw new Error(
      `Capitolul "${chapterId}" nu există în clasa "${gradeId}". Disponibile: ${ids}`,
    )
  }
  return { chapter, gradeNum: gradeNumberFor(gradeId) }
}

function main(): void {
  const [gradeId, chapterId] = process.argv.slice(2)

  if (!gradeId || !chapterId) {
    console.error('Folosire: pnpm scaffold <gradeId> <chapterId>')
    console.error('Exemple:')
    console.error('  pnpm scaffold 5 vectori')
    console.error('  pnpm scaffold 11-12 grafuri-notiuni')
    console.error('  pnpm scaffold baraj-gimnaziu baraj')
    console.error('')
    console.error('Clase disponibile: ' + CURRICULUM.map((g) => g.id).join(', '))
    process.exit(1)
  }

  const { chapter, gradeNum } = findChapter(gradeId, chapterId)
  const targetDir = path.join(CONTENT_DIR, `grade-${gradeNum}`, chapterId)
  fs.mkdirSync(targetDir, { recursive: true })

  let created = 0
  let skipped = 0

  for (const lesson of chapter.lessons) {
    const filePath = path.join(targetDir, `${lesson.id}.mdx`)
    const rel = path.relative(process.cwd(), filePath)

    if (fs.existsSync(filePath)) {
      console.log(`  skip   ${rel} (există deja)`)
      skipped++
      continue
    }

    const content =
      buildFrontmatter(lesson, gradeNum, chapterId) +
      '\n\n' +
      buildBody(lesson) +
      '\n'
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`  create ${rel}`)
    created++
  }

  console.log('')
  console.log(
    `Gata: ${chapter.title} (clasa ${gradeId}) — ${created} create, ${skipped} sărite.`,
  )
}

main()
