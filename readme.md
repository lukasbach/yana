# Yana [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Checkout%20Yana,%20a%20free%20and%20powerful%20notebook%20app&url=https://yana.js.org&hashtags=notetaking,organizing,yana)

> Yet another notebook app

<p align="center">
    <img src="./demo.gif" alt="Yana Demo"><br>
    <a href="https://yana.js.org">yana.js.org</a>
</p>

![GitHub all releases](https://img.shields.io/github/downloads/lukasbach/yana/total)
![GitHub release (latest by date)](https://img.shields.io/github/downloads/lukasbach/yana/latest/total)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=lukasbach_yana&metric=ncloc)](https://sonarcloud.io/dashboard?id=lukasbach_yana)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=lukasbach_yana&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=lukasbach_yana)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=lukasbach_yana&metric=security_rating)](https://sonarcloud.io/dashboard?id=lukasbach_yana)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=lukasbach_yana&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=lukasbach_yana)

<p align="center">
  <a href="https://www.producthunt.com/posts/yana-3?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-yana-3" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=276473&theme=light" alt="Yana - Powerful & organizable note-taking app with lots of features | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
</p>

Yana is a powerful notebook app which allows
you to manage local workspaces of hierarchically structured taggable
and searchable notes. It supports multiple kinds of notes, currently
rich-text notes (including embedded media and complex tables) and code
snippets (based on the VSCode editor frontend) are supported. Other
features include

- Manage note structure via drag-and-drop
- Rich notes editor powered by the Atlassian editor core
- Multiple local workspaces
- Multiple notes can be opened at once in tabs
- Starring of notes
- Trashcan functionality
- Scalability, working fluently even on notebooks with ten thousands of notes

Download [the latest release](https://github.com/lukasbach/yana/releases).
Currently available for Windows, Linux and Mac.
Find out more about Yana on [yana.js.org](https://yana.js.org).

## Contributing

Feel free to contribute with Issue Reports, Feedback or Pull Requests.

If you want to start developing Yana locally, you need Node 14+ and yarn install. Clone the repo,
install dependencies with `yarn` and start the app locally with `yarn start`.

Note that, after the electron window has opened, it might not automatically refresh when the web
package has finished building. Refresh the container with `CTRL+R` to see the app. You can
open up Devtools with `CTRL+SHIFT+i`.

More details are available in [contributing.md](./contributing.md).