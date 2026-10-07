# How to add work

Everything on the site comes from files in one folder: **`src/content/`**. You never edit code.
Adding a photo means uploading an image; adding a film means uploading one small text file.

```
src/content/
  hero/      the one big photo on the opening page
  stills/    every photo in the Stills grid (+ optional captions.txt)
  film/      one .md file per film (+ optional loop video and poster)
  about/     about.md (bio + contact links) and portrait.jpg
```

## 1. Names and order

Files are shown **in filename order**. Start each name with a number, then a dash, then a
short name in lower case:

```
010-desert.jpg
020-lisbon-portrait.jpg
030-night-swim.jpg
```

- **Count in tens** (010, 020, 030 …). To slot something in between later, use the gap:
  `015-new-photo.jpg` lands between 010 and 020. No need to rename anything else.
- The part after the number becomes the web address: `020-lisbon-portrait.jpg` →
  `/stills?photo=lisbon-portrait`, and `010-nike-spring.md` → `/film/nike-spring`. So keep it
  short, lower case, with dashes instead of spaces.
- Two files can't share the same name after the number (e.g. `010-desert.jpg` and
  `020-desert.jpg`); the site will refuse to build and tell you which ones clash.
- Files without a number are shown after all the numbered ones, alphabetically.

## 2. Adding photos (Stills)

**Export settings** (Lightroom, Capture One, Photoshop …):

| Setting | Use |
|---|---|
| Format | JPEG (PNG and WebP also work; **not** HEIC/RAW/TIFF) |
| Quality | about 90 |
| Size | about 4000 px on the long edge |
| Colour space | sRGB |
| File size | usually 3–8 MB. Over 10 MB gets a warning, over 25 MB is refused |

The site makes small, fast versions for every screen automatically. It never crops your photo
and keeps its colours. Upload the full-quality export.

**Upload on GitHub (in the browser):**

1. Open the repository on github.com and go to `src/content/stills/`.
2. Click **Add file → Upload files** and drag your images in.
3. Under "Commit changes", choose **Create a new branch … and start a pull request**, then
   click **Propose changes** and **Create pull request**.
4. Wait for the check at the bottom of the pull request. A **green tick** means everything's
   fine. A **red cross** means something needs fixing: click **Details** to read the
   message, which names the file and the problem.
5. When it's green, click **Merge pull request**.
6. Open the project in Lovable and click **Publish**. The live site only updates when you
   publish.

**Captions (optional):** edit `src/content/stills/captions.txt` (click it, then the pencil
icon). One line per photo, filename then `|` then the caption:

```
020-lisbon-portrait.jpg | Lisbon, 2025
030-night-swim.jpg | Night swim, Mallorca
```

Lines starting with `#` are notes and are ignored.

**Reordering or renaming a photo:** GitHub can't rename images in the browser. Delete the
photo (open it, click the bin icon) and upload it again with the new name.

## 3. Adding a film

1. Go to `src/content/film/` and click **Add file → Create new file**.
2. Name it like `030-nike-spring.md`.
3. Paste this and fill it in. Only the `vimeo:` line is required:

```md
---
vimeo: https://vimeo.com/123456789
client: Nike
title: Spring Campaign
year: 2025
---
A sentence or two about the film (optional).

Director: Christian Healy
DP: Jane Doe
Edit: Sam Smith
```

- **vimeo:** paste the normal Vimeo link. For an unlisted video, paste the full private link
  (e.g. `https://vimeo.com/123456789/abcdef1234`). The part after the slash is needed.
- **title:** leave it out to use the video's title from Vimeo.
- **Credits:** the `Role: Name` lines at the very end, after a blank line.
- In Vimeo, make sure the video's privacy settings **allow embedding** on this site, or the
  player will show an error.
4. Commit it as a pull request (steps 3–6 above).

**Optional extras, with exactly the same name as the `.md` file:**

- `030-nike-spring.jpg`: a poster image for the Film grid. Without one, the site uses the
  thumbnail from Vimeo, or shows the title on a plain card.
- `030-nike-spring.mp4`: a short silent loop that plays in the grid instead of the poster.
  - H.264 MP4, 1920×1080 (or 1280 wide), 5–10 seconds, **no audio**, **under 8 MB**
    (10 MB is the hard limit).
  - Export it from your master file, not from a Vimeo download.
  - In HandBrake, the "Vimeo YouTube HQ 1080p" preset works. Turn the audio track off and
    trim to 5–10 s.
  - Visitors who've asked their device to reduce motion see the poster instead.

## 4. The opening photo and the About page

- **Opening photo:** `src/content/hero/` must contain **exactly one** image. To change it,
  delete the old one and upload the new one (any name).
- **About:** edit `src/content/about/about.md`:

```md
---
email: hello@yourdomain.com
instagram: https://instagram.com/yourname
vimeo: https://vimeo.com/yourname
---
Your bio here. Blank lines start new paragraphs. **Bold** works too.
```

  The email and Instagram also appear in the footer of every page. Replace
  `src/content/about/portrait.jpg` to change the portrait.

## 5. Limits at a glance

| What | Limit |
|---|---|
| Image types | `.jpg` `.jpeg` `.png` `.webp` |
| Image size | warning over 10 MB, refused over 25 MB |
| Loop video | `.mp4`, warning over 8 MB, refused over 10 MB |
| Opening photo | exactly one |
| Film file | must have a `vimeo:` link |
| Loop / poster | must match an existing film's `.md` name |
| Names | must be unique after the number |

If anything breaks a rule, the site won't build and the red-cross message tells you which
file and why. Nothing broken ever reaches the live site.
