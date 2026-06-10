import { HintBox } from '@/components/lesson/HintBox'
import { ObservationBox } from '@/components/lesson/ObservationBox'
import { MistakeBox } from '@/components/lesson/MistakeBox'
import { CodeBlock, MdxPre } from './CodeBlock'
import { LessonHook } from './LessonHook'
import { Visualizer } from './Visualizer'
import { MdxTable, MdxTh, MdxTd } from './MdxTable'

export const MDX_COMPONENTS = {
  HintBox,
  ObservationBox,
  MistakeBox,
  CodeBlock,
  pre: MdxPre,
  LessonHook,
  Visualizer,
  table: MdxTable,
  th: MdxTh,
  td: MdxTd,
}
