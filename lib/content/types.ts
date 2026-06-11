import { z } from 'zod'

export const QuizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).min(2).max(4),
  correctIndex: z.number().int().min(0),
  explanation: z.string().min(1),
})

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>

export const LessonFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  grade: z.number().int().min(5).max(12),
  chapter: z.string().min(1),
  difficulty: z.enum(['baza', 'mediu', 'greu']),
  estimatedTime: z.number().int().min(1),
  free: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  visualizers: z.array(z.string()).default([]),
  relatedProblems: z.array(z.string()).default([]),
  quiz: z.array(QuizQuestionSchema).max(3).optional(),
  // Lecție-punte (face legătura între capitole). Implicit false.
  isBridge: z.boolean().default(false),
  // Stadiul redacțional. Lecțiile scaffold-ate pornesc ca "draft";
  // lecțiile fără câmp explicit sunt considerate "published" (demo-urile de aur).
  status: z.enum(['draft', 'review', 'published']).default('published'),
})

export type LessonFrontmatter = z.infer<typeof LessonFrontmatterSchema>

export interface LessonMeta extends LessonFrontmatter {
  filePath: string
}

export interface LessonWithContent extends LessonMeta {
  rawContent: string
}
