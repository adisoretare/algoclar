import { DifficultyBadge } from '@/components/shared/DifficultyBadge'
import { TopicBadge } from '@/components/shared/TopicBadge'
import { LessonCard } from '@/components/lesson/LessonCard'
import { ProblemCard } from '@/components/problem/ProblemCard'
import { HintBox } from '@/components/lesson/HintBox'
import { ObservationBox } from '@/components/lesson/ObservationBox'
import { MistakeBox } from '@/components/lesson/MistakeBox'

export default function ComponentsDevPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-16 px-6 py-16">
      <h1 className="font-heading text-4xl font-bold">Design System</h1>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl font-semibold">DifficultyBadge</h2>
        <div className="flex flex-wrap gap-3">
          <DifficultyBadge level="baza" />
          <DifficultyBadge level="mediu" />
          <DifficultyBadge level="greu" />
          <DifficultyBadge level="baraj" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl font-semibold">TopicBadge</h2>
        <div className="flex flex-wrap gap-2">
          <TopicBadge label="DP" />
          <TopicBadge label="Grafuri" />
          <TopicBadge label="Sortare" />
          <TopicBadge label="DP" variant="accent" />
          <TopicBadge label="BFS/DFS" variant="accent" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl font-semibold">LessonCard</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <LessonCard
            href="#"
            chapter="Capitol 3 · Sortare"
            title="Bubble Sort — cum și de ce"
            duration="12 min"
            difficulty="baza"
            progress={40}
          />
          <LessonCard
            href="#"
            chapter="Capitol 7 · Grafuri"
            title="Parcurgerea BFS a unui graf"
            duration="25 min"
            difficulty="mediu"
            progress={100}
          />
          <LessonCard
            href="#"
            chapter="Capitol 12 · Programare dinamică"
            title="Problema rucsacului 0/1"
            duration="35 min"
            difficulty="greu"
            progress={0}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl font-semibold">ProblemCard</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <ProblemCard
            href="#"
            stage="OJI"
            year={2024}
            grade={9}
            title="Subșir crescător maximal"
            topics={['DP', 'Greedy']}
            status="explicata"
          />
          <ProblemCard
            href="#"
            stage="ONI"
            year={2023}
            grade={10}
            title="Graf bipartit cu costuri"
            topics={['Grafuri', 'BFS']}
            status="linkuita"
            active
          />
          <ProblemCard
            href="#"
            stage="OJI"
            year={2022}
            grade={11}
            title="Arbori cu sumă minimă"
            topics={['Grafuri', 'Arbori']}
            status="in-lucru"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl font-semibold">Info Boxes</h2>
        <div className="space-y-4">
          <HintBox>
            Încearcă să vizualizezi problema ca un graf orientat. Fiecare nod
            reprezintă o stare, iar muchiile reprezintă tranziții posibile.
          </HintBox>
          <ObservationBox>
            Subproblema optimă: soluția globală optimă conține soluțiile optime
            ale fiecărei subprobleme. Aceasta este proprietatea de optimalitate
            necesară pentru DP.
          </ObservationBox>
          <MistakeBox>
            Nu uita să inițializezi <code>dp[0] = 0</code> explicit. Lăsând
            valoarea implicită poate masca erori la cazul de bază.
          </MistakeBox>
        </div>
      </section>
    </div>
  )
}
