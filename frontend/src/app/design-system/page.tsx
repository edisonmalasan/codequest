'use client';

import { useState } from 'react';
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-line pb-2 font-display text-sm font-bold tracking-wide text-muted uppercase">
        {title}
      </h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

function ToastDemo(): React.JSX.Element {
  const { notify } = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        onClick={() => notify({ title: 'Draft saved', variant: 'ascent' })}
      >
        Notify success
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          notify({
            title: 'Sync failed',
            description: 'Retry when back online.',
            variant: 'danger',
          })
        }
      >
        Notify error
      </Button>
    </div>
  );
}

// DEVELOPMENT-ONLY showcase for visually inspecting the Phase 4 design
// system on localhost. Not product UI: no domain logic, no API calls.
export default function DesignSystemPage(): React.JSX.Element {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);

  return (
    <ToastProvider>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 bg-surface px-4 py-10 text-ink">
        <header className="flex flex-col gap-2">
          <Badge variant="reward">Development only — not product UI</Badge>
          <h1 className="font-display text-2xl font-bold tracking-wide uppercase">
            Design System Showcase
          </h1>
          <p className="max-w-2xl font-sans text-sm text-muted">
            Visual inspection route for the Phase 4 component library. Tab
            through every control to verify keyboard paths and visible focus;
            enable your OS reduced-motion setting to verify static fallbacks.
          </p>
        </header>

        <Section title="Buttons">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </Section>

        <Section title="Inputs and select">
          <div className="flex w-64 flex-col gap-4">
            <Input
              label="Call sign"
              placeholder="Nova"
              helperText="Shown on the leaderboard."
            />
            <Input
              label="Call sign with error"
              defaultValue="x"
              errorText="At least 3 characters."
            />
            <Input label="Disabled field" disabled placeholder="Unavailable" />
            <Select
              label="Track"
              defaultValue="js"
              options={[
                { value: 'js', label: 'JavaScript' },
                { value: 'py', label: 'Python' },
              ]}
            />
            <Select
              label="Track with error"
              options={[{ value: '', label: 'Choose…' }]}
              errorText="Choose a track."
            />
          </div>
          <Dropdown
            label="Difficulty"
            options={[
              { value: 'easy', label: 'Easy' },
              { value: 'normal', label: 'Normal' },
              { value: 'hard', label: 'Hard' },
            ]}
          />
          <Tooltip tip="Grants progress">
            <Button variant="secondary">Hover or focus me</Button>
          </Tooltip>
        </Section>

        <Section title="Badge, card, progress, skeleton">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="ascent">Ascent</Badge>
            <Badge variant="reward">Reward</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <Card title="Quest log" className="w-64">
            <p className="font-sans text-sm text-muted">
              Three quests remain in this chapter.
            </p>
          </Card>
          <div className="flex w-64 flex-col gap-3">
            <Progress value={30} max={60} label="Chapter progress" />
            <Progress
              value={80}
              max={100}
              label="Reward track"
              variant="reward"
            />
          </div>
          <div className="flex w-64 flex-col gap-2">
            <Skeleton className="h-6 w-40" label="Loading title" />
            <Skeleton className="h-4 w-full" label="Loading body" />
          </div>
        </Section>

        <Section title="Tabs">
          <div className="w-full max-w-md">
            <Tabs
              label="Quest views"
              tabs={[
                { id: 'learn', label: 'Learn', content: 'Lesson text.' },
                {
                  id: 'practice',
                  label: 'Practice',
                  content: 'Exercise text.',
                },
                {
                  id: 'review',
                  label: 'Review',
                  content: 'Summary text.',
                },
              ]}
            />
          </div>
        </Section>

        <Section title="Overlays">
          <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
          <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
            Open drawer
          </Button>
          <Button variant="secondary" onClick={() => setRewardOpen(true)}>
            Open reward popup
          </Button>
          <ToastDemo />
        </Section>

        <Section title="XP and level">
          <div className="flex w-64 flex-col gap-4">
            <XPBar value={120} max={200} label="Experience" />
          </div>
          <LevelBadge level={7} title="Debugger" />
          <LevelBadge level={12} />
        </Section>

        <Section title="Quest trail">
          <QuestPath label="Chapter one trail">
            <QuestNode status="completed" label="Variables" />
            <QuestNode status="in_progress" label="Loops" />
            <QuestNode status="not_started" label="Arrays" />
            <QuestNode status="locked" label="Functions" />
          </QuestPath>
        </Section>

        <Section title="Chapters and achievements">
          <ChapterCard
            title="Foundations"
            description="First steps with variables."
            completedQuests={2}
            totalQuests={5}
            statusText="In progress"
          />
          <div className="flex w-72 flex-col gap-3">
            <AchievementCard
              title="First run"
              description="Ran code once."
              unlocked
            />
            <AchievementCard
              title="Marathon"
              description="Finish a chapter."
              unlocked={false}
            />
          </div>
        </Section>

        <Dialog
          open={dialogOpen}
          title="Settings"
          description="Modal dialog with focus trap."
          onClose={() => setDialogOpen(false)}
        >
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </Dialog>
        <Drawer
          open={drawerOpen}
          title="Menu"
          onClose={() => setDrawerOpen(false)}
        >
          <Button onClick={() => setDrawerOpen(false)}>Close</Button>
        </Drawer>
        <RewardPopup
          open={rewardOpen}
          title="Quest complete"
          description="+50 XP earned."
          onClose={() => setRewardOpen(false)}
        />
      </main>
    </ToastProvider>
  );
}
