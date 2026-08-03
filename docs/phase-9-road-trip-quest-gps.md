# Phase 9 — Road Trip Quest GPS

Road Trip Quest GPS is the eighth playable cabinet and completes the first recovered browser-concept batch.

## Source basis

The recovered `road-trip-quest-gps.html` prototype defines:

- 15 place categories
- 41 hero, outfit, and item collectibles
- 28 questions across math, science, reading, and trivia
- 11 XP level thresholds and unlock messages
- proximity-based encounters
- a collection drawer
- live geolocation, external map tiles, and nearby-place lookup

The LarriVerse release preserves the collection game, source vocabulary, question bank, progression, and proximity mechanic. It deliberately replaces the source's automatic GPS request, Leaflet map, third-party tiles, and Overpass nearby-place query.

## Privacy-first movement

The cabinet starts in **Demo Mode**. Arrow keys, WASD, and touch controls move the player across a locally generated abstract quest field.

**Live Movement** begins only after a clear button press. Browser coordinates are used in memory to move the player relative to the starting point. Coordinates are never:

- written to localStorage
- passed to Arcade SDK metrics
- sent to an external map or place service
- used for background tracking
- retained after Stop Location, page exit, or a hidden tab

No real business names or emergency-service locations are shown.

## Safety boundary

This is a collection game, not navigation. It must not be operated by a driver. Hospital, pharmacy, police, and fire-station markers are game categories and do not provide directions or emergency information.
