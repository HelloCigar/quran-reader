# Recitation plays one audio file per Surah

A Recitation plays from a chosen Ayah to the end of the Surah, and the popover follows the Recited Word. Quran Foundation offers the Reciter's audio two ways: one file per Ayah with Word timings, or one file per Surah with each Ayah's start and end time and every Word's timings measured within that file. We play the one file per Surah. Moving from Ayah to Ayah is then just time passing in one file, with no gap while the next file loads, and "Play from this Ayah" jumps to that Ayah's start time. All the syncing between audio and Words works on time within the Surah's file.

## Considered Options

- **One file per Ayah**: easier to reason about (each Ayah stands alone), but there's an audible gap at every Ayah change, which breaks continuous listening.

## Consequences

- The Reciter's Surah files start at the first Word of Ayah 1, so the Bismillah shown above a Surah is not recited.
- Word timings are matched to Word Locations by Quran Foundation's word position (`[position, start ms, end ms]`, counting from 1), which is the same number our Word Location uses.
- An Ayah's first Word can begin slightly before the Ayah's own start time (e.g. 110:2 starts at 6920 ms, its first Word at 6795 ms), so "Play from this Ayah" starts at whichever is earlier.
- Changing to per-Ayah files later would mean rewriting the syncing, not just swapping the audio source.
