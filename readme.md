# Yana

> Yet another notebook app

Currently in early alpha, but already fairly rich in features. Allows
you to manage local workspaces of hierarchically structured taggable 
and searchable notes. Yana supports multiple kinds of notes, currently
rich-text notes (including embedded media and complex tables) and code
snippets (based on the VSCode editor frontend) are implemented. Other
features include

* Manage note structure via drag-and-drop
* Rich notes editor powered by the Atlassian editor core
* Multiple local workspaces
* Multiple notes can be opened at once in tabs
* Starring of notes
* Trashcan functionality

Download [the latest release](https://github.com/lukasbach/yana/releases).
Currently only available for Windows, coming soon to Linux and Mac.

## Release Process

To release a new version,

* update the field ``version`` in ``package.json`` to the ``X.X.X``,
* author a new commit with the message ``vX.X.X``,
* tag the commit with the title ``vX.X.X``,
* push the commit and the tag to GitHub and
* after the release was drafted by the CI pipeline, publish the draft.