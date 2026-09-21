# CodeQuest design-system assets

All CodeQuest identity SVGs and the Foundations Valley panorama were created specifically for this repository on 2026-09-21. They are project-owned original work and are not derived from third-party game artwork. The panorama was generated from a CodeQuest-specific art direction prompt, then converted lossily to WebP at quality 90 without resizing. Research images in the active OpenSpec change are references and are not production assets.

| Asset                            | Role                                        | Source/license                                                | Dimensions             | Intended rendering                                         | Accessibility                                                                                                                       |
| -------------------------------- | ------------------------------------------- | ------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `brand/codequest-mark.svg`       | Code brackets + portal/path identity mark   | Original CodeQuest asset; project-owned                       | 64×64 viewBox          | 24, 32, 48, 64px                                           | Use its embedded title when standalone; hide when adjacent to the `CodeQuest` wordmark                                              |
| `src/app/icon.svg`               | Browser/app icon copy of the CodeQuest mark | Original CodeQuest asset; project-owned                       | 64×64 viewBox          | Browser metadata icon                                      | Browser chrome supplies the accessible context                                                                                      |
| `emblems/debugger-beetle.svg`    | Debug achievement and reward emblem         | Original CodeQuest asset; project-owned                       | 64×64 viewBox          | 32, 48, 64px                                               | Achievement text carries meaning; decorative instances are hidden                                                                   |
| `emblems/builder-cube.svg`       | Build achievement and chapter artifact      | Original CodeQuest asset; project-owned                       | 64×64 viewBox          | 32, 48, 64px                                               | Achievement text carries meaning; decorative instances are hidden                                                                   |
| `emblems/pathfinder-flag.svg`    | Exploration achievement and path marker     | Original CodeQuest asset; project-owned                       | 64×64 viewBox          | 32, 48, 64px                                               | Achievement text carries meaning; decorative instances are hidden                                                                   |
| `frames/avatar-circuit.svg`      | Avatar framing language specimen            | Original CodeQuest asset; project-owned                       | 96×96 viewBox          | 72 or 96px                                                 | Showcase label describes the treatment; decorative frame is hidden when repeated                                                    |
| `worlds/foundations-valley.webp` | Chapter panorama and quest-map atmosphere   | Original generated CodeQuest asset; project-owned             | 2172×724 raster        | 3:1 banner/crop at 1×; do not upscale past intrinsic width | Decorative when title/copy identify the chapter; otherwise use `Foundations Valley: a circuit path climbs toward a mountain portal` |
| `fonts/pixelify-sans.ttf`        | Short display labels and wordmark treatment | Pixelify Sans by Stefie Justprince, SIL Open Font License 1.1 | Variable TrueType font | Display text only; never body/form/editor copy             | Text remains real selectable text with system-mono fallback                                                                         |
| `fonts/OFL.txt`                  | Required font license record                | Google Fonts upstream license                                 | Text file              | Not rendered                                               | License documentation                                                                                                               |

Pixel raster assets use `image-rendering: pixelated` at integer-friendly display sizes. Production consumers must provide stable text backing over the panorama and must not place long body copy directly on detailed artwork.

## Integrity and byte size

| Asset                            |   Bytes | SHA-256                                                            |
| -------------------------------- | ------: | ------------------------------------------------------------------ |
| `brand/codequest-mark.svg`       |     571 | `fda3fea3b93b1e07cb08fe865acfec100c5116b1097b41fb9dc075fdac189300` |
| `emblems/builder-cube.svg`       |     418 | `1fdc7258b3357b24dbced0d6ed1830f20bf2fcdc1b8fd344bfaa19795458cb8e` |
| `emblems/debugger-beetle.svg`    |     415 | `75e4e126dde051b7ada95020d4956614c55ae5e6f820d2ef913270b9ec439f00` |
| `emblems/pathfinder-flag.svg`    |     352 | `ecf6a2b696bd5d048e376433944d3556072d540bb3f63b9dd9e09abd153c8b2d` |
| `frames/avatar-circuit.svg`      |     550 | `04880e8866b4f9cfc7bfd5d098ab98d15edaa0510f84d6d46a74700f35f797fd` |
| `worlds/foundations-valley.webp` | 207,522 | `80a04a86bf5bba18312c4e859ba0353b70635dcaf9f5a4429ddb8ad54e6b6e0c` |
| `fonts/pixelify-sans.ttf`        |  79,160 | `9ba86cd010a4de309d263ceff8e8044092c9db7efda869620cb9ff1c4389e8a5` |
| `fonts/OFL.txt`                  |   4,488 | `b66ba46f511a851ab09998b5a5a9fdbb102545a3864cb993095e1745996873a7` |
