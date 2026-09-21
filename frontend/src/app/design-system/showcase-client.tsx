'use client';

import { useState } from 'react';
import { Bug, Check, Compass, Flag, Sparkles } from 'lucide-react';
import { CodeQuestLogo } from '@/components/brand/codequest-logo';
import { AchievementCard } from '@/components/game/achievement-card';
import { ChapterCard } from '@/components/game/chapter-card';
import { LevelBadge } from '@/components/game/level-badge';
import { QuestNode } from '@/components/game/quest-node';
import { QuestPath } from '@/components/game/quest-path';
import { RewardPopup } from '@/components/game/reward-popup';
import { XPBar } from '@/components/game/xp-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Drawer } from '@/components/ui/drawer';
import { Dropdown } from '@/components/ui/dropdown';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs } from '@/components/ui/tabs';
import { ToastProvider, useToast } from '@/components/ui/toast';
import { Tooltip } from '@/components/ui/tooltip';

const ASSET_ROOT = '/assets/design-system';

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section
      id={id}
      className="scroll-mt-8 border-t border-line py-16 sm:py-20"
    >
      <div className="mb-8 max-w-3xl">
        <p className="game-label text-xs text-ascent">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
          {title}
        </h2>
        <p className="mt-3 text-base leading-7 text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Swatch({
  name,
  value,
  className,
}: {
  name: string;
  value: string;
  className: string;
}): React.JSX.Element {
  return (
    <div className="min-w-0">
      <div
        className={`pixel-corners-sm h-20 border border-line-strong ${className}`}
      />
      <p className="mt-3 text-sm font-bold text-ink">{name}</p>
      <p className="font-mono text-xs text-muted">{value}</p>
    </div>
  );
}

function ToastDemo(): React.JSX.Element {
  const { notify } = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="secondary"
        onClick={() =>
          notify({
            title: 'Draft saved',
            description: 'Your local work is safe.',
            variant: 'ascent',
          })
        }
      >
        Success toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          notify({
            title: 'Run interrupted',
            description: 'Your source is still available.',
            variant: 'danger',
          })
        }
      >
        Error toast
      </Button>
    </div>
  );
}

function AvatarSpecimen({
  label,
  accent,
}: {
  label: string;
  accent: 'mint' | 'amber' | 'sky';
}): React.JSX.Element {
  const ring =
    accent === 'mint'
      ? 'border-ascent'
      : accent === 'amber'
        ? 'border-reward'
        : 'border-discovery';
  return (
    <figure className="flex flex-col items-center gap-3">
      <div
        className={`pixel-corners relative grid h-28 w-28 place-items-center border-2 bg-surface-sunken ${ring}`}
      >
        <img
          aria-hidden="true"
          src={`${ASSET_ROOT}/frames/avatar-circuit.svg`}
          alt=""
          className="pixel-art absolute inset-2 h-24 w-24"
        />
        <span
          aria-hidden="true"
          className="avatar-silhouette h-12 w-10 rounded-t-full bg-line-strong"
        />
      </div>
      <figcaption className="game-label text-xs text-muted">{label}</figcaption>
    </figure>
  );
}

export function DesignSystemShowcase(): React.JSX.Element {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);

  return (
    <ToastProvider>
      <main className="pixel-grid min-h-screen overflow-x-hidden bg-canvas text-ink">
        <nav
          aria-label="Design system sections"
          className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur-sm"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
            <CodeQuestLogo />
            <div className="hidden items-center gap-5 font-mono text-xs text-muted lg:flex">
              <a href="#identity" className="hover:text-ascent">
                Identity
              </a>
              <a href="#world" className="hover:text-ascent">
                Quest world
              </a>
              <a href="#rewards" className="hover:text-ascent">
                Rewards
              </a>
              <a href="#controls" className="hover:text-ascent">
                Controls
              </a>
              <a href="#accessibility" className="hover:text-ascent">
                Access
              </a>
            </div>
            <Badge variant="outline">Dev only</Badge>
          </div>
        </nav>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="relative flex min-h-[620px] items-end overflow-hidden border-x border-line px-5 py-12 sm:min-h-[680px] sm:px-10 lg:px-14">
            <img
              src={`${ASSET_ROOT}/worlds/foundations-valley.webp`}
              alt=""
              className="pixel-art absolute inset-0 h-full w-full object-cover"
            />
            <span
              aria-hidden="true"
              className="world-hero-scrim absolute inset-0"
            />
            <div className="relative z-10 max-w-2xl pb-8">
              <Badge variant="reward">Phase 4 visual revision</Badge>
              <p className="game-label mt-7 text-sm text-ascent">
                The debugger&apos;s frontier
              </p>
              <h1 className="mt-3 font-display text-5xl leading-[0.92] font-bold tracking-tight text-ink sm:text-7xl">
                Build a path through code.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
                A pixel-game world for progress and discovery, paired with calm
                modern tools for reading, coding, and debugging.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  onClick={() =>
                    document
                      .getElementById('world')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  Explore the system{' '}
                  <Compass aria-hidden="true" className="h-4 w-4" />
                </Button>
                <Button variant="secondary" onClick={() => setRewardOpen(true)}>
                  Preview reward{' '}
                  <Sparkles aria-hidden="true" className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="pixel-corners pixel-frame absolute right-8 bottom-12 hidden w-64 p-5 xl:block">
              <p className="game-label text-xs text-reward">Design thesis</p>
              <p className="mt-2 font-display text-xl font-bold">
                Pixel precision. Human potential.
              </p>
              <p className="mt-2 text-sm text-muted">
                Game identity marks the journey. Familiar controls protect the
                work.
              </p>
            </div>
          </header>

          <Section
            id="identity"
            eyebrow="01 / Identity"
            title="One world, built on an eight-pixel grid."
            description="The brackets form a portal, circuit traces become paths, and compact emblems turn progress into artifacts. Body content stays modern and readable."
          >
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="pixel-corners pixel-frame flex min-h-72 flex-col items-center justify-center gap-6 p-8 text-center">
                <img
                  src={`${ASSET_ROOT}/brand/codequest-mark.svg`}
                  alt="CodeQuest portal mark"
                  className="pixel-art h-28 w-28"
                />
                <CodeQuestLogo />
                <p className="max-w-sm text-sm text-muted">
                  Code brackets + doorway + ascending path. The mark scales from
                  navigation to chapter gates.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Swatch name="Ink" value="#090B12" className="bg-canvas" />
                <Swatch
                  name="Navy"
                  value="#11182B"
                  className="bg-surface-raised"
                />
                <Swatch name="Parchment" value="#F2EAD3" className="bg-ink" />
                <Swatch name="Progress" value="#53F6A6" className="bg-ascent" />
                <Swatch name="Reward" value="#FFCB5C" className="bg-reward" />
                <Swatch name="Fault" value="#FF7777" className="bg-danger" />
                <Swatch
                  name="Discovery"
                  value="#69B7FF"
                  className="bg-discovery"
                />
                <div
                  className="pixel-dither pixel-corners-sm h-20 border border-line-strong bg-surface-sunken"
                  aria-label="Eight pixel dot motif"
                />
              </div>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <div className="border-l-2 border-ascent pl-5">
                <p className="game-label text-xs text-ascent">Display</p>
                <p className="mt-2 font-display text-4xl font-bold">Quest 01</p>
                <p className="mt-2 text-sm text-muted">
                  Short headings and status labels only.
                </p>
              </div>
              <div className="border-l-2 border-discovery pl-5">
                <p className="font-mono text-xs text-discovery">MONO / CODE</p>
                <p className="mt-2 font-mono text-xl">const path = build();</p>
                <p className="mt-2 text-sm text-muted">
                  Code, values, and compact diagnostics.
                </p>
              </div>
              <div className="border-l-2 border-line-strong pl-5">
                <p className="text-xs font-bold text-muted uppercase">
                  Sans / Reading
                </p>
                <p className="mt-2 text-xl font-bold">
                  Clear ideas, comfortable pace.
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Lessons, forms, dialogs, and longer guidance remain calm and
                  familiar.
                </p>
              </div>
            </div>
          </Section>

          <Section
            id="world"
            eyebrow="02 / Quest world"
            title="Progress becomes a place."
            description="A chapter can feel explorable without turning navigation into decoration. The ordered route and every node state remain explicit in text."
          >
            <QuestPath
              label="Foundations Valley"
              description="Four milestones introduce the building blocks of JavaScript."
              artworkSrc={`${ASSET_ROOT}/worlds/foundations-valley.webp`}
            >
              <QuestNode status="completed" label="Hello, JavaScript" />
              <QuestNode
                status="current"
                label="Data types"
                onSelect={() => undefined}
              />
              <QuestNode
                status="available"
                label="Expressions"
                onSelect={() => undefined}
              />
              <QuestNode status="locked" label="Control flow" />
            </QuestPath>
            <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
              <ChapterCard
                title="Foundations Valley"
                eyebrow="Chapter 01"
                description="Small concepts become building blocks you can test and reshape."
                artworkSrc={`${ASSET_ROOT}/worlds/foundations-valley.webp`}
                artworkAlt=""
                completedQuests={3}
                totalQuests={8}
                statusText="In progress"
                onOpen={() => undefined}
              />
              <div className="grid content-start gap-5 sm:grid-cols-2">
                <div className="pixel-corners-sm pixel-frame-discovery p-5">
                  <Flag aria-hidden="true" className="h-7 w-7 text-discovery" />
                  <p className="game-label mt-5 text-xs text-discovery">
                    Available
                  </p>
                  <p className="mt-1 font-display text-xl font-bold">
                    Pathfinder node
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    Sky marks a route that can be entered now.
                  </p>
                </div>
                <div className="pixel-corners-sm pixel-frame-reward p-5">
                  <Bug aria-hidden="true" className="h-7 w-7 text-reward" />
                  <p className="game-label mt-5 text-xs text-reward">Current</p>
                  <p className="mt-1 font-display text-xl font-bold">
                    Debug checkpoint
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    Amber holds attention without implying an error.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          <Section
            id="rewards"
            eyebrow="03 / Progress and rewards"
            title="Earn artifacts, not confetti."
            description="Levels, XP, achievements, and avatar frames share the same crafted patch language. Text always names the state and reward."
          >
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="pixel-corners pixel-frame p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-5">
                  <LevelBadge
                    level={7}
                    title="Debugger"
                    emblemSrc={`${ASSET_ROOT}/emblems/debugger-beetle.svg`}
                  />
                  <Badge variant="reward">Next: Builder patch</Badge>
                </div>
                <XPBar
                  value={460}
                  max={600}
                  label="Journey experience"
                  className="mt-8"
                />
                <p className="mt-4 text-sm text-muted">
                  140 XP to the next level. Values are supplied display data.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 rounded-lg border border-line bg-surface p-5">
                <AvatarSpecimen label="Debugger" accent="mint" />
                <AvatarSpecimen label="Builder" accent="amber" />
                <AvatarSpecimen label="Pathfinder" accent="sky" />
              </div>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <AchievementCard
                title="Bug Hunter"
                description="Found the fault and fixed it."
                unlocked
                emblemSrc={`${ASSET_ROOT}/emblems/debugger-beetle.svg`}
                rarity="Rare patch"
              />
              <AchievementCard
                title="Builder"
                description="Turned an idea into working code."
                unlocked
                emblemSrc={`${ASSET_ROOT}/emblems/builder-cube.svg`}
                rarity="Quest patch"
              />
              <AchievementCard
                title="Pathfinder"
                description="Complete the next learning route."
                unlocked={false}
                rarity="Locked patch"
              />
            </div>
          </Section>

          <Section
            id="controls"
            eyebrow="04 / Application controls"
            title="The tools stay out of the way."
            description="Forms, menus, overlays, tabs, feedback, and loading states use familiar geometry and readable type. Pixel art frames the journey, not every interaction."
          >
            <div className="grid gap-8 lg:grid-cols-2">
              <Card title="Controls and validation" className="space-y-5">
                <Input
                  label="Explorer call sign"
                  placeholder="Nova"
                  helperText="Used only in this visual example."
                />
                <Input
                  label="Invalid call sign"
                  defaultValue="x"
                  errorText="Use at least three characters."
                />
                <Select
                  label="Interface theme"
                  defaultValue="system"
                  options={[
                    { value: 'system', label: 'System default' },
                    { value: 'dark', label: 'Dark' },
                  ]}
                />
                <div className="flex flex-wrap gap-3">
                  <Button>Primary action</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </Card>
              <div className="space-y-6">
                <Tabs
                  label="Quest example views"
                  tabs={[
                    {
                      id: 'brief',
                      label: 'Brief',
                      content: (
                        <p className="py-4 text-muted">
                          Read the goal before opening the editor.
                        </p>
                      ),
                    },
                    {
                      id: 'checks',
                      label: 'Checks',
                      content: (
                        <p className="py-4 text-muted">
                          Run checks when you are ready.
                        </p>
                      ),
                    },
                    {
                      id: 'notes',
                      label: 'Notes',
                      content: (
                        <p className="py-4 text-muted">
                          Notes stay clear and compact.
                        </p>
                      ),
                    },
                  ]}
                />
                <div className="flex flex-wrap gap-3">
                  <Dropdown
                    label="Quest difficulty"
                    options={[
                      { value: 'guided', label: 'Guided' },
                      { value: 'standard', label: 'Standard' },
                      { value: 'stretch', label: 'Stretch' },
                    ]}
                  />
                  <Tooltip tip="Keyboard focus reveals this tip">
                    <Button variant="secondary">Focus for tooltip</Button>
                  </Tooltip>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => setDialogOpen(true)}>
                    Open dialog
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setDrawerOpen(true)}
                  >
                    Open drawer
                  </Button>
                </div>
                <ToastDemo />
              </div>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <Card title="Progress">
                <Progress value={5} max={8} label="Chapter quests" />
                <Progress
                  value={3}
                  max={5}
                  label="Reward steps"
                  variant="reward"
                  className="mt-5"
                />
              </Card>
              <Card title="Loading">
                <div className="space-y-3">
                  <Skeleton className="h-7 w-2/3" label="Loading heading" />
                  <Skeleton className="h-4 w-full" label="Loading text" />
                  <Skeleton className="h-4 w-4/5" label="Loading text" />
                </div>
              </Card>
              <Card title="State labels">
                <div className="flex flex-wrap gap-2">
                  <Badge>Neutral</Badge>
                  <Badge variant="ascent">Complete</Badge>
                  <Badge variant="reward">Current</Badge>
                  <Badge variant="danger">Error</Badge>
                  <Badge variant="outline">Locked</Badge>
                </div>
              </Card>
            </div>
          </Section>

          <Section
            id="accessibility"
            eyebrow="05 / Accessibility"
            title="The theme never overrides the learner."
            description="Every game state has text and shape, every action has a visible focus ring, and motion collapses without losing meaning."
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['44px', 'Primary touch targets'],
                ['2px+', 'High-contrast focus'],
                ['AA', 'Text and state contrast'],
                ['0 loops', 'Reduced-motion safe'],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="border-l-2 border-ascent bg-surface-raised p-5"
                >
                  <p className="font-display text-3xl font-bold text-ascent">
                    {value}
                  </p>
                  <p className="mt-2 text-sm text-muted">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4 rounded-lg border border-line bg-surface-raised p-5">
              <Check aria-hidden="true" className="h-6 w-6 text-ascent" />
              <p className="max-w-3xl text-sm leading-6 text-muted">
                Enable reduced motion in the operating system and trigger the
                reward, dialog, drawer, tooltip, toast, tabs, and progress
                examples. Content remains available instantly, without looping
                or spatial movement.
              </p>
              <Button variant="secondary" onClick={() => setRewardOpen(true)}>
                Test reward state
              </Button>
            </div>
          </Section>

          <footer className="flex flex-col gap-4 border-t border-line py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <CodeQuestLogo compact />
            <p>
              Design-system review surface · no product data or business rules
            </p>
          </footer>
        </div>

        <Dialog
          open={dialogOpen}
          title="Leave this checkpoint?"
          description="Your visual-demo state is local to this page."
          onClose={() => setDialogOpen(false)}
        >
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Stay
            </Button>
            <Button variant="danger" onClick={() => setDialogOpen(false)}>
              Leave
            </Button>
          </div>
        </Dialog>
        <Drawer
          open={drawerOpen}
          title="Quest menu"
          onClose={() => setDrawerOpen(false)}
        >
          <nav aria-label="Example quest menu" className="flex flex-col gap-2">
            {['Overview', 'Objectives', 'Checks', 'Notes'].map((item) => (
              <Button
                key={item}
                variant="ghost"
                className="justify-start"
                onClick={() => setDrawerOpen(false)}
              >
                {item}
              </Button>
            ))}
          </nav>
        </Drawer>
        <RewardPopup
          open={rewardOpen}
          title="Bug Hunter unlocked"
          description="You found the fault, tested the fix, and kept moving. +75 XP"
          onClose={() => setRewardOpen(false)}
        />
      </main>
    </ToastProvider>
  );
}
