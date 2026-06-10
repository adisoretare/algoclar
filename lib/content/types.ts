import { z } from 'zod'

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
})

export type LessonFrontmatter = z.infer<typeof LessonFrontmatterSchema>

export interface LessonMeta extends LessonFrontmatter {
  filePath: string
}

export interface LessonWithContent extends LessonMeta {
  rawContent: string
}
