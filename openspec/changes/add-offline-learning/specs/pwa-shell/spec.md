# Spec Delta

## MODIFIED Requirements

### Requirement: A public bounded shell remains available offline

The production application SHALL register a same-origin service worker and precache only explicitly selected versioned public static shell assets and one credential-free static offline-learning document. Failed same-origin application document navigation SHALL receive an accessible offline landing page that links to the offline library and explains availability limits. Authenticated, dynamic, and arbitrary navigation responses SHALL NOT be stored. Development and dedicated runtime/preview origins SHALL NOT register or serve the **application** worker; a separate runtime-origin worker MAY serve only fixed runtime resources under its own restricted scope.

#### Scenario: Offline navigation after installation
- **WHEN** the installed worker controls the application and a document navigation fails offline
- **THEN** it serves the cached public offline page with an offline-library path, without account state or a claim that a lesson is downloaded

#### Scenario: Worker installation fails
- **WHEN** precaching or registration fails
- **THEN** the online application continues and reports that offline availability could not be prepared
