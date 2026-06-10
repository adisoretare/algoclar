export interface Frame<T> {
  state: T
  explanation: string
}

export type FrameGenerator<TInput, TState> = (input: TInput) => Frame<TState>[]

export interface StepPlayerControls<T> {
  index: number
  currentFrame: Frame<T>
  isPlaying: boolean
  speed: number
  progress: number
  next: () => void
  prev: () => void
  reset: () => void
  play: () => void
  pause: () => void
  goTo: (index: number) => void
  setSpeed: (speed: number) => void
}
