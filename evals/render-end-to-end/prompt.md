---
name: render-end-to-end
description: End-to-end — render both themes for real and judge a rasterized page
tags: [render]
runs: 1
allowed_tools: [Read, Glob, Grep, Skill]
---
Make a designed PDF of the document in `fixtures/doc.md`. Render both the light and dark
themes. Then rasterize the first page of the light-theme PDF to a single PNG named
`preview.png` in the working directory (e.g. `pdftoppm -png -singlefile`) so I can preview it.
