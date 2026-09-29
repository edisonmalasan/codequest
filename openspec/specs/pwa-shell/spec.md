# PWA Shell Specification

## Purpose

Make CodeQuest installable and provide safe offline navigation and visible connectivity/update states without caching account data or interrupting learner work.

## Requirements

### Requirement: Installation metadata identifies the application

The application SHALL expose a valid same-origin manifest with stable identity, name, scope, start URL, standalone display, theme/background colors, and usable 192/512 pixel icons plus a maskable icon. Installation metadata and an Apple touch icon SHALL be discoverable without authentication. Install availability SHALL remain browser-dependent without unsupported platform claims.

#### Scenario: Browser inspects installation metadata
- **WHEN** a browser requests the manifest and declared icons
- **THEN** it receives public valid metadata and matching images without session refresh or credentials

### Requirement: A public bounded shell remains available offline

The production application SHALL register a same-origin service worker and precache only explicitly selected versioned public static shell assets. Failed same-origin application document navigation SHALL receive an accessible offline landing page explaining availability limits and offering a retry. Navigation responses SHALL NOT be stored. Development and dedicated runtime/preview origins SHALL NOT register or serve the application worker.

#### Scenario: Offline navigation after installation
- **WHEN** the installed worker controls the application and a document navigation fails offline
- **THEN** it serves the cached public offline page without account state or a claim that lessons are downloaded

#### Scenario: Worker installation fails
- **WHEN** precaching or registration fails
- **THEN** the online application continues and reports that offline availability could not be prepared

### Requirement: Cache routing preserves authority and compartment isolation

The worker SHALL NOT cache authenticated pages, auth callbacks, tokens, API responses, mutations, Next.js data/RSC responses, learner source, progress, or external/runtime/preview requests. Auth callback and API navigation SHALL remain network-only. The cache allowlist SHALL reject unknown assets and query variants; client messages SHALL NOT add arbitrary URLs or force activation. Public shell delivery SHALL bypass session middleware without widening the runtime/preview origin allowlists. Cache updates SHALL NOT remove IndexedDB drafts or pending operations.

#### Scenario: Protected data is requested
- **WHEN** authenticated API, account page, auth callback, data response, or credential-bearing request is made
- **THEN** no such response is written to service-worker CacheStorage and no cached account response is returned offline

#### Scenario: Client asks to cache a URL
- **WHEN** a client sends arbitrary cache or activation messages
- **THEN** the worker ignores them and preserves its approved public allowlist and waiting lifecycle

### Requirement: Network and updates are truthful and non-disruptive

The frontend SHALL expose accessible online/offline state based on browser connectivity hints without claiming backend availability. A new worker SHALL wait while existing clients remain open, and the UI SHALL disclose an available update with instructions to save work, close application tabs, and reopen. No update, reconnect, or controller change SHALL automatically reload or erase editable source or pending work. Unsupported service workers SHALL leave the normal online application usable.

#### Scenario: Update arrives while editing
- **WHEN** a new service worker finishes installing with an existing application client open
- **THEN** the client shows update guidance while source and pending operations remain intact and the worker waits

#### Scenario: Connectivity changes
- **WHEN** the browser reports offline then online
- **THEN** the indicator changes without asserting successful replay or accepted progress
