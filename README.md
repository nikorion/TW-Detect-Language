# tw-detect-language

**English** · [Français](README.fr.md)

Source of the [TiddlyWiki](https://tiddlywiki.com) plugin `$:/plugins/nikorion/detect-language`: internal tooling shared by every nikorion dev and demo wiki, not a feature plugin for end users. It sets the wiki's language from the browser's, and gives a wiki a way to translate its own demo content without shipping those strings inside the plugin it demonstrates.

This README is for whoever wants to change the plugin. How to load it in a wiki and translate that wiki's content is the plugin's own readme (`src/detect-language/language/<lang>/readme.tid`).

## Getting started

This repository is deliberately minimal: no dev wiki, no `package.json`, no build. The plugin only makes sense loaded by another wiki, so it is developed through the wikis that use it (any `TW-*` repository, or `../PKM`).

1. Symlink `src/detect-language` as `$TIDDLYWIKI_PLUGIN_PATH/nikorion/detect-language`. This is the only thing that makes TiddlyWiki resolve the `"nikorion/detect-language"` entry of a `tiddlywiki.info`: a `"pluginPath"` key there is not read by the plugin loader.
2. Run `pnpm dev` in a wiki that lists the plugin. Its hot reload (`../tw-dev`) watches the sources of every plugin the wiki lists, this one included: an edit is pushed live, a change to `startup.js` or `plugin.info` restarts that wiki's server.

## Source layout

| Path (under `src/detect-language/`) | Role |
|---|---|
| `plugin.info` | plugin metadata |
| `modules/startup.js` | detection: sets `$:/language` at boot |
| `lingo.tid` | the `detect-language-lingo` procedure and `detect-language-lingo-text` function (tag `$:/tags/Global`) |
| `readme.tid`, `history.tid`, `licence.tid` | plugin info tabs: each shows the version from `language/<lang>/` matching the wiki's language (fallback `en-GB`) |
| `language/<lang>/` | the readme, history and licence texts, one folder per language |

## How it works

- **Detection runs before the core `startup` module.** `modules/startup.js` (`"before": ["startup"]`, `"after": ["load-modules"]`, browser only) picks the best match for `navigator.language` among the language plugins installed in the wiki: exact tag, then primary subtag (`fr-CA` → `fr-FR`), then `en-GB`. It must not become a `$:/tags/StartupAction/Browser` action: the core builds `$tw.languageSwitcher` reading `$:/language` once, then clears the event queue after the startup actions, so a later change is lost and the core UI stays in English. The module's header comment details this race.
- **Nothing is stored.** Each consuming wiki's `$:/config/SyncFilter` excludes `$:/language`, so the detected value lives in memory only.
- **Content strings belong to the consuming wiki.** `detect-language-lingo "<Domain>/<Key>"` resolves `$:/nikorion/language/<lang>/<Domain>/<Key>` for the current language, falling back to `en-GB`; the strings themselves live in that wiki's `wiki/tiddlers/language/<lang>/*.multids`, never here.
- **Kept in published demos.** No `publishFilter` excludes the plugin, so a built demo detects its visitor's language too.

## License

MIT — see `LICENSE`.
