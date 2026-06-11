import { HintBox } from '@/components/lesson/HintBox'
import { ObservationBox } from '@/components/lesson/ObservationBox'
import { MistakeBox } from '@/components/lesson/MistakeBox'
import { ArrayDiagram } from '@/components/lesson/ArrayDiagram'
import { CodeBlock, MdxPre } from './CodeBlock'
import { LessonHook } from './LessonHook'
import { Visualizer } from './Visualizer'
import { MdxTable, MdxTh, MdxTd } from './MdxTable'

export const MDX_COMPONENTS = {
  HintBox,
  ObservationBox,
  MistakeBox,
  ArrayDiagram,
  CodeBlock,
  pre: MdxPre,
  LessonHook,
  Visualizer,
  table: MdxTable,
  th: MdxTh,
  td: MdxTd,
}
