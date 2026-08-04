# Family Learning Report

The Family Learning Report is a private, printable summary at `/report/`. It helps a learner and trusted adult review the progress already stored by LarriVerse Arcade on the current device.

## What it shows

- shared arcade name, avatar, level, XP, sessions, and completed sessions
- how many of the eight playable cabinets have been visited and completed
- aggregate Math, Reading, Science, Nature, and Trivia answer history from Creature Catcher and Road Trip Quest
- selected adaptive-learning paths and recent-question counts
- growing strengths when a subject has at least two answers and at least 80% accuracy
- gentle practice opportunities when a subject has at least two answers and below 75% accuracy
- all eight cabinet participation records and up to five recent cabinet timestamps
- optional conversation starters based on the local snapshot

A subject with too little history is described as needing more data. The report does not turn a single answer or a short session into a conclusion.

## Healthy interpretation

The report is not a grade, diagnosis, ranking, aptitude test, certification, or replacement for a teacher, parent, clinician, or other qualified professional. Accuracy can vary with question difficulty, attention, reading comfort, device conditions, and how much history exists.

Practice suggestions are invitations. They are not punishments, requirements, or claims about a learner's ability.

## Privacy boundary

The page is read-only and device-local. It does not:

- create an account or cloud profile
- collect age, email, school, or identity documents
- save review notes
- request location
- upload answers or analytics
- publish a leaderboard
- read unrelated browser storage

The downloadable `larriverse-family-learning-report` JSON contains only aggregate learner totals, subject statistics, learning-path summaries, cabinet participation, recent cabinet timestamps, and generated conversation starters.

It excludes raw KidsCoin chores, approvals, reward requests, parent-control material, family notes, location records, passwords, and unrelated browser data.

## Relationship to the Progress Passport

The Progress Passport is learner-facing and celebrates the arcade journey with stamps, achievements, level progress, and a suggested next mission. The Family Learning Report presents the same device-local progress in a calmer review format focused on participation, subject patterns, and conversation.

Neither page changes game progress. Save backup, restore, profile editing, accessibility settings, and progress erasure remain in the Arcade Control Center.

## Manual review

Before release, open `/report/` after playing multiple cabinets and confirm:

1. name, avatar, totals, and visited-cabinet count match the local saves
2. subject totals agree with Creature Catcher and Road Trip Quest history
3. strengths and practice opportunities respect the two-answer evidence threshold
4. recent activity is ordered by real local timestamps
5. print preview remains readable without navigation or action buttons
6. the downloaded JSON contains no raw family or location records
7. a new browser shows a friendly empty state instead of invented progress
8. larger text and high contrast remain usable on a physical phone
