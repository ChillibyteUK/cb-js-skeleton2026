# cb-js-skeleton2026

Standalone base WordPress theme. Check it out, rename it, build on it — this
is a one-time-checkout base, not a live dependency: fixes made here aren't
intended to sync back into projects already forked from it.

Forked from `cb-skeleton2026`, sharing its entire CSS/JS/build system —
the only difference is blocks and site settings use native block.json/edit.js
blocks and a plain Settings API page instead of ACF. See that skeleton's own
docs if a project specifically needs ACF; see this file's "Adding a block"
section below for how blocks work here.

Companion tooling: the **CBP Block Builder** plugin
(`ChillibyteUK/cbp-block-builder`) is a wp-admin GUI for scaffolding blocks
in this theme — see "CBP Block Builder (companion plugin)" below.
`CLAUDE.md` holds the deeper architecture notes and the reasoning behind them.

## Starting a new project

```
git clone git@github.com:ChillibyteUK/cb-js-skeleton2026.git my-new-project
cd my-new-project
./setup.sh
```

`setup.sh` asks, in order:

1. **Theme name** (e.g. `LC New Client 2026`) and **slug** (suggested from the
   name — press enter to accept, or type your own; names and slugs often
   want to diverge).
2. **Local dev URL** for browser-sync (default `{slug}.local`) — written into
   `src/build/browser-sync.config.js`.
3. **Header style**, `flat` (logo + primary nav in one row) or `stacked` (two
   rows). The matching `templates/header-*.php` partial is written into the
   marked section of `header.php`; no CSS is generated for either, that's
   still per-project work.
4. **Optional modules** — y/N for each folder in `modules/` (see "Optional
   modules" below).

It then renames every `cb-js-skeleton2026` / `CB JS Skeleton 2026` /
`cb_js_skeleton_` / `CB_JS_Skeleton_` reference across the whole repo (and
the nav-walker filename, and the checkout folder itself) to match, installs
the chosen modules, deletes `templates/` and `modules/`, and resets git to a
single fresh commit (no skeleton commit history, no GitHub repo created —
that part's manual: `gh repo create ChillibyteUK/{slug} --public --source=.
--push` when you're ready). Refuses to run on a dirty tree or an
already-renamed project. Then `pnpm install` and you're building.

## This is Bootstrap-*named*, not Bootstrap

Class names (`container`, `row`, `col-6`, `btn`, `navbar`, `d-flex`, etc.)
follow Bootstrap's conventions for familiarity — but every one of them is
implemented in this theme's own lightweight CSS. There is no Bootstrap
dependency, no Sass, no jQuery, no Popper. (Front end only — the
Site-Wide Settings admin page uses WordPress's own bundled jQuery.) Don't assume parity with actual
Bootstrap docs/behaviour, especially for anything not covered below.

## What's in, what's not

- **Layout**: CSS Grid, not flexbox, for `.row`/`.col-*` (`.navbar` itself is
  flexbox — a single-row toolbar is a legitimate flex case). Nested `.row`
  uses `subgrid` where supported, as progressive enhancement only. `.col-*`
  spans are only meaningful relative to their own `.row`'s column count
  (12 by default) — you can't mix a 12-col span and a 5-col span in the same
  `.row`. For "N similar items, however many fit" layouts (card grids,
  feature lists) use `.grid` instead — `repeat(auto-fit, minmax(...))`,
  no fixed column count, no breakpoint classes, tune the minimum item width
  per instance with `style="--grid-min: 10rem"`.
- **Nav**: functional responsive nav + mobile toggle, vanilla JS
  (`src/js/nav-toggle.js`), no Bootstrap JS.
- **Modals**: native `<dialog>` (`src/js/dialog.js`), not a JS component.
- **Forms**: minimal, deliberately unopinionated base — expect to override it.
  Includes Gravity Forms basics (consent field layout; `.gform_button`).
- **Buttons/cards**: a bare `.btn` only, shared with Gravity Forms' submit
  button and core Buttons blocks (`.wp-block-button__link`) — no further
  framework opinion, bring your own per project. Core `core/buttons` is
  wrapped in `.container` like other plain core blocks.
- **Tables**: real but optional (`src/css/tables.css`) — uncomment the
  `@import` in `src/css/theme.css` if a project needs one.
- **Icons**: inline SVG, no icon font.
- **No sidebars, no comments, no tags, no author archives, no `archive.php`,
  no `search.php`** — all confirmed rare-to-never in real usage; add them
  per-project if a project genuinely needs one.
- **WooCommerce**: not here at all. Ecommerce projects use the Understrap
  parent/child setup separately — this skeleton is for everything else.

## Built-in features

Standing behaviour every project gets, no setup needed:

- **Site-Wide Settings** (`inc/options.php`) — a plain Settings API page
  (wp-admin → Site-Wide Settings, one tab per section), storing one array
  option. Read with `cb_js_skeleton_get_setting( 'key' )`. Field types:
  text/email/url, textarea, `code`, checkbox, `richtext`, `gallery`
  (drag-reorderable; `cb_js_skeleton_get_gallery_setting()` returns IDs) and
  `repeater` (text, image and file sub-fields;
  `cb_js_skeleton_get_repeater_setting()`). The `example_gallery` /
  `example_repeater` fields are demos — rename or replace them.
- **Head output** (`inc/head-tags.php`) — preloads every `fonts/*.woff2`,
  GA/GTM for logged-out visitors only, Google/Bing verification tags, and
  custom head/body scripts from the settings page.
- **Shortcodes** — `[contact_phone]` / `[contact_email]` (from the settings
  page, with `class` and `text` attributes), `[social_icons]` (blank URLs
  hide their icon), `[cb_toc]` (table of contents from the post's h2s, ids
  injected automatically), `[Footnote]` tags with a `[cbp_footnotes]` list,
  and `[block_usage_table]` (QA: which pages use which blocks — check it
  before `rm_block.sh`). TOC, footnote and core quote styles are in
  `src/css/`.
- **Hardening** (`inc/security.php`) — comments, tags, gravatars and emojis
  off, security headers, XML-RPC lockdown, generic login errors, author/REST
  user-enumeration blocks, `DISALLOW_FILE_EDIT`. There is no options UI;
  edit the file to change it.
- **Block editor** (`inc/editor.php`, `inc/blocks.php`) — a "Lede" text
  format, a curated core block list, plain core text blocks wrapped in
  `.container`, and shared editor chrome (`blocks/_shared/EditorBlockShell.js`).
- **Stubs** — `inc/posttypes.php` and `inc/taxonomies.php` register nothing
  until you duplicate their commented examples. `inc/enqueue.php` has a
  commented Typekit stub and an `enqueue_vendor()` helper for libraries
  vendored into `js/vendor/` (served locally, never from a CDN).
- **Accessibility** — a real `.skip-link` (visible on focus) in `header.php`.

## Design tokens

`src/css/tokens.css` — CSS custom properties (`--col-*`, `--fs-*`, `--space-*`,
etc.), no Sass variables. `src/build/generate-theme-json.js` reads this file
to produce `theme.json` so colors/font sizes show up in the block editor.

Breakpoints are the one exception — they live in `src/build/tokens.config.js`,
not `tokens.css`, because a CSS custom property can't be read inside an
`@media` condition. `src/css/nav.css` hand-duplicates the `lg` breakpoint in
a literal `@media` query for the same reason — keep it in sync with that
file if a breakpoint ever changes.

## Browser support

Modern evergreen only (last 2 versions of Chrome/Firefox/Safari/Edge, see
`.browserslistrc`). No IE11, no legacy fallback layer. Grid, subgrid
(progressive enhancement), `clamp()`, native `<dialog>`, `:has()`, and CSS
nesting are all used without hesitation.

## Build

```
pnpm install
npm run watch        # rebuilds theme-wide CSS/JS on save
npm run watch-bs     # same, plus browser-sync live reload (proxies the local URL
                     # you gave setup.sh; edit src/build/browser-sync.config.js to change it)
npm run blocks:build # compiles every block's src/index.js
npm run blocks:start # watch mode for block JS
npm run dist         # one-off full build: css + js + blocks
npm run generate-theme-json   # regenerate theme.json from tokens.css
```

`npm run css` runs three steps: `generate-utilities.js` (produces
`src/css/utilities.css` — the breakpoint-suffixed grid/utility classes — and
`src/css/blocks.css`, a concatenation of `src/blocks/*.css`), then
PostCSS (`postcss-import` + `postcss-nesting` + `autoprefixer`), then
minification. This is entirely separate from block JS — `blocks:build` is
its own step, run by `@wordpress/scripts` against `webpack.config.js`, which
compiles each `blocks/{slug}/src/index.js` to `blocks/{slug}/build/index.js`.

## Adding a block

```
./add_block.sh
```

Prompts for a block name, then for each field: its name and type (text,
textarea, richtext, image, url, link, number, select, checkbox). Generates
`block.json` (attributes), `src/index.js` + `src/edit.js` (the editing UI,
using WordPress's own field components — no ACF, no `get_field()`), and
`render.php` (front-end template, reading straight from `$attributes`).
No registration step — `inc/blocks.php` auto-loads every `blocks/*/block.json`
it finds. Run `npm run blocks:build` after scaffolding, or the block won't
render correctly until `build/index.js` exists.

Not yet supported by `add_block.sh` directly: repeater, gallery, radio,
relationship, post_object, file. Repeater and single-post fields have a
documented drop-in pattern instead — `blocks/_shared/RepeaterField.js` and
`blocks/_shared/PostTypePicker.js` (see the `blocks/_shared/` entry under
`CLAUDE.md`'s "File layout" for how to wire one into a generated `edit.js`
by hand). Relationship (a whole grid of posts via `WP_Query`) still has no
drop-in — build it by hand. The CBP Block Builder plugin (next section)
generates repeater, gallery, file, radio and post-type fields for you.

If the block needs custom styles, add `src/blocks/{block-slug}.css`; it's
picked up automatically on the next `npm run css`, no registration step.
Load order for these is alphabetical by filename, not registration order.

`rm_block.sh` removes a block: the whole `blocks/{slug}` directory plus its
`src/blocks/{slug}.css` if present. Again, no registration to undo.

## CBP Block Builder (companion plugin)

`ChillibyteUK/cbp-block-builder` is a separate WordPress plugin: a visual
replacement for `add_block.sh`. Design a block's title and fields in wp-admin
(**Block Builder** menu), click **Create Block**, and it writes
`blocks/{slug}/` (`block.json`, `src/index.js`, `src/edit.js`, `render.php`)
into the active theme — then run `npm run blocks:build`. It goes further than
the CLI:

- Extra field types — gallery, file, radio, repeater (text / number /
  textarea / image / file / link / radio sub-fields) and a single-post picker.
- ACF-style conditional logic between fields (editor canvas only).
- Reopen a block it created (**Edit fields** on the **Blocks** tab) and change
  its fields; `src/edit.js` is regenerated (hand edits there are lost) and
  `render.php` is never touched.

Things to know:

- **Local only** — it does nothing unless `wp_get_environment_type()` is
  `local` or the hostname ends in `.local`, so it's safe to leave installed.
- It only writes new `blocks/{slug}/` directories (it never edits other theme
  files or touches git) and doesn't run npm for you.
- **It relies on this theme's shape**: auto-registration via
  `blocks/*/block.json`, an `.{prefix}-editor-block` rule in
  `src/css/editor.css` (how it finds the editor class prefix — `setup.sh`'s
  rename keeps that consistent), and `blocks/_shared/EditorBlockShell.js`,
  `RepeaterField.js` (with its `radio` branch) and `PostTypePicker.js`, which
  generated blocks import. Don't delete those from a project that uses it.
- Files are written group-writable, so your CLI user needs to share a group
  with the web server user (e.g. `usermod -aG www-data you`) to run
  `blocks:build` afterwards.
- Not supported there either: `relationship` fields and a user-picker.

See the plugin's own README for the full field-type table.

## Optional modules

`modules/` holds opt-in features, each a folder with a `module.conf` and a
`files/` overlay that mirrors the theme root. `setup.sh` lists them, asks y/N
for each, copies the chosen ones' files in, wires them up, then deletes
`modules/` — a project only carries what it uses. Modules are a setup-time
choice: once `setup.sh` has run, `modules/` is gone, and a module wanted later
has to be copied in from the skeleton by hand (follow its `module.conf`).

| Module | Adds |
| --- | --- |
| `popover` | Inline span `[popovertarget]` popovers (JS) |
| `video-facade` | Click-to-play `[data-video-facade]` thumbnails (JS) |
| `share` | `[data-share]` Web Share / copy-link button (JS) |
| `smooth-scroll` | Lenis + GSAP/ScrollTrigger (vendored) with `inc/smooth-scroll.php` |
| `fixed-header` | Fixed `#masthead` with static `--nav-height` offset (CSS; the TOC, footnote and anchor scroll margins already read `--nav-height`) |
| `btn-video` | `.btn-video` play-icon button extender (CSS) |
| `helpers` | `inc/helpers.php` (required from `functions.php`) — a home for project-specific PHP functions, as opposed to the project-agnostic `inc/utilities.php`. Seeded with `content_excerpt()`, an excerpt built from the post content that ignores the manual excerpt field. Skip it if the project needs no custom functions; create the file later by hand if that changes |

`module.conf` keys (each may repeat): `description=`, `js_import=fn|./file[|first]`
(import + call in `src/js/theme.js`), `css_import=file.css` (appended to
`src/css/theme.css`), `php_require=inc/file.php` (appended in `functions.php`).
To add a module, create `modules/<name>/` with those pieces; no other
registration is needed.
