### Formatting & linting

Control of code quality. Should be run before any builds/running your code.

#### Format & lint (fast, use during dev iterations):
```sh
    pnpm cq
```
*Performance reference: Checked 13 files in 7ms.*

#### Deep lint (slow, incorporates biome rules from project domain, use before a build, or after big changes):

**IMPORTANT**: ALWAYS use before pushing to remote. Uses the biome security/noSecrets rule to try and catch any exposed key-like values.

```sh
    pnpm cq:deep
```
*Performance reference: Checked 13 files in 78ms.*