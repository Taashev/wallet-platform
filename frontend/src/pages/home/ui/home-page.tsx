import { AppShell } from '@/shared/ui/app-shell';
import { ButtonLink } from '@/shared/ui/button-link';
import { SectionHeading } from '@/shared/ui/section-heading';
import { SurfaceCard } from '@/shared/ui/surface-card';

const FOUNDATION_PILLARS = [
  {
    eyebrow: 'Clear entry points',
    title: 'Composable shell',
    description:
      'A strong first screen, stable layout patterns and shared tokens make auth, profile and users screens easier to add without rework.',
  },
  {
    eyebrow: 'High contrast UI',
    title: 'Positivus-inspired system',
    description:
      'Visible borders, chunky cards, spacious typography and restrained motion create a distinctive product surface instead of a generic starter.',
  },
  {
    eyebrow: 'MVP discipline',
    title: 'No premature complexity',
    description:
      'The page sets direction for product modules while keeping routing, auth flows and API integration outside this task.',
  },
];

const MVP_CAPABILITIES = [
  {
    eyebrow: 'Auth',
    title: 'Launchpad for sign-in and recovery',
    items: [
      'Dedicated entry states for login, recovery and invite acceptance.',
      'Primary/secondary button patterns already match the future auth journey.',
    ],
  },
  {
    eyebrow: 'Profiles',
    title: 'Readable account workspace',
    items: [
      'Cards and split panels scale to profile summaries, settings and personal metadata.',
      'Tokenized spacing keeps dense information clean on mobile and desktop.',
    ],
  },
  {
    eyebrow: 'Users',
    title: 'Directory-friendly layout',
    items: [
      'Surface cards and metric blocks can evolve into user rows, filters and role summaries.',
      'Section headings create a repeatable information hierarchy across dashboards.',
    ],
  },
  {
    eyebrow: 'Quality',
    title: 'Predictable baseline',
    items: [
      'Global variables lock typography, radius, color and elevation before the app grows.',
      'Shared primitives keep new screens aligned without introducing a full component framework.',
    ],
  },
];

const DELIVERY_FLOW = [
  {
    step: '01',
    title: 'Enter the service',
    description:
      'A confident hero block establishes product identity and immediately exposes the first navigation targets.',
  },
  {
    step: '02',
    title: 'Move into core modules',
    description:
      'Reusable section headers and cards let new pages stay visually consistent while adapting to different content density.',
  },
  {
    step: '03',
    title: 'Scale without drift',
    description:
      'Tokens, buttons and surfaces are already centralized, so future work expands the same language instead of recreating it.',
  },
];

export function HomePage() {
  return (
    <AppShell
      eyebrow="Users Service Web MVP"
      title="A confident product shell for user operations."
      description="The placeholder home screen is replaced with a real starting point: distinct visual direction, reusable UI primitives and a layout ready for auth, profile and directory flows."
      actions={
        <>
          <ButtonLink href="#mvp-foundation">Explore foundation</ButtonLink>
          <ButtonLink
            href="#delivery-flow"
            variant="secondary"
          >
            View next screens
          </ButtonLink>
        </>
      }
      aside={
        <SurfaceCard
          className="hero-overview"
          eyebrow="MVP snapshot"
          title="Ready to grow into the next product screens"
          tone="accent"
        >
          <div className="hero-overview__metrics">
            <div className="hero-overview__metric">
              <strong>4</strong>
              <span>base primitives in shared UI</span>
            </div>
            <div className="hero-overview__metric">
              <strong>1</strong>
              <span>tokenized visual language</span>
            </div>
            <div className="hero-overview__metric">
              <strong>3</strong>
              <span>next modules already framed</span>
            </div>
            <div className="hero-overview__metric">
              <strong>100%</strong>
              <span>responsive-first layout coverage</span>
            </div>
          </div>

          <ul className="stack-list">
            <li>
              <strong>Shared foundation</strong>
              <span>CSS variables define brand color, spacing, radius, shadow and typography.</span>
            </li>
            <li>
              <strong>Reusable shell</strong>
              <span>Header, hero, actions and sidebar content work as a base wrapper for future views.</span>
            </li>
            <li>
              <strong>Screen-ready patterns</strong>
              <span>Cards, section headings and action links already support product-oriented information blocks.</span>
            </li>
          </ul>
        </SurfaceCard>
      }
    >
      <section
        className="page-section"
        id="mvp-foundation"
      >
        <SectionHeading
          eyebrow="Foundation"
          title="Design system basics are now fixed in code, not implied by one screen."
          description="The page introduces a small but durable set of primitives and tokens so the next auth, profile and users work can stay aligned without importing a heavy design system upfront."
        />

        <div className="card-grid card-grid--three">
          {FOUNDATION_PILLARS.map((pillar) => (
            <SurfaceCard
              eyebrow={pillar.eyebrow}
              key={pillar.title}
              title={pillar.title}
              tone="muted"
            >
              <p>{pillar.description}</p>
            </SurfaceCard>
          ))}
        </div>

        <div className="metric-strip">
          <div className="metric-item">
            <strong>Space Grotesk</strong>
            <span>Locked as the primary typeface for the product shell.</span>
          </div>
          <div className="metric-item">
            <strong>#B9FF66</strong>
            <span>Accent token used for labels, highlights and emphasis surfaces.</span>
          </div>
          <div className="metric-item">
            <strong>Chunky cards</strong>
            <span>Rounded outlines, clear shadows and generous whitespace define the UI rhythm.</span>
          </div>
        </div>
      </section>

      <section className="page-section">
        <SectionHeading
          eyebrow="Product scope"
          title="This home screen speaks about a users service, not a generic agency landing."
          description="The layout is adapted around operational workflows: onboarding entry points, profile handling, user directory growth and predictable quality gates for future development."
        />

        <div className="card-grid card-grid--two">
          {MVP_CAPABILITIES.map((capability, index) => (
            <SurfaceCard
              eyebrow={capability.eyebrow}
              key={capability.title}
              title={capability.title}
              tone={index === 0 ? 'accent' : 'default'}
            >
              <ul className="feature-list">
                {capability.items.map((item) => (
                  <li key={item}>
                    <strong>{item.split('.')[0]}.</strong>
                    <span>{item.slice(item.indexOf('.') + 2)}</span>
                  </li>
                ))}
              </ul>
            </SurfaceCard>
          ))}
        </div>
      </section>

      <section
        className="page-section"
        id="delivery-flow"
      >
        <SectionHeading
          eyebrow="Delivery flow"
          title="The screen now describes how the frontend can evolve in the next iterations."
          description="Instead of a dead-end placeholder, the page shows a path from entry shell to operational modules and keeps enough flexibility for future auth and data states."
        />

        <div className="split-panel">
          <SurfaceCard
            eyebrow="Roadmap"
            title="Immediate UI extensions"
          >
            <div className="flow-card">
              {DELIVERY_FLOW.map((item) => (
                <div
                  className="flow-card__row"
                  key={item.step}
                >
                  <span className="flow-card__step">{item.step}</span>
                  <div className="flow-card__content">
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard
            eyebrow="Working rules"
            title="Baseline that future screens should preserve"
            tone="muted"
          >
            <ul className="timeline-list">
              <li>
                <strong>Keep visible borders and contrast.</strong>
                <span>The visual identity should remain bold even when tables and forms appear.</span>
              </li>
              <li>
                <strong>Prefer composition over complex abstractions.</strong>
                <span>Small primitives should stay enough for the next MVP pages.</span>
              </li>
              <li>
                <strong>Respect mobile early.</strong>
                <span>Cards, CTA rows and shell spacing already collapse cleanly for narrow widths.</span>
              </li>
            </ul>
          </SurfaceCard>
        </div>
      </section>

      <section className="cta-panel">
        <div>
          <span className="mini-label">Next up</span>
          <h3>Use this foundation for auth, profile and users screens.</h3>
          <p>
            The visual direction is now fixed enough to scale the product, while the implementation stays simple:
            one token layer, a handful of shared UI primitives and no premature frontend infrastructure.
          </p>
        </div>
        <div className="cta-panel__actions">
          <ButtonLink href="#mvp-foundation">Review tokens</ButtonLink>
          <ButtonLink
            href="#delivery-flow"
            variant="secondary"
          >
            Review roadmap
          </ButtonLink>
        </div>
      </section>
    </AppShell>
  );
}
