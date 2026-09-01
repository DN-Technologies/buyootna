# Mobile App Versioning Rules

## Purpose

This document defines the versioning strategy for the mobile application.

The AI/Developer MUST use this document to determine the next application version after every completed change.

The application follows **Semantic Versioning (SemVer)**:

```text
MAJOR.MINOR.PATCH
```

Example:

```text
1.4.2
```

---

# 1. Version Components

## MAJOR

Increment `MAJOR` when the change introduces a **breaking change** that may require existing users, clients, integrations, or stored data to adapt.

Example:

```text
1.4.2 → 2.0.0
```

### MAJOR changes include:

* Breaking API changes
* Removing existing functionality
* Changing authentication in a way that invalidates existing sessions/users
* Changing required data structures in a non-backward-compatible way
* Removing or renaming public API fields
* Changing behavior that existing clients depend on
* Major architectural changes that require users to update immediately
* Any change explicitly classified as a breaking change

### Example

Before:

```json
{
  "userId": 123
}
```

After:

```json
{
  "id": 123
}
```

If existing clients depend on `userId`, this is a breaking change.

Version:

```text
1.5.0 → 2.0.0
```

---

# 2. MINOR

Increment `MINOR` when adding **new functionality** while maintaining backward compatibility.

Example:

```text
1.4.2 → 1.5.0
```

### MINOR changes include:

* New features
* New screens
* New user flows
* New optional API fields
* New optional API endpoints
* New authentication providers
* New settings
* New notifications
* New payment methods
* New search/filter functionality
* New profile functionality
* New dashboard functionality
* New integrations
* Significant UX improvements that introduce new functionality

### Example

Adding:

```text
Login with Google
```

Version:

```text
1.4.2 → 1.5.0
```

Adding:

```text
Dark Mode
```

Version:

```text
1.5.0 → 1.6.0
```

---

# 3. PATCH

Increment `PATCH` for bug fixes, small improvements, and changes that do not introduce new functionality or break existing functionality.

Example:

```text
1.4.2 → 1.4.3
```

### PATCH changes include:

* Bug fixes
* Crash fixes
* UI bugs
* Performance improvements
* Memory optimizations
* Minor UI adjustments
* Small styling fixes
* Validation fixes
* Error message improvements
* Security fixes that do not introduce breaking changes
* Dependency updates that do not change application behavior
* Refactoring with no functional change
* Code cleanup
* Small accessibility fixes

### Example

Fix:

```text
Login button crashes the application.
```

Version:

```text
1.4.2 → 1.4.3
```

---

# 4. Priority Rules

When a change contains multiple types of changes, use the highest applicable version level.

Priority:

```text
MAJOR > MINOR > PATCH
```

### Example

A release contains:

* Bug fix
* New feature
* Breaking API change

Result:

```text
MAJOR
```

If the current version is:

```text
1.4.2
```

The new version is:

```text
2.0.0
```

---

# 5. Multiple Changes in One Release

If multiple changes are made before creating a release, analyze ALL changes together.

Example:

```text
Current Version: 1.3.4

Changes:
- Fix login crash
- Add push notifications
- Improve loading performance
```

The highest change is:

```text
MINOR
```

Therefore:

```text
1.3.4 → 1.4.0
```

---

# 6. Version Reset Rules

When increasing `MAJOR`:

```text
1.8.7 → 2.0.0
```

When increasing `MINOR`:

```text
1.8.7 → 1.9.0
```

When increasing `PATCH`:

```text
1.8.7 → 1.8.8
```

Never produce:

```text
1.8.8 → 1.9.8
```

or:

```text
1.8.8 → 1.8.9.1
```

The version must always follow:

```text
X.Y.Z
```

---

# 7. Mobile Build Number

The public application version and internal build number are separate.

### Public version

```text
1.5.0
```

### Build number

```text
42
```

Every new mobile build submitted to the App Store or Google Play MUST have an incremented build number.

Example:

```text
Version: 1.5.0
Build:   42
```

Next build:

```text
Version: 1.5.0
Build:   43
```

Bug fix:

```text
Version: 1.5.1
Build:   44
```

New feature:

```text
Version: 1.6.0
Build:   45
```

The build number MUST always increase, even when the semantic version does not change.

---

# 8. AI Responsibilities

Before making or finalizing any change, the AI MUST:

1. Read this `VERSIONING.md`.
2. Identify the current application version.
3. Analyze all changes made in the current task.
4. Classify each change as:

   * MAJOR
   * MINOR
   * PATCH
5. Select the highest required version level.
6. Calculate the next version.
7. Update the application's version if the task requires a release.
8. Update the build number when creating a new mobile build.
9. Report the version decision to the developer.

---

# 9. AI Decision Table

| Change Type                                 | Version |
| ------------------------------------------- | ------- |
| Breaking change                             | MAJOR   |
| New feature                                 | MINOR   |
| New screen with new functionality           | MINOR   |
| New API functionality                       | MINOR   |
| New authentication provider                 | MINOR   |
| New integration                             | MINOR   |
| Bug fix                                     | PATCH   |
| Crash fix                                   | PATCH   |
| UI bug fix                                  | PATCH   |
| Performance optimization                    | PATCH   |
| Refactoring                                 | PATCH   |
| Code cleanup                                | PATCH   |
| Security fix without breaking changes       | PATCH   |
| Dependency update without functional impact | PATCH   |

---

# 10. Important Rule: Do Not Guess

The AI MUST NOT increase the version simply because a large amount of code was changed.

Versioning is based on **user-facing/API behavior**, not the number of files or lines changed.

For example:

Changing:

```text
20 files
5000 lines
```

does NOT automatically mean MAJOR or MINOR.

If the changes are only internal refactoring:

```text
PATCH
```

---

# 11. Version Decision Format

After completing a change, the AI MUST report:

```text
Current Version: X.Y.Z

Changes:
- Change 1
- Change 2
- Change 3

Classification:
- Change 1 → PATCH
- Change 2 → MINOR
- Change 3 → PATCH

Highest Required Level:
MINOR

New Version:
X.Y.Z

Reason:
Short explanation of why this version was selected.
```

Example:

```text
Current Version: 1.4.2

Changes:
- Fixed login crash
- Added Google Sign-In
- Improved loading performance

Classification:
- Login crash → PATCH
- Google Sign-In → MINOR
- Loading performance → PATCH

Highest Required Level:
MINOR

New Version:
1.5.0

Reason:
A new backward-compatible authentication feature was added.
```

---

# 12. Release Changelog

For every release, maintain a changelog.

Recommended format:

```text
## 1.5.0

### Added
- Google Sign-In

### Fixed
- Login crash

### Improved
- Login loading performance
```

---

# 13. Git Tags

Every production release SHOULD have a Git tag:

```text
v1.0.0
v1.0.1
v1.1.0
v2.0.0
```

Example:

```bash
git tag v1.5.0
git push origin v1.5.0
```

---

# 14. Release Examples

### Example 1 — Bug Fix

Current:

```text
1.2.3
```

Change:

```text
Fix incorrect password validation.
```

New:

```text
1.2.4
```

---

### Example 2 — New Feature

Current:

```text
1.2.4
```

Change:

```text
Add biometric login.
```

New:

```text
1.3.0
```

---

### Example 3 — Breaking Change

Current:

```text
1.3.0
```

Change:

```text
Replace authentication API and invalidate the old client contract.
```

New:

```text
2.0.0
```

---

# 15. Final Rule

When uncertain between two version levels, the AI MUST choose the **higher level only when there is evidence that the higher-level rule applies**.

Do not use MAJOR for normal refactoring.

Do not use MINOR for ordinary bug fixes.

Do not use PATCH for genuinely new functionality.

The goal is to keep versions predictable, meaningful, and consistent.

---

# Versioning Formula

```text
Breaking Change
      ↓
   MAJOR + 1
MINOR = 0
PATCH = 0

New Feature
      ↓
   MINOR + 1
PATCH = 0

Bug Fix / Improvement
      ↓
   PATCH + 1
```

Final format:

```text
MAJOR.MINOR.PATCH
```
