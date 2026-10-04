# TW-Detect-Language

[English](README.md) · **Français**

Sources du plugin [TiddlyWiki](https://tiddlywiki.com) `$:/plugins/nikorion/detect-language` : un outillage interne partagé par tous les wikis de dev et de démo nikorion, pas un plugin fonctionnel destiné aux utilisateurs. Il règle la langue du wiki sur celle du navigateur, et offre à un wiki un moyen de traduire son propre contenu de démo sans embarquer ces chaînes dans le plugin qu'il présente.

Ce README s'adresse à qui veut modifier le plugin. Comment le charger dans un wiki et traduire le contenu de ce wiki relève du readme du plugin lui-même (`src/detect-language/language/<lang>/readme.tid`).

## Prise en main

Ce dépôt est volontairement minimal : pas de wiki de dev, pas de `package.json`, pas de build. Le plugin n'a de sens que chargé par un autre wiki ; il se développe donc à travers les wikis qui l'utilisent (n'importe quel dépôt `TW-*`, ou `../PKM`).

1. Créer un lien symbolique de `src/detect-language` vers `$TIDDLYWIKI_PLUGIN_PATH/nikorion/detect-language`. C'est la seule chose qui permet à TiddlyWiki de résoudre l'entrée `"nikorion/detect-language"` d'un `tiddlywiki.info` : une clé `"pluginPath"` y est ignorée par le chargeur de plugins.
2. Lancer `pnpm dev` dans un wiki qui liste le plugin. Son rechargement à chaud ne surveille que ses propres sources : après une modification de ce plugin, redémarrer le serveur de dev de ce wiki.

## Organisation des sources

| Chemin (sous `src/detect-language/`) | Rôle |
|---|---|
| `plugin.info` | métadonnées du plugin |
| `modules/startup.js` | détection : pose `$:/language` au démarrage |
| `lingo.tid` | la procédure `detect-language-lingo` et la fonction `detect-language-lingo-text` (tag `$:/tags/Global`) |
| `readme.tid`, `history.tid`, `licence.tid` | onglets d'information du plugin : chacun affiche la version de `language/<lang>/` correspondant à la langue du wiki (repli `en-GB`) |
| `language/<lang>/` | les textes du readme, de l'historique et de la licence, un dossier par langue |

## Fonctionnement

- **La détection s'exécute avant le module `startup` du core.** `modules/startup.js` (`"before": ["startup"]`, `"after": ["load-modules"]`, navigateur seulement) choisit la meilleure correspondance de `navigator.language` parmi les plugins de langue installés dans le wiki : étiquette exacte, puis sous-étiquette principale (`fr-CA` → `fr-FR`), puis `en-GB`. Il ne doit pas devenir une action `$:/tags/StartupAction/Browser` : le core construit `$tw.languageSwitcher` en lisant `$:/language` une seule fois, puis vide la file d'événements après les actions de démarrage ; un changement ultérieur est donc perdu et l'interface du core reste en anglais. Le commentaire d'en-tête du module détaille cette course.
- **Rien n'est stocké.** Le `$:/config/SyncFilter` de chaque wiki consommateur exclut `$:/language` : la valeur détectée ne vit qu'en mémoire.
- **Les chaînes de contenu appartiennent au wiki consommateur.** `detect-language-lingo "<Domain>/<Key>"` résout `$:/nikorion/language/<lang>/<Domain>/<Key>` pour la langue courante, avec repli sur `en-GB` ; les chaînes elles-mêmes vivent dans `wiki/tiddlers/language/<lang>/*.multids` de ce wiki, jamais ici.
- **Conservé dans les démos publiées.** Aucun `publishFilter` n'exclut le plugin : une démo construite détecte elle aussi la langue de son visiteur.

## Licence

MIT — voir `LICENSE`.
