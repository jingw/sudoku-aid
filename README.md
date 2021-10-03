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

Run tests live: https://jingw.github.io/sudoku-aid/tests.html

```
npm install
rm -r dist
./build
python -m http.server -d dist
xdg-open http://localhost:8000/tests.html
```

Publishing:
```
git worktree add gh-pages gh-pages
find gh-pages -mindepth 1 -not -name .git -delete
cp -r --dereference dist/. gh-pages/
git -C gh-pages add --all
git -C gh-pages commit --amend --date now --reset-author -m Publish
git -C gh-pages push origin gh-pages -f
git worktree remove gh-pages
```
