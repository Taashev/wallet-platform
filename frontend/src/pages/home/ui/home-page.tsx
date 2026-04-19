import { AppShell } from '@/shared/ui/app-shell';

const FOUNDATION_BLOCKS = [
  {
    title: 'app',
    description: 'Точка входа приложения, базовые providers и общие стили.',
  },
  {
    title: 'pages',
    description: 'Маршрутные экраны MVP, начиная с auth и профиля.',
  },
  {
    title: 'features',
    description: 'Изолированные пользовательские сценарии без дублирования UI.',
  },
  {
    title: 'shared',
    description: 'Переиспользуемые примитивы, утилиты и инфраструктура.',
  },
];

export function HomePage() {
  return (
    <AppShell
      eyebrow="TASK-001"
      title="Users Service Web MVP"
      description="Foundation React + TypeScript готов к развитию следующих задач без лишней бизнес-логики на старте."
    >
      <section className="hero-grid">
        {FOUNDATION_BLOCKS.map((block) => (
          <article
            className="foundation-card"
            key={block.title}
          >
            <h2>{block.title}</h2>
            <p>{block.description}</p>
          </article>
        ))}
      </section>

      <section className="status-panel">
        <div>
          <span className="status-label">Baseline</span>
          <strong>Vite + React + TypeScript</strong>
        </div>
        <div>
          <span className="status-label">Quality</span>
          <strong>npm run check</strong>
        </div>
        <div>
          <span className="status-label">Next step</span>
          <strong>Router and public/private layouts</strong>
        </div>
      </section>
    </AppShell>
  );
}
