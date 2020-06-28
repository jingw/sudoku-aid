Sudoku Aid
==========

[Try it live](https://jingw.github.io/sudoku-aid/)

Yet another tool for solving Sudoku, with the following features:

- variant constraints (e.g. knight moves, thermometers, killer sudoku)
- highlighting
- automatically finding/highlighting where numbers can go
- automatic application of basic strategies

Mainly intended for usage on Sudoku variants.

Requirements
============
Modern browser with support for ES6 (2015) and JS modules.

Developing
==========

Run tests live: https://jingw.github.io/sudoku-aid/tests.xhtml

```
npm install
tsc && npx eslint *.ts
python -m http.server
xdg-open http://localhost:8000/tests.xhtml
```

Publishing:
```
git worktree add gh-pages
find gh-pages -mindepth 1 -not -name .git -delete
cp *.{css,js,xhtml} gh-pages/
git -C gh-pages add --all
git -C gh-pages commit --amend --date "$(date)" -m Publish
git -C gh-pages push origin gh-pages -f
git worktree remove gh-pages
```
