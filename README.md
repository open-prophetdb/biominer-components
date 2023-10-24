# BioMiner Components

A set of React components for BioInformatics, such as Gene/Transcript Map from GTex Portal, Pathology Image Viewer, etc.

## Demo

More details on [ui-components.3steps.cn](https://ui-components.3steps.cn)

## Getting Started

### Clone the repository

```bash
git clone github.com/yjcyxky/biominer-components.git
cd biominer-components
```

### Install dependencies

```bash
$ yarn
```

### Start the dev server

Before you start the dev server, you need to run a biomedgps server locally (Port: 8000). Please refer to [biomedgps](https://github.com/yjcyxky/biomedgps) for more details.

```bash
$ yarn start
```

### Publish docs to github pages

```bash
yarn deploy
```

### Build documentation

```bash
$ yarn docs:build
```

### Run test

```bash
$ yarn test
```

### Build library via `father`

```bash
$ yarn build
```

### Publish library to npm

Please update the version in `package.json` before publishing.

```bash
$ npm publish .
```

## For developers

Only for developers who want to develop this package locally.

### Install yalc globally

```bash
$ npm i -g yalc
```

### Publish your local package to yalc

```bash
yalc publish
```

### Go to your project and install the package from yalc

```bash
yalc add biominer-components
```

### Update the local package and push to yalc

```bash
yarn build && yalc push
```

### Go to your project and rebuild the package

```bash
rm -rf src/.umi && yarn start:local-dev
```
