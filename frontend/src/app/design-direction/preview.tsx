'use client';

import Image from 'next/image';
import { useState } from 'react';
import { CodeEditor } from '@/components/editor/code-editor';
import styles from './preview.module.css';

type Screen = 'home' | 'explore' | 'map' | 'lesson';
type Panel = 'lesson' | 'code' | 'result';
type Result = 'idle' | 'run' | 'check';

const initialSource = `const signal = 'hello, frontier';\nconsole.log(signal);`;
const screens: { id: Screen; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'explore', label: 'Explore' },
  { id: 'map', label: 'Course map' },
  { id: 'lesson', label: 'Lesson' },
];
const courses = [
  {
    name: 'JavaScript Trail',
    type: 'Journey 01',
    detail: 'Build the language one small win at a time.',
    color: 'mint',
  },
  {
    name: 'Web Foundations',
    type: 'Course 02',
    detail: 'Shape pages with HTML and CSS.',
    color: 'sky',
  },
  {
    name: 'Browser Lab',
    type: 'Course 03',
    detail: 'Make interfaces respond to people.',
    color: 'amber',
  },
] as const;

export function DesignDirectionPreview(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('home');
  const [panel, setPanel] = useState<Panel>('lesson');
  const [source, setSource] = useState(initialSource);
  const [result, setResult] = useState<Result>('idle');
  const [hintOpen, setHintOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('JavaScript Trail');
  const [query, setQuery] = useState('');
  const [exercise, setExercise] = useState(1);

  const navigate = (target: Screen): void => setScreen(target);
  const visibleCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className={styles.app}>
      <div className={styles.sampleBar} role="status">
        <span className={styles.sampleDot} aria-hidden="true" />
        DESIGN PREVIEW · SAMPLE CONTENT · ACTIONS DO NOT SAVE PROGRESS
      </div>
      <header className={styles.header}>
        <button
          className={styles.brand}
          onClick={() => navigate('home')}
          aria-label="CodeQuest preview home"
        >
          <Image
            src="/assets/design-system/brand/codequest-mark.svg"
            alt=""
            width={34}
            height={34}
          />
          <span>
            CodeQuest<span className={styles.brandPeriod}>.</span>
          </span>
        </button>
        <nav className={styles.nav} aria-label="Preview screens">
          {screens.map((item) => (
            <button
              key={item.id}
              type="button"
              className={screen === item.id ? styles.navActive : styles.navItem}
              aria-current={screen === item.id ? 'page' : undefined}
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className={styles.account} aria-label="Sample account display">
          <span className={styles.level}>LV 01</span>
          <span className={styles.avatar} aria-hidden="true">
            CQ
          </span>
        </div>
      </header>

      {screen === 'home' && (
        <main id="main-content" className={styles.main}>
          <section className={styles.hero} aria-labelledby="home-title">
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>A NEW PATH THROUGH CODE</p>
              <h1 id="home-title">Your next world starts with one line.</h1>
              <p className={styles.lead}>
                Learn to build for the web through short lessons, hands-on code,
                and a path you can see.
              </p>
              <div className={styles.heroActions}>
                <button
                  className={styles.primaryButton}
                  onClick={() => navigate('explore')}
                >
                  Explore courses <span aria-hidden="true">↗</span>
                </button>
                <button
                  className={styles.textButton}
                  onClick={() => navigate('lesson')}
                >
                  See a lesson <span aria-hidden="true">→</span>
                </button>
              </div>
              <p className={styles.sampleNote}>
                Sample journey · No account or progress is created here.
              </p>
            </div>
            <div className={styles.heroArt} aria-hidden="true">
              <Image
                src="/assets/design-system/worlds/foundations-valley.webp"
                alt=""
                fill
                priority
                sizes="(max-width: 800px) 100vw, 60vw"
              />
              <div className={styles.heroArtLabel}>01 / FOUNDATIONS VALLEY</div>
            </div>
          </section>
          <section className={styles.homeNext} aria-labelledby="path-title">
            <div>
              <p className={styles.eyebrow}>PICK YOUR DIRECTION</p>
              <h2 id="path-title">A route for every first step.</h2>
            </div>
            <button
              className={styles.inlineLink}
              onClick={() => navigate('explore')}
            >
              View all courses <span aria-hidden="true">→</span>
            </button>
          </section>
          <div className={styles.homeCourses}>
            {courses.map((course, index) => (
              <button
                className={styles.courseTile}
                key={course.name}
                onClick={() => {
                  setSelectedCourse(course.name);
                  navigate('map');
                }}
              >
                <span className={styles.courseIndex}>
                  0{index + 1} / {course.type}
                </span>
                <span
                  className={styles.courseSymbol}
                  data-color={course.color}
                  aria-hidden="true"
                >
                  {index === 0 ? '◇' : index === 1 ? '▧' : '⌘'}
                </span>
                <strong>{course.name}</strong>
                <span>{course.detail}</span>
                <span className={styles.tileArrow} aria-hidden="true">
                  ↗
                </span>
              </button>
            ))}
          </div>
        </main>
      )}

      {screen === 'explore' && (
        <main id="main-content" className={styles.main}>
          <div className={styles.pageIntro}>
            <p className={styles.eyebrow}>THE ATLAS / EXPLORE</p>
            <h1>Choose a course. Find your way.</h1>
            <p>
              Follow a guided journey or explore a new skill. These are sample
              destinations for the design review.
            </p>
          </div>
          <div className={styles.exploreTools}>
            <label htmlFor="course-search">Find a course</label>
            <input
              id="course-search"
              type="search"
              placeholder="Search sample courses"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span>
              {visibleCourses.length} SAMPLE{' '}
              {visibleCourses.length === 1 ? 'COURSE' : 'COURSES'}
            </span>
          </div>
          <div className={styles.exploreGrid}>
            {visibleCourses.map((course, index) => (
              <button
                className={styles.exploreCard}
                key={course.name}
                onClick={() => {
                  setSelectedCourse(course.name);
                  navigate('map');
                }}
              >
                <span
                  className={styles.cardVisual}
                  data-color={course.color}
                  aria-hidden="true"
                >
                  <span>{index === 0 ? '◇' : index === 1 ? '▧' : '⌘'}</span>
                </span>
                <span className={styles.cardBody}>
                  <small>{course.type.toUpperCase()} · SAMPLE</small>
                  <strong>{course.name}</strong>
                  <span>{course.detail}</span>
                  <span className={styles.inlineLink}>
                    View course <span aria-hidden="true">→</span>
                  </span>
                </span>
              </button>
            ))}
            {visibleCourses.length === 0 && (
              <p className={styles.emptyState}>
                No sample courses match “{query}”. Try another search.
              </p>
            )}
          </div>
        </main>
      )}

      {screen === 'map' && (
        <main id="main-content" className={styles.main}>
          <div className={styles.breadcrumb}>
            <button onClick={() => navigate('explore')}>Explore</button>
            <span aria-hidden="true">/</span>
            <span>Course map</span>
          </div>
          <section className={styles.mapHero} aria-labelledby="map-title">
            <div>
              <p className={styles.eyebrow}>SAMPLE COURSE / PATH 01</p>
              <h1 id="map-title">{selectedCourse}</h1>
              <p>
                Begin with a tiny program. Keep going until the pieces connect.
              </p>
              <button
                className={styles.primaryButton}
                onClick={() => navigate('lesson')}
              >
                Open sample lesson <span aria-hidden="true">→</span>
              </button>
            </div>
            <Image
              src="/assets/design-system/worlds/foundations-valley.webp"
              alt=""
              fill
              sizes="(max-width: 800px) 100vw, 45vw"
            />
          </section>
          <section
            className={styles.mapSection}
            aria-labelledby="chapter-title"
          >
            <div className={styles.sectionHeading}>
              <span>CHAPTER 01 / FIRST SIGNALS</span>
              <span>0 OF 3 · SAMPLE STATE</span>
            </div>
            <h2 id="chapter-title">The first steps</h2>
            <ol className={styles.questPath}>
              {['Send a signal', 'Shape a message', 'Connect the pieces'].map(
                (title, index) => (
                  <li key={title}>
                    <button
                      onClick={() => {
                        setExercise(index + 1);
                        navigate('lesson');
                      }}
                    >
                      <span className={styles.questNumber}>0{index + 1}</span>
                      <span>
                        <strong>{title}</strong>
                        <small>Sample exercise · not completed</small>
                      </span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </li>
                ),
              )}
            </ol>
          </section>
        </main>
      )}

      {screen === 'lesson' && (
        <main id="main-content" className={styles.lessonShell}>
          <div className={styles.lessonTop}>
            <div className={styles.breadcrumb}>
              <button onClick={() => navigate('map')}>Course map</button>
              <span aria-hidden="true">/</span>
              <span>Chapter 01</span>
              <span aria-hidden="true">/</span>
              <strong>Exercise 0{exercise}</strong>
            </div>
            <span className={styles.lessonProgress}>
              EXERCISE {exercise} / 3 · SAMPLE
            </span>
          </div>
          <div
            className={styles.panelSwitcher}
            role="group"
            aria-label="Learning panels"
          >
            {(['lesson', 'code', 'result'] as const).map((item) => (
              <button
                key={item}
                aria-pressed={panel === item}
                onClick={() => setPanel(item)}
              >
                {item === 'result'
                  ? 'Output'
                  : item === 'code'
                    ? 'Editor'
                    : 'Lesson'}
              </button>
            ))}
          </div>
          <div className={styles.workspace} data-panel={panel}>
            <section
              className={`${styles.pane} ${styles.lessonPane}`}
              aria-labelledby="lesson-title"
            >
              <div className={styles.paneHeader}>
                <span>01 / LESSON</span>
                <span>READ + TRY</span>
              </div>
              <div className={styles.lessonBody}>
                <p className={styles.eyebrow}>
                  FIRST SIGNALS / EXERCISE 0{exercise}
                </p>
                <h1 id="lesson-title">
                  {exercise === 1
                    ? 'Send a signal'
                    : exercise === 2
                      ? 'Shape a message'
                      : 'Connect the pieces'}
                </h1>
                <p>
                  Every program starts by making something happen. Here, you
                  will send a short message to the console.
                </p>
                <div className={styles.lessonCallout}>
                  <span aria-hidden="true">✳</span>
                  <p>
                    <strong>Your mission</strong>
                    <br />
                    Change the message in the editor, then inspect the sample
                    output.
                  </p>
                </div>
                <h2>Try it yourself</h2>
                <p>
                  Write a line of JavaScript with <code>console.log()</code>.
                  This preview shows the planned layout; it does not run your
                  code.
                </p>
                <button
                  className={styles.hintButton}
                  onClick={() => setHintOpen(!hintOpen)}
                  aria-expanded={hintOpen}
                >
                  {' '}
                  {hintOpen ? 'Hide sample hint' : 'Show sample hint'}{' '}
                  <span aria-hidden="true">⌄</span>
                </button>
                {hintOpen && (
                  <p className={styles.hint}>
                    A message goes between the parentheses. For example,{' '}
                    <code>console.log(&apos;hello&apos;)</code>.
                  </p>
                )}
              </div>
            </section>
            <section
              className={`${styles.pane} ${styles.editorPane}`}
              aria-labelledby="editor-title"
            >
              <div className={styles.paneHeader}>
                <span id="editor-title">02 / EDITOR</span>
                <span>LOCAL SAMPLE</span>
              </div>
              <div className={styles.fileTab}>
                ◈ &nbsp; main.js <span>●</span>
              </div>
              <CodeEditor
                value={source}
                onChange={setSource}
                language="javascript"
                label="Sample JavaScript editor"
                className={styles.codeEditor}
              />
              <div className={styles.editorFoot}>
                JAVASCRIPT <span>Draft stays in this preview session only</span>
              </div>
            </section>
            <section
              className={`${styles.pane} ${styles.resultPane}`}
              aria-labelledby="result-title"
            >
              <div className={styles.paneHeader}>
                <span id="result-title">03 / OUTPUT</span>
                <span>SIMULATED</span>
              </div>
              <div className={styles.resultTabs}>
                <span>Console</span>
                <span>Preview</span>
                <span>Checks</span>
              </div>
              <div
                className={styles.resultBody}
                role="status"
                aria-live="polite"
              >
                <span className={styles.consolePrompt}>›</span>
                {result === 'idle' ? (
                  <p>
                    Choose Run or Check to preview the feedback position. No
                    code executes here.
                  </p>
                ) : result === 'run' ? (
                  <p>
                    Sample Run state · your code was not executed. Live console
                    output arrives in R07.
                  </p>
                ) : (
                  <p>
                    Sample Check state · no validation or completion was
                    submitted.
                  </p>
                )}
              </div>
              <div className={styles.resultFoot}>
                <span className={styles.sampleDot} aria-hidden="true" /> SAMPLE
                RESULT ONLY
              </div>
            </section>
          </div>
          <div className={styles.actionBar}>
            <div className={styles.actionMeta}>
              <span>EXERCISE 0{exercise} / 03</span>
              <strong>
                +10 XP <small>sample placement</small>
              </strong>
            </div>
            <div className={styles.actionButtons}>
              <button
                className={styles.secondaryButton}
                onClick={() => setResult('run')}
              >
                ▷ Run <span className={styles.srOnly}>sample state</span>
              </button>
              <button
                className={styles.primaryButton}
                onClick={() => setResult('check')}
              >
                Check <span className={styles.srOnly}>sample state</span>
              </button>
              <span className={styles.actionDivider} aria-hidden="true" />
              <button
                className={styles.textButton}
                onClick={() => setExercise(Math.max(1, exercise - 1))}
              >
                ← Back
              </button>
              <button
                className={styles.textButton}
                onClick={() => setExercise(Math.min(3, exercise + 1))}
              >
                Next →
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
