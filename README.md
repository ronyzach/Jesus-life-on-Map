# In His Footsteps

A phone-first map of 29 events in the life of Jesus. Google Maps only. No build step, no backend.

## Files
| File | Purpose |
|---|---|
| `index.html`, `styles.css` | The page and its layout (designed for a 375 px phone) |
| `app.js` | Map, camera, play, menu, city search, share link |
| `data.js` | 29 events, 16 places, NIV/KJV passage references |
| `geo.js` | Distance, bearing, projection and zoom maths |
| `config.js` | **The only file you edit: your Google Maps key** |
| `tests/test.js` | `node tests/test.js` runs 22 checks |

## Screen layout
The map fills the left side. The right side is a ladder of all 29 events (current one highlighted, earlier ones muted; tap any to jump) with the **previous / play / next** buttons at the bottom right. A bubble above the centred pin shows the event name, life stage, place and distance from the previous event. On the last event the next button becomes **&#9678;** and opens the heat map. Width of the ladder: `--rail-w` in `styles.css`.

## Overview: heat map and travel area
Three ways in: the journey ends there by itself when **Play** finishes; on the last event **Next** becomes **Overview ›**; or use Menu > **Heat map & travel area** (a ranked list of hotspots, tap one to see it on the map, plus **Show on map**). The map zooms out to show:
- **Heat map:** warm blobs where the events cluster (places within 7 km count as one). The numbered dots are event counts. It is drawn with map circles, not Google's heat-map layer, which Google has deprecated.
- **Travel area:** a dashed boundary 6 km around every place the journey visits, with its size (about 7,100 km²).

Events whose passage names no place are pinned at the best-known traditional site and labelled that way (Mount of Temptation, Mount of Beatitudes, Mount Tabor, Emmaus (site uncertain), Galilee hills), each with a note in `data.js` saying what the text does and does not say. Escape to Egypt is pinned at Old Cairo (Coptic tradition; Matthew names no town) but kept out of the heat map and the fence (`offmap` in `data.js`), so they describe the Holy Land.

It follows the selected city, so the same shape and distances appear around your home. Press **Back** (or Next, Previous, Play) to return to the journey. Tuning: `CLUSTER_KM` and `FENCE_KM` in `app.js`.

## Narration
While **Play** runs, a short natural-voice line is spoken for each event, and Play waits for the line to finish before moving on, so the map and the voice stay in step. The speaker button (top, beside the menu) mutes it; the choice is remembered. Tapping Next, Previous or an event on the ladder stays silent.
- The lines live in `data.js` (`say`, 10 to 35 words each). They are written as one connected account of what happened ("Weeks later", "That same night", "Three days later"), ending with the ascension and the angels' words in Acts 1:11.
- **Background music** is a gentle, hopeful score made in the browser (no music file, nothing to license): a warm pad under a soft repeating harp-like arpeggio in a major key, moving through four chords (C, G, A minor, F) at a light 80 beats a minute. It plays all through Play at about 14 dB below the voice, comes home to C major on the last event and swells once the last line is spoken. Menu > Sound turns it off; the speaker button mutes everything. It is simple by design; to use a composed track instead, replace `musicStart` in `app.js` with a looped `<audio>`.
- When the journey ends, a spoken line (`OUTRO` in `data.js`, `audio/31.mp3`: "Now, change to your favourite location.") plays while an arrow points at the place button.
 The recordings are `audio/01.mp3` to `audio/30.mp3` (about 0.7 MB in all).
- To change a line or the voice: edit `say` (or `VOICE` in `tools/make_audio.py`), then run `python -m pip install edge-tts` and `python tools/make_audio.py`. It uses Microsoft's free neural voices and needs the internet only while making the files, never when visitors use the app.

## 1. Google Cloud (once)
1. Use one Google Cloud project and turn on **billing** (Maps needs it; the free monthly credit normally covers a small app).
2. Enable **Maps JavaScript API**. Also enable **Geocoding API** so visitors can type any city. Without it the city box answers "City search is not enabled", and the city buttons still work.
3. Create an API key.

## 2. Put the key in the app
- **For publishing:** open `config.js` and paste the key between the quotes. Visitors never see a key prompt.
- **For local testing:** put it in `config.local.js` instead. That file is git-ignored, so it never reaches GitHub. Run `start_local.bat` to serve the folder on `http://localhost:8080`.
- Do not commit a real key to a public repository.

## 3. Publish (needed for a WhatsApp link)
The page must be on an https address. Easiest options:
- **Netlify:** open app.netlify.com/drop and drag this whole `app` folder onto it. You get a link like `https://something.netlify.app`.
- **GitHub Pages:** push this folder to a repository and enable Pages.

## 4. Lock the key to your site
A Maps key is visible in the page source, so restrict it. Google Cloud > Credentials > your key:
- **Application restrictions:** Websites. Add `https://your-site.netlify.app/*` (your real address).
- **API restrictions:** Restrict key. Tick **Maps JavaScript API** and **Geocoding API**.
- Changes can take up to about 5 minutes.

## Protecting the key (read this)
A key used by a web page **cannot be encrypted or hidden**: the visitor's browser must send it to Google, so anyone can see it in the browser's network tab, whatever the code does. Hiding it in the code would only look secure. What actually protects you is Google's own limits on the key:
1. **Website restriction** (Credentials > your key > Application restrictions > Websites): only your real address, e.g. `https://your-site.netlify.app/*`. A copy of the key then fails on anyone else's website. Remove `localhost` entries once you have published.
2. **API restriction:** only Maps JavaScript API and Geocoding API, so a stolen key cannot be used for other Google services.
3. **Quota cap:** APIs & Services > Maps JavaScript API > Quotas, set a low daily limit, and add a **budget alert** under Billing so misuse cannot run up a bill.
4. **Use a fresh key for the public site.** A key that has been pasted into a chat or email should be treated as exposed: create a new one, restrict it as above, put it in `config.js`, and delete the old one.

## 5. Share
In the app: menu > **Share on WhatsApp**. The link carries the current event and city (`?e=12&city=Kochi`) and opens the map straight there.

## Testing locally
Opening `index.html` from disk works for the layout, but a website-restricted key is refused on `file://`. Serve the folder instead (`python -m http.server 8080` inside `app`) and add `http://localhost:8080/*` to the key's allowed websites while testing.

## If the map does not load
A red bar says why: missing key, invalid key, billing off, API not enabled, or site address not allowed.
