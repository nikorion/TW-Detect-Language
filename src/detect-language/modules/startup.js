/*\
title: $:/plugins/nikorion/detect-language/modules/startup.js
type: application/javascript
module-type: startup

Browser-language auto-detection, run once at boot — in every nikorion dev
wiki and in their built demo sites alike. Adapted from Modern.TiddlyDev's
startup actions, generalised: instead of hardcoding one language, it picks
among the language plugins actually installed in the current wiki.

This has to run as a JS `startup` module ordered *before* core's own
`startup` module (`core/modules/startup.js`, which constructs
`$tw.languageSwitcher`), not as a `$:/tags/StartupAction/Browser` wikitext
action. Core's `startup` module runs `$:/tags/StartupAction/Browser`
actions and then immediately calls `$tw.wiki.clearTiddlerEventQueue()` "to
avoid an unnecessary refresh cycle at startup" — which silently discards
the pending change event for `$:/language` before `$tw.languageSwitcher`'s
own change listener ever sees it. A wikitext action can therefore set
`$:/language` correctly, and our own `detect-language-lingo` picks it up
fine (it reads the tiddler's live value directly), but the *core* UI
strings stay in the plugin-switcher's original (English) choice for the
rest of the session, because `$tw.languageSwitcher` never re-runs its
`switchPlugins()`. Running before core's `startup` avoids the race
entirely: `$:/language` is already correct by the time `$tw.languageSwitcher`
is constructed and makes its one and only `switchPlugins()` call.

Resolution order for navigator.language:
1. exact BCP-47 tag match against installed language plugins (fr-FR → fr-FR);
2. primary-subtag match (fr-CA → fr-FR);
3. fallback en-GB (TiddlyWiki's built-in default, always available).

Each consuming wiki's $:/config/SyncFilter excludes $:/language, so the
value set here stays in memory only — nothing is persisted to disk.
\*/

"use strict";

exports.name = "nikorion-detect-language";
exports.platforms = ["browser"];
exports.after = ["load-modules"];
exports.before = ["startup"];
exports.synchronous = true;

exports.startup = function() {
	var browserLanguage = (typeof navigator !== "undefined" && navigator.language) || "en-GB";
	var primary = browserLanguage.split("-")[0].toLowerCase();
	var languageTitles = $tw.wiki.filterTiddlers("[plugin-type[language]]");
	var exactMatch, primaryMatch;
	$tw.utils.each(languageTitles,function(title) {
		var code = title.replace(/^\$:\/languages\//,"");
		if(!exactMatch && code.toLowerCase() === browserLanguage.toLowerCase()) {
			exactMatch = title;
		}
		if(!primaryMatch && code.split("-")[0].toLowerCase() === primary) {
			primaryMatch = title;
		}
	});
	$tw.wiki.setText("$:/language","text",undefined,exactMatch || primaryMatch || "$:/languages/en-GB");
};
