# Contributing

Feel free to get into contact if you want to contribute to Yana. Currently, I'm
most thankful about feedback or any reports on bugs you encounter while using Yana.
You can post both as GitHub issues.

## Release Process

To release a new version,

- update the field `version` in `package.json` to the `X.X.X`,
- author a new commit with the message `vX.X.X`,
- tag the commit with the title `vX.X.X`,
- push the commit and the tag to GitHub and
- after the release was drafted by the CI pipeline, publish the draft.

## Performance testing

To evaluate the performance of Yana and its suitability for large
workspaces, you can use a CLI script to generate a workspace with
a set number of notes. The workspace is created at the specified
location and can be added inside of Yana.

    ts-node scripts/create-perftesting-workspace.ts -d ./perftest-10k -s 10000 -t 30
