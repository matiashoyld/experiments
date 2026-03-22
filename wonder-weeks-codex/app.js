const STORAGE_KEY = 'leap-atlas-state-v2';
const TOTAL_WEEKS = 80;
const TIMELINE_START_WEEK = 5;
const TIMELINE_END_WEEK = 77;
const TODAY = new Date();

const LEAPS = [
  {
    number: 1,
    title: 'Sensations',
    anchorWeek: 4,
    signalStartWeek: 4,
    signalEndWeek: 6,
    skillsStartWeek: 6,
    stormWeek: 5,
    summary: 'A richer world of sights, sounds, smells, tastes, and touch begins to register.',
    fussyCopy:
      'The public leap 1 page says the first signals can show from week 4, with the greatest chance around week 5.',
    skillsCopy:
      'The same page says the new world starts to settle around week 6, when attention to faces and distant focus can improve.',
    signals: ['crying', 'clinginess', 'crankiness', 'more sensitive'],
    examples: [
      'Public leap 1 examples mention high-contrast shapes, faces, and the first smile.',
      'The public page also notes that the first tear can show around week 6.',
    ],
  },
  {
    number: 2,
    title: 'Patterns',
    anchorWeek: 7,
    signalStartWeek: 7,
    signalEndWeek: 10,
    skillsStartWeek: 9,
    stormWeek: 8,
    summary: 'The early blur of experience starts to separate into recognizable patterns.',
    fussyCopy:
      'The public leap 2 page says this fussy phase usually sits between weeks 7 and 10, with the familiar 3 Cs at the center.',
    skillsCopy:
      'The public page says many babies show leap 2 skills around weeks 9 to 10, when fixed patterns begin to stand out.',
    signals: ['crying', 'clinginess', 'crankiness', 'more demand for variation'],
    examples: [
      'The public leap 2 page says calm is often replaced by a stronger need for variation and changing perspectives.',
      'Patterns become easier to distinguish once the second leap settles.',
    ],
  },
  {
    number: 3,
    title: 'Smooth transitions',
    anchorWeek: 11,
    signalStartWeek: 11,
    signalEndWeek: 12,
    skillsStartWeek: 12,
    stormWeek: 11,
    summary: 'Changes in light, motion, tone, and movement begin to feel connected rather than isolated.',
    fussyCopy:
      'The public leap 3 page says the fussy start often appears around week 11, with the same 3 Cs plus quieter movement or fewer sounds.',
    skillsCopy:
      'The same page says leap 3 skills start to show from around week 12, especially around smoother body and voice movements.',
    signals: ['crying', 'clinginess', 'crankiness', 'quieter movement'],
    examples: [
      'The public leap 3 page mentions flowing motion, putting things in the mouth, and the classic airplane game.',
      'Voice play and less jerky movement are called out as public examples.',
    ],
  },
  {
    number: 4,
    title: 'Events',
    anchorWeek: 14,
    signalStartWeek: 14,
    signalEndWeek: 20,
    skillsStartWeek: 20,
    stormWeek: 17,
    summary: 'Short series of changes begin to connect into small events and repeated sequences.',
    fussyCopy:
      'The public leap 4 page says the fussy phase often lasts longer than earlier leaps and can run through about week 20.',
    skillsCopy:
      'That page also says the nicest part of the leap starts around week 20, when new babbling, grabbing, and event-based play can show up.',
    signals: ['crying', 'clinginess', 'crankiness', 'progress feels slower'],
    examples: [
      'Public leap 4 examples include bouncing balls, waving hands, nursery rhymes, and grabbing objects.',
      'The page also mentions early babbling sounds like repeated syllables.',
    ],
  },
  {
    number: 5,
    title: 'Relationships',
    anchorWeek: 22,
    signalStartWeek: 22,
    signalEndWeek: 26,
    skillsStartWeek: 26,
    stormWeek: 26,
    summary: 'Distance, space, and how people or objects relate to one another become more meaningful.',
    fussyCopy:
      'The public leap 5 page says signals begin from week 22 and the greatest chance often sits around week 26.',
    skillsCopy:
      'The same page says the skills phase often arrives around week 26, when relationships between earlier experiences start to click.',
    signals: ['crying', 'clinginess', 'crankiness', 'distance awareness'],
    examples: [
      'The public leap 5 materials connect this leap to distance between people and objects.',
      'The blog and FAQ materials also tie this leap to the pink bar meaning around separation and distance.',
    ],
  },
  {
    number: 6,
    title: 'Categories',
    anchorWeek: 33,
    signalStartWeek: 33,
    signalEndWeek: 38,
    skillsStartWeek: 37,
    stormWeek: 35,
    summary: 'The world starts to sort into groups, types, and emotional categories.',
    fussyCopy:
      'The public leap 6 page says the first signals appear during weeks 33 to 38 and often make routine care harder.',
    skillsCopy:
      'The same page says leap 6 skills can start to show from week 37, when groups and categories make more sense.',
    signals: ['crying', 'clinginess', 'crankiness', 'difficult diaper changes'],
    examples: [
      'Public leap 6 examples say babies begin to see that a dog is not a horse and that people can feel different emotions.',
      'The page also notes that eating and diaper changes can become harder during the fussy part.',
    ],
  },
  {
    number: 7,
    title: 'Sequences',
    anchorWeek: 41,
    signalStartWeek: 41,
    signalEndWeek: 47,
    skillsStartWeek: 46,
    stormWeek: 43,
    summary: 'Ordered actions begin to make sense, from cause-and-effect chains to simple routines.',
    fussyCopy:
      'The public leap 7 page says signals usually appear between weeks 41 and 47, often with clinginess, shyness, and sleep disruption.',
    skillsCopy:
      'The same page says the fussy phase often ends around week 46, when sequence-based skills start to show.',
    signals: ['crying', 'clinginess', 'crankiness', 'sleep changes'],
    examples: [
      'Public leap 7 examples include spooning porridge step by step and putting things in, on, or next to each other.',
      'The page also notes babies can become more purposeful in how they act.',
    ],
  },
  {
    number: 8,
    title: 'Programs',
    anchorWeek: 51,
    signalStartWeek: 51,
    signalEndWeek: 56,
    skillsStartWeek: 54,
    stormWeek: 53,
    summary: 'Whole routines start to hang together as one thing rather than a chain of unrelated steps.',
    fussyCopy:
      'The public leap 8 page says the leap starts around week 51 and often brings clinginess, mood changes, and sleep regression.',
    skillsCopy:
      'That page says new program-based skills often show shortly after the first birthday, around week 54.',
    signals: ['crying', 'clinginess', 'crankiness', 'sleep regression'],
    examples: [
      'Public leap 8 examples include washing dishes, setting the table, getting dressed, and helping with chores.',
      'The leap 8 page also frames this moment as the baby-to-toddler transition.',
    ],
  },
  {
    number: 9,
    title: 'Principles',
    anchorWeek: 59,
    signalStartWeek: 59,
    signalEndWeek: 65,
    skillsStartWeek: 64,
    stormWeek: 62,
    summary: 'Plans, choices, and consequences start to feel more deliberate and strategic.',
    fussyCopy:
      'The public leap 9 page says toddlers often show more crying, clinginess, and crankiness between weeks 59 and 65.',
    skillsCopy:
      'That same page says leap 9 skills often show around week 64, when programs turn into flexible plans and choices.',
    signals: ['crying', 'clinginess', 'crankiness', 'frustration'],
    examples: [
      'Public leap 9 descriptions mention thinking ahead, weighing consequences, and forming simple strategies.',
      'The leap 9 page also says imitation becomes much stronger here.',
    ],
  },
  {
    number: 10,
    title: 'Systems',
    anchorWeek: 70,
    signalStartWeek: 70,
    signalEndWeek: 76,
    skillsStartWeek: 75,
    stormWeek: 72,
    summary: 'Broader systems, self-other differences, time, and independence become easier to grasp.',
    fussyCopy:
      'The public leap 10 page says the first signals start from week 70 and can include crying, clinginess, crankiness, and tantrums.',
    skillsCopy:
      'That page says the skills phase often starts around week 75, when systems and self-awareness become easier to see.',
    signals: ['crying', 'clinginess', 'crankiness', 'tantrums'],
    examples: [
      'Public leap 10 examples mention understanding you and me, enjoying music more, and wanting to do things independently.',
      'The page also ties this leap to a stronger sense that other people are separate individuals.',
    ],
  },
];

const FEATURES = [
  {
    title: 'Personalized leap schedule',
    status: 'verified',
    description: 'Official app pages say the real app shows when a leap starts and ends, plus the fussy phase, skills phase, and easy spell.',
  },
  {
    title: 'Due-date based timing',
    status: 'verified',
    description: 'The official FAQ says leap timing should be calculated from the 40-week due date, not the birth date.',
  },
  {
    title: 'Signals and skills',
    status: 'verified',
    description: 'Public leap pages explain each leap through a fussy phase, skills phase, and public cue lists centered on the 3 Cs.',
  },
  {
    title: '77 playtime activities',
    status: 'verified',
    description: 'The official app page and store listings say the app includes 77 playtime games or activities.',
  },
  {
    title: 'Diary tracking',
    status: 'verified',
    description: 'The app page and FAQs publicly describe a diary that can be backed up and shared with a partner.',
  },
  {
    title: 'Partner sync',
    status: 'verified',
    description: 'The partner sharing FAQ says the diary, signals, skills, and games can sync when sharing is enabled.',
  },
  {
    title: 'Community, videos, and polls',
    status: 'verified',
    description: 'The App Store and Google Play listings publicly describe community, videos, and polls.',
  },
  {
    title: 'Baby monitor',
    status: 'verified',
    description: 'Official FAQs describe a baby monitor with Wi-Fi and 4G wireless connectivity.',
  },
  {
    title: 'Exact day bars',
    status: 'limited',
    description: 'The real app appears to have more precise day-level timing than what is public. This prototype only renders public windows.',
  },
  {
    title: 'Current phase estimation',
    status: 'inferred',
    description: 'This app estimates whether the baby is likely in the fussy window, skills window, or easier stretch based on public week markers.',
  },
];

const profileNameDisplay = document.querySelector('#profile-name-display');
const profileAgeDisplay = document.querySelector('#profile-age-display');
const profileAvatar = document.querySelector('#profile-avatar');
const statusPill = document.querySelector('#status-pill');
const statusBannerCopy = document.querySelector('#status-banner-copy');
const statusViewDate = document.querySelector('#status-view-date');
const todayLeapTitle = document.querySelector('#today-leap-title');
const todayPhaseChip = document.querySelector('#today-phase-chip');
const todayLeapSummary = document.querySelector('#today-leap-summary');
const metricWeeks = document.querySelector('#metric-weeks');
const metricPhase = document.querySelector('#metric-phase');
const metricPhaseCopy = document.querySelector('#metric-phase-copy');
const metricNext = document.querySelector('#metric-next');
const metricNextCopy = document.querySelector('#metric-next-copy');
const metricDueDate = document.querySelector('#metric-due-date');
const todayTrackTitle = document.querySelector('#today-track-title');
const todayPhaseTrack = document.querySelector('#today-phase-track');
const miniLeapStrip = document.querySelector('#mini-leap-strip');
const todaySignalChips = document.querySelector('#today-signal-chips');
const todaySignalCopy = document.querySelector('#today-signal-copy');
const upNextList = document.querySelector('#up-next-list');
const timelineViewDate = document.querySelector('#timeline-view-date');
const timelineCurrentWeek = document.querySelector('#timeline-current-week');
const timelineFocusedLeap = document.querySelector('#timeline-focused-leap');
const timelineFocusedCopy = document.querySelector('#timeline-focused-copy');
const timelineLabelToggle = document.querySelector('#timeline-label-toggle');
const timelineWeekBlocks = document.querySelector('#timeline-week-blocks');
const focusCardTitle = document.querySelector('#focus-card-title');
const focusCardSummary = document.querySelector('#focus-card-summary');
const focusStats = document.querySelector('#focus-stats');
const detailTitle = document.querySelector('#detail-title');
const detailStatusPill = document.querySelector('#detail-status-pill');
const detailSummary = document.querySelector('#detail-summary');
const detailAnchor = document.querySelector('#detail-anchor');
const detailAnchorCopy = document.querySelector('#detail-anchor-copy');
const detailWindow = document.querySelector('#detail-window');
const detailWindowCopy = document.querySelector('#detail-window-copy');
const detailSkillsFrom = document.querySelector('#detail-skills-from');
const detailSkillsCopy = document.querySelector('#detail-skills-copy');
const detailRelation = document.querySelector('#detail-relation');
const detailRelationCopy = document.querySelector('#detail-relation-copy');
const detailFussyCopy = document.querySelector('#detail-fussy-copy');
const detailSkillsPhaseCopy = document.querySelector('#detail-skills-phase-copy');
const detailSignalChips = document.querySelector('#detail-signal-chips');
const detailSignalNote = document.querySelector('#detail-signal-note');
const detailExampleList = document.querySelector('#detail-example-list');
const detailBoundaryCopy = document.querySelector('#detail-boundary-copy');
const diaryForm = document.querySelector('#diary-form');
const entryTitleInput = document.querySelector('#entry-title');
const entryDateInput = document.querySelector('#entry-date');
const entryTagInput = document.querySelector('#entry-tag');
const entryNoteInput = document.querySelector('#entry-note');
const diaryContextTitle = document.querySelector('#diary-context-title');
const diaryContextCopy = document.querySelector('#diary-context-copy');
const diaryEmpty = document.querySelector('#diary-empty');
const diaryList = document.querySelector('#diary-list');
const featureList = document.querySelector('#feature-list');
const tabButtons = document.querySelectorAll('[data-view-target]');
const views = document.querySelectorAll('.view');
const openProfileButtons = [
  document.querySelector('#open-profile'),
  document.querySelector('#open-profile-secondary'),
  document.querySelector('#timeline-edit-profile'),
];
const jumpTodayButton = document.querySelector('#jump-today');
const openTimelineButton = document.querySelector('#open-timeline');
const focusCurrentLeapButton = document.querySelector('#focus-current-leap');
const openLeapDetailButton = document.querySelector('#open-leap-detail');
const profileSheet = document.querySelector('#profile-sheet');
const sheetBackdrop = document.querySelector('#sheet-backdrop');
const closeProfileButton = document.querySelector('#close-profile');
const profileForm = document.querySelector('#profile-form');
const profileNameInput = document.querySelector('#profile-name');
const profileDueDateInput = document.querySelector('#profile-due-date');
const profileViewDateInput = document.querySelector('#profile-view-date');
const profileUseTodayButton = document.querySelector('#profile-use-today');

const defaultDueDate = toInputDate(new Date(TODAY.getTime() - 17 * 7 * 24 * 60 * 60 * 1000));
const defaultState = {
  babyName: 'Baby Atlas',
  dueDate: defaultDueDate,
  viewDate: toInputDate(TODAY),
  activeView: 'today',
  focusedLeap: 4,
  timelineLabelMode: 'weeks',
  diaryEntries: [],
};

let state = loadState();
const hashView = window.location.hash.replace('#', '');

if (['today', 'timeline', 'leap', 'diary', 'more'].includes(hashView)) {
  state.activeView = hashView;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...defaultState };
    }

    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      diaryEntries: Array.isArray(parsed.diaryEntries) ? parsed.diaryEntries : [],
    };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toInputDate(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function parseLocalDate(dateString) {
  return new Date(`${dateString}T12:00:00`);
}

function formatDate(dateString) {
  const date = parseLocalDate(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatMonthDay(dateString) {
  const date = parseLocalDate(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatDateLong(dateString) {
  const date = parseLocalDate(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function addWeeks(dateString, weeks) {
  const date = parseLocalDate(dateString);
  date.setDate(date.getDate() + weeks * 7);
  return toInputDate(date);
}

function formatWeekValue(weeks) {
  return `${weeks.toFixed(1)} weeks`;
}

function getWeeksFromDue(dueDate, viewDate) {
  const due = parseLocalDate(dueDate);
  const view = parseLocalDate(viewDate);
  const diff = view.getTime() - due.getTime();
  return diff / (1000 * 60 * 60 * 24 * 7);
}

function getUpcomingLeaps(weeks) {
  return LEAPS.filter((leap) => leap.anchorWeek > weeks).slice(0, 3);
}

function getCurrentLeap(weeks) {
  if (weeks < 0) {
    return { current: null, next: LEAPS[0], previous: null };
  }

  let current = LEAPS[0];
  let next = null;
  let previous = null;

  for (const leap of LEAPS) {
    if (weeks >= leap.anchorWeek) {
      previous = current;
      current = leap;
      continue;
    }

    next = leap;
    break;
  }

  if (weeks < LEAPS[0].anchorWeek) {
    current = null;
    next = LEAPS[0];
  }

  if (weeks >= LEAPS[LEAPS.length - 1].anchorWeek) {
    next = null;
  }

  return { current, next, previous };
}

function getEasyStart(leap, nextLeap) {
  if (!nextLeap) {
    return Math.min(leap.skillsStartWeek + 3, TOTAL_WEEKS);
  }

  const gap = nextLeap.anchorWeek - leap.skillsStartWeek;
  if (gap <= 2) {
    return nextLeap.anchorWeek;
  }

  return nextLeap.anchorWeek - Math.min(2, Math.max(1, Math.round(gap * 0.2)));
}

function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

function getPhase(weeks, leap, nextLeap) {
  if (weeks < 0) {
    return {
      key: 'before-due',
      label: 'Before due date',
      banner: 'Timeline starts from the due date. This view is still before that anchor.',
      summary: 'No leap is active yet because the due date has not arrived.',
      chip: 'Before due date',
    };
  }

  if (!leap) {
    return {
      key: 'pre-leap',
      label: 'Pre-leap',
      banner: 'You are before leap 1. The first public signal window starts at week 4 after the due date.',
      summary: 'No leap has started yet in the public schedule.',
      chip: 'Pre-leap',
    };
  }

  const easyStart = getEasyStart(leap, nextLeap);

  if (weeks < leap.skillsStartWeek) {
    return {
      key: 'fussy',
      label: 'Likely fussy window',
      banner: 'Public Wonder Weeks materials describe this stretch as the harder part of a leap, centered on crying, clinginess, and crankiness.',
      summary: 'The public schedule places you before the skills start for this leap.',
      chip: 'Fussy',
    };
  }

  if (weeks < easyStart) {
    return {
      key: 'skills',
      label: 'Likely skills window',
      banner: 'Wonder Weeks publicly says the skills phase starts when the fussy period eases and the new world becomes easier to explore.',
      summary: 'The public schedule places you in the skills part of the leap.',
      chip: 'Skills',
    };
  }

  if (nextLeap && weeks < nextLeap.anchorWeek) {
    return {
      key: 'easy',
      label: 'Likely easy spell',
      banner: 'The official app page says the real app marks easy spells. This prototype estimates that calmer stretch from the public anchors.',
      summary: 'You are past the public skills start and close to the next leap anchor.',
      chip: 'Easy spell',
    };
  }

  return {
    key: 'skills',
    label: 'Likely skills window',
    banner: 'No later public anchor has replaced this leap yet, so the app keeps you in the skills-side state.',
    summary: 'You are past the public skills start for the latest recorded leap.',
    chip: 'Skills',
  };
}

function getFocusedLeap() {
  return LEAPS.find((leap) => leap.number === state.focusedLeap) || LEAPS[0];
}

function getRelationToLeap(weeks, leap) {
  const nextLeap = LEAPS[leap.number] || null;
  const phase = getPhase(weeks, leap, nextLeap);

  if (weeks < leap.anchorWeek) {
    return {
      title: 'Upcoming',
      copy: `Your timeline has not reached leap ${leap.number} yet.`,
    };
  }

  if (weeks <= leap.signalEndWeek) {
    return {
      title: phase.label,
      copy: `Your view date falls inside the public signal window for leap ${leap.number}.`,
    };
  }

  if (nextLeap && weeks >= nextLeap.anchorWeek) {
    return {
      title: 'Completed',
      copy: `Your timeline has already moved beyond leap ${leap.number} and into a later leap anchor.`,
    };
  }

  return {
    title: phase.label,
    copy: `Your timeline is after the public skills start for leap ${leap.number}.`,
  };
}

function getSegmentOffsets(leap, nextLeap) {
  const easyStart = getEasyStart(leap, nextLeap);
  const endWeek = nextLeap ? nextLeap.anchorWeek : TOTAL_WEEKS;

  return {
    fussyLeft: weekToPercent(leap.signalStartWeek),
    fussyWidth: weekToPercent(leap.skillsStartWeek - leap.signalStartWeek),
    skillsLeft: weekToPercent(leap.skillsStartWeek),
    skillsWidth: weekToPercent(Math.max(easyStart - leap.skillsStartWeek, 0)),
    easyLeft: weekToPercent(easyStart),
    easyWidth: weekToPercent(Math.max(endWeek - easyStart, 0)),
  };
}

function weekToPercent(weeks) {
  return `${(clamp(weeks, 0, TOTAL_WEEKS) / TOTAL_WEEKS) * 100}%`;
}

function initialsForName(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'BA';
}

function pluralizeWeeks(weeks) {
  const absolute = Math.abs(weeks);
  const rounded = absolute.toFixed(1);

  if (weeks < 0) {
    return `${rounded} weeks until due date`;
  }

  return `${rounded} weeks from due date`;
}

function switchView(viewName) {
  state.activeView = viewName;
  views.forEach((view) => view.classList.toggle('is-active', view.dataset.view === viewName));
  tabButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.viewTarget === viewName));
  history.replaceState(null, '', `#${viewName}`);
  saveState();
}

function openProfileSheet() {
  profileNameInput.value = state.babyName;
  profileDueDateInput.value = state.dueDate;
  profileViewDateInput.value = state.viewDate;
  profileSheet.classList.remove('is-hidden');
  sheetBackdrop.classList.remove('is-hidden');
  profileSheet.setAttribute('aria-hidden', 'false');
}

function closeProfileSheet() {
  profileSheet.classList.add('is-hidden');
  sheetBackdrop.classList.add('is-hidden');
  profileSheet.setAttribute('aria-hidden', 'true');
}

function renderMiniLeapStrip(currentLeapNumber) {
  miniLeapStrip.innerHTML = '';

  LEAPS.forEach((leap) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `leap-chip${state.focusedLeap === leap.number ? ' is-selected' : ''}`;
    button.innerHTML = `
      <small>Leap ${leap.number}</small>
      <strong>${leap.title}</strong>
    `;
    button.addEventListener('click', () => {
      state.focusedLeap = leap.number;
      switchView('leap');
      renderApp();
    });

    if (currentLeapNumber === leap.number) {
      button.title = 'Current leap';
    }

    miniLeapStrip.appendChild(button);
  });
}

function renderTodayTrack(currentLeap, nextLeap, weeks) {
  todayPhaseTrack.innerHTML = '';

  if (!currentLeap) {
    const marker = document.createElement('div');
    marker.className = 'phase-marker';
    marker.style.left = weekToPercent(Math.max(weeks, 0));
    todayPhaseTrack.appendChild(marker);
    return;
  }

  const offsets = getSegmentOffsets(currentLeap, nextLeap);
  const segments = [
    ['fussy', offsets.fussyLeft, offsets.fussyWidth],
    ['skills', offsets.skillsLeft, offsets.skillsWidth],
    ['easy', offsets.easyLeft, offsets.easyWidth],
  ];

  segments.forEach(([key, left, width]) => {
    if (parseFloat(width) <= 0) {
      return;
    }
    const segment = document.createElement('div');
    segment.className = `phase-segment ${key}`;
    segment.style.left = left;
    segment.style.width = width;
    todayPhaseTrack.appendChild(segment);
  });

  const marker = document.createElement('div');
  marker.className = 'phase-marker';
  marker.style.left = weekToPercent(weeks);
  todayPhaseTrack.appendChild(marker);
}

function renderTodayView(weeks, currentLeap, nextLeap, phase) {
  const activeLeap = currentLeap || LEAPS[0];

  todayLeapTitle.textContent = currentLeap
    ? `Leap ${currentLeap.number}: ${currentLeap.title}`
    : weeks < 0
      ? 'Before the due date'
      : 'Leap 1 is next';
  todayPhaseChip.textContent = phase.chip;
  todayLeapSummary.textContent = currentLeap
    ? currentLeap.summary
    : weeks < 0
      ? 'The public leap chart starts after the due date, so the app is waiting for that starting point.'
      : 'The first public leap anchor begins at week 4 after the due date.';

  metricWeeks.textContent = formatWeekValue(Math.abs(weeks));
  metricPhase.textContent = phase.label;
  metricPhaseCopy.textContent = phase.summary;
  metricDueDate.textContent = formatDate(state.dueDate);

  if (nextLeap) {
    metricNext.textContent = `Leap ${nextLeap.number} on ${formatDate(addWeeks(state.dueDate, nextLeap.anchorWeek))}`;
    metricNextCopy.textContent = `Public anchor at week ${nextLeap.anchorWeek}.`;
  } else {
    metricNext.textContent = 'No later public leap';
    metricNextCopy.textContent = 'Wonder Weeks publicly says the recorded model runs through 10 leaps in the first 20 months.';
  }

  todayTrackTitle.textContent = currentLeap
    ? `Leap ${currentLeap.number} timeline`
    : 'Public schedule overview';
  renderTodayTrack(currentLeap, nextLeap, clamp(weeks, 0, TOTAL_WEEKS));
  renderMiniLeapStrip(currentLeap?.number || 0);

  todaySignalChips.innerHTML = '';
  (currentLeap ? currentLeap.signals : ['crying', 'clinginess', 'crankiness']).forEach((signal) => {
    const chip = document.createElement('span');
    chip.className = 'signal-chip';
    chip.textContent = signal;
    todaySignalChips.appendChild(chip);
  });

  todaySignalCopy.textContent = currentLeap
    ? currentLeap.fussyCopy
    : 'The Wonder Weeks public materials repeatedly explain the fussy phase through the 3 Cs: crying, clinginess, and crankiness.';

  upNextList.innerHTML = '';
  getUpcomingLeaps(weeks).forEach((leap) => {
    const item = document.createElement('article');
    item.className = 'up-next-item';
    item.innerHTML = `
      <span>Leap ${leap.number}</span>
      <strong>${leap.title}</strong>
      <p>Week ${leap.anchorWeek} on ${formatDate(addWeeks(state.dueDate, leap.anchorWeek))}</p>
    `;
    upNextList.appendChild(item);
  });
}

function chunkArray(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function getTimelineLabel(week) {
  if (state.timelineLabelMode === 'dates') {
    return formatMonthDay(addWeeks(state.dueDate, week));
  }

  return `${week}`;
}

function getLeapForWeek(week) {
  for (let index = 0; index < LEAPS.length; index += 1) {
    const leap = LEAPS[index];
    const nextLeap = LEAPS[index + 1] || null;

    if (week >= leap.anchorWeek && (!nextLeap || week < nextLeap.anchorWeek)) {
      return leap;
    }
  }

  return null;
}

function getTimelineRows() {
  const weeks = [];

  for (let week = TIMELINE_START_WEEK; week <= TIMELINE_END_WEEK; week += 1) {
    weeks.push(week);
  }

  return chunkArray(weeks, 3);
}

function getRowLabel(chunk) {
  for (const leap of LEAPS) {
    if (leap.number === 1 && chunk[0] === TIMELINE_START_WEEK) {
      return {
        leap,
        left: `${((0.5 / 3) * 100).toFixed(2)}%`,
      };
    }

    const weekIndex = chunk.indexOf(leap.anchorWeek);
    if (weekIndex !== -1) {
      return {
        leap,
        left: `${((((weekIndex + 0.5) / 3) * 100)).toFixed(2)}%`,
      };
    }
  }

  return null;
}

function getFocusLeapForRow(chunk, currentWeek) {
  if (currentWeek >= chunk[0] && currentWeek < chunk[0] + 3) {
    return getCurrentLeap(currentWeek).current?.number || getLeapForWeek(chunk[0])?.number || LEAPS[0].number;
  }

  const rowLabel = getRowLabel(chunk);
  if (rowLabel) {
    return rowLabel.leap.number;
  }

  return getLeapForWeek(chunk[0])?.number || LEAPS[0].number;
}

function renderTimelineChart(weeks) {
  timelineWeekBlocks.innerHTML = '';
  const clampedWeeks = clamp(weeks, 0, TOTAL_WEEKS);
  getTimelineRows().forEach((chunk) => {
    const row = document.createElement('section');
    row.className = 'timeline-row';

    const rowLabel = getRowLabel(chunk);
    if (rowLabel) {
      const label = document.createElement('div');
      label.className = 'timeline-row-label';
      label.textContent = `Leap ${rowLabel.leap.number}`;
      label.style.left = rowLabel.left;
      row.appendChild(label);
    }

    const focusLeap = getFocusLeapForRow(chunk, clampedWeeks);
    const rowButton = document.createElement('button');
    rowButton.type = 'button';
    rowButton.className = `timeline-row-button${state.focusedLeap === focusLeap ? ' is-selected' : ''}`;

    const chunkStart = chunk[0];
    const chunkEnd = chunkStart + 3;
    const containsCurrentWeek = clampedWeeks >= chunkStart && clampedWeeks < chunkEnd;

    if (containsCurrentWeek) {
      rowButton.classList.add('is-current-row');
    }

    const track = document.createElement('div');
    track.className = 'week-strip-track';

    chunk.forEach((week) => {
      const leap = getLeapForWeek(week);
      const isSignalWeek = leap ? week < leap.skillsStartWeek : false;
      const cell = document.createElement('div');
      cell.className = `week-cell ${isSignalWeek ? 'signal' : 'skills'}`;

      const inner = document.createElement('div');
      inner.className = 'week-cell-inner';

      if (leap && week === leap.stormWeek) {
        const marker = document.createElement('span');
        marker.className = 'week-marker week-marker-signal';
        marker.setAttribute('aria-hidden', 'true');
        inner.appendChild(marker);
      }

      if (leap && week === leap.skillsStartWeek) {
        const marker = document.createElement('span');
        marker.className = 'week-marker week-marker-skills';
        marker.setAttribute('aria-hidden', 'true');
        inner.appendChild(marker);
      }

      cell.appendChild(inner);
      track.appendChild(cell);
    });

    if (containsCurrentWeek) {
      const todayGuide = document.createElement('div');
      todayGuide.className = 'today-guide';
      todayGuide.style.left = `${((clampedWeeks - chunkStart) / 3) * 100}%`;

      const todayLabel = document.createElement('span');
      todayLabel.className = 'today-guide-label';
      todayLabel.textContent = 'Today';
      todayGuide.appendChild(todayLabel);
      track.appendChild(todayGuide);
    }

    const labels = document.createElement('div');
    labels.className = 'week-label-row';

    chunk.forEach((week) => {
      const caption = document.createElement('div');
      caption.className = 'week-caption';
      caption.textContent = getTimelineLabel(week);
      labels.appendChild(caption);
    });

    rowButton.append(track, labels);
    rowButton.addEventListener('click', () => {
      state.focusedLeap = focusLeap;
      renderApp();
    });

    row.appendChild(rowButton);
    timelineWeekBlocks.appendChild(row);
  });

  timelineCurrentWeek.textContent = weeks.toFixed(1);
  timelineFocusedLeap.textContent = `Leap ${state.focusedLeap}`;
  timelineFocusedCopy.textContent = `${getFocusedLeap().title} (${state.timelineLabelMode} labels)`;
  timelineLabelToggle.textContent = state.timelineLabelMode === 'weeks' ? 'Show dates' : 'Show weeks';
}

function renderFocusCard(weeks) {
  const leap = getFocusedLeap();
  const nextLeap = LEAPS[leap.number] || null;
  const relation = getRelationToLeap(weeks, leap);

  focusCardTitle.textContent = `Leap ${leap.number}: ${leap.title}`;
  focusCardSummary.textContent = leap.summary;
  focusStats.innerHTML = '';

  const stats = [
    `Public signal window: weeks ${leap.signalStartWeek} to ${leap.signalEndWeek}.`,
    `Public skills start: around week ${leap.skillsStartWeek}.`,
    `Most likely fussy week marker: week ${leap.stormWeek}.`,
    relation.copy,
  ];

  stats.forEach((copy) => {
    const item = document.createElement('li');
    item.textContent = copy;
    focusStats.appendChild(item);
  });
}

function renderLeapDetail(weeks) {
  const leap = getFocusedLeap();
  const nextLeap = LEAPS[leap.number] || null;
  const relation = getRelationToLeap(weeks, leap);
  const currentLeap = getCurrentLeap(weeks).current;

  detailTitle.textContent = `Leap ${leap.number}: ${leap.title}`;
  detailStatusPill.textContent = currentLeap?.number === leap.number ? 'Current leap' : relation.title;
  detailSummary.textContent = leap.summary;
  detailAnchor.textContent = `Week ${leap.anchorWeek}`;
  detailAnchorCopy.textContent = `This anchor lands on ${formatDate(addWeeks(state.dueDate, leap.anchorWeek))} for the due date you entered.`;
  detailWindow.textContent = `Weeks ${leap.signalStartWeek} to ${leap.signalEndWeek}`;
  detailWindowCopy.textContent = `Public signal range, based on the official leap page and chart.`;
  detailSkillsFrom.textContent = `Around week ${leap.skillsStartWeek}`;
  detailSkillsCopy.textContent = `That is ${formatDate(addWeeks(state.dueDate, leap.skillsStartWeek))} on your personalized due-date timeline.`;
  detailRelation.textContent = relation.title;
  detailRelationCopy.textContent = relation.copy;
  detailFussyCopy.textContent = leap.fussyCopy;
  detailSkillsPhaseCopy.textContent = leap.skillsCopy;
  detailSignalNote.textContent = nextLeap
    ? `The next public anchor is leap ${nextLeap.number} at week ${nextLeap.anchorWeek}. Any exact day-level transition before that is not public.`
    : 'Leap 10 is the last leap that Wonder Weeks publicly says it has recorded in this model.';
  detailBoundaryCopy.textContent = `This leap detail is driven by official public Wonder Weeks leap pages. The exact internal app checklist, premium guidance, and exact day bars are not public, so this screen only shows public information and marked estimates.`;

  detailSignalChips.innerHTML = '';
  leap.signals.forEach((signal) => {
    const chip = document.createElement('span');
    chip.className = 'signal-chip';
    chip.textContent = signal;
    detailSignalChips.appendChild(chip);
  });

  detailExampleList.innerHTML = '';
  leap.examples.forEach((example) => {
    const item = document.createElement('li');
    item.textContent = example;
    detailExampleList.appendChild(item);
  });
}

function renderDiary(weeks) {
  const currentLeap = getCurrentLeap(weeks).current || LEAPS[0];
  diaryContextTitle.textContent = currentLeap ? `Leap ${currentLeap.number}: ${currentLeap.title}` : 'Pre-leap context';
  diaryContextCopy.textContent = currentLeap
    ? `New entries are saved locally and tagged to the current view date. Based on the public schedule, you are closest to leap ${currentLeap.number}.`
    : 'You are before leap 1, so diary notes will still save but will not map to an active leap yet.';

  entryDateInput.value = state.viewDate;

  const sortedEntries = [...state.diaryEntries].sort((a, b) => (a.date < b.date ? 1 : -1));
  diaryList.innerHTML = '';
  diaryEmpty.style.display = sortedEntries.length ? 'none' : 'block';

  sortedEntries.forEach((entry) => {
    const article = document.createElement('article');
    article.className = `diary-entry${entry.leap === currentLeap?.number ? ' is-current' : ''}`;
    article.innerHTML = `
      <div class="diary-entry-head">
        <div>
          <strong>${escapeHtml(entry.title)}</strong>
          <div class="entry-meta">
            <time datetime="${entry.date}">${formatDate(entry.date)}</time>
            <span class="entry-tag">${escapeHtml(entry.tag)}</span>
            <span class="entry-tag">Leap ${entry.leap || '-'}</span>
          </div>
        </div>
        <div class="entry-actions">
          <button class="icon-button" type="button" aria-label="Delete entry">x</button>
        </div>
      </div>
      <p>${escapeHtml(entry.note)}</p>
    `;

    const deleteButton = article.querySelector('.icon-button');
    deleteButton.addEventListener('click', () => {
      state.diaryEntries = state.diaryEntries.filter((item) => item.id !== entry.id);
      saveState();
      renderDiary(weeks);
    });

    diaryList.appendChild(article);
  });
}

function renderFeatures() {
  featureList.innerHTML = '';

  FEATURES.forEach((feature) => {
    const article = document.createElement('article');
    article.className = 'feature-item';
    article.innerHTML = `
      <div class="feature-item-head">
        <strong>${feature.title}</strong>
        <span class="feature-status ${feature.status}">${feature.status}</span>
      </div>
      <p>${feature.description}</p>
    `;
    featureList.appendChild(article);
  });
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderHeader(weeks, phase) {
  profileNameDisplay.textContent = state.babyName;
  profileAgeDisplay.textContent = pluralizeWeeks(weeks);
  profileAvatar.textContent = initialsForName(state.babyName);
  statusPill.textContent = phase.label;
  statusBannerCopy.textContent = phase.banner;
  statusViewDate.textContent = formatDateLong(state.viewDate);
}

function renderApp() {
  saveState();

  const weeks = getWeeksFromDue(state.dueDate, state.viewDate);
  const { current, next } = getCurrentLeap(weeks);
  const phase = getPhase(weeks, current, next);

  renderHeader(weeks, phase);
  renderTodayView(weeks, current, next, phase);
  renderTimelineChart(weeks);
  renderFocusCard(weeks);
  renderLeapDetail(weeks);
  renderDiary(weeks);
  renderFeatures();
  timelineViewDate.value = state.viewDate;
  switchView(state.activeView);
}

function handleProfileSave(event) {
  event.preventDefault();

  state.babyName = profileNameInput.value.trim() || defaultState.babyName;
  state.dueDate = profileDueDateInput.value;
  state.viewDate = profileViewDateInput.value;
  closeProfileSheet();
  renderApp();
}

function setupEventListeners() {
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      switchView(button.dataset.viewTarget);
    });
  });

  openProfileButtons.forEach((button) => {
    if (!button) {
      return;
    }
    button.addEventListener('click', openProfileSheet);
  });

  closeProfileButton.addEventListener('click', closeProfileSheet);
  sheetBackdrop.addEventListener('click', closeProfileSheet);
  profileForm.addEventListener('submit', handleProfileSave);

  profileUseTodayButton.addEventListener('click', () => {
    profileViewDateInput.value = toInputDate(TODAY);
  });

  jumpTodayButton.addEventListener('click', () => {
    state.viewDate = toInputDate(TODAY);
    renderApp();
  });

  openTimelineButton.addEventListener('click', () => {
    switchView('timeline');
  });

  focusCurrentLeapButton.addEventListener('click', () => {
    const weeks = getWeeksFromDue(state.dueDate, state.viewDate);
    const currentLeap = getCurrentLeap(weeks).current;
    if (currentLeap) {
      state.focusedLeap = currentLeap.number;
      renderApp();
    }
  });

  openLeapDetailButton.addEventListener('click', () => {
    switchView('leap');
  });

  timelineViewDate.addEventListener('input', (event) => {
    state.viewDate = event.target.value;
    renderApp();
  });

  timelineLabelToggle.addEventListener('click', () => {
    state.timelineLabelMode = state.timelineLabelMode === 'weeks' ? 'dates' : 'weeks';
    renderApp();
  });

  diaryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const weeks = getWeeksFromDue(state.dueDate, state.viewDate);
    const currentLeap = getCurrentLeap(weeks).current;

    state.diaryEntries.push({
      id: crypto.randomUUID(),
      title: entryTitleInput.value.trim(),
      date: entryDateInput.value,
      tag: entryTagInput.value,
      note: entryNoteInput.value.trim(),
      leap: currentLeap ? currentLeap.number : null,
    });

    diaryForm.reset();
    entryDateInput.value = state.viewDate;
    saveState();
    renderDiary(weeks);
  });
}

setupEventListeners();
renderApp();

if (!localStorage.getItem(STORAGE_KEY)) {
  openProfileSheet();
}
