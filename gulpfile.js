const gulp = require("gulp");
const del = require("del");
const merge = require("merge2");
const ts = require("gulp-typescript");
const replace = require("gulp-replace");
const sass = require("gulp-sass");
const babel = require("gulp-babel");

const pkg = require("./package.json");
const tsProject = ts.createProject("tsconfig.json", {
  module: "commonjs",
  declaration: true
});

const clean = () => del(pkg.files);

const sources = ["src/**/*.ts", "src/**/*.tsx", "!src/**/stories.tsx", "!src/**/*.test.ts"];

const compileScripts = () => {
  const tsResult = gulp
    .src(sources) // or tsProject.src()
    .pipe(tsProject());
  const babelResult = gulp
    .src(sources)
    .pipe(babel())
    .pipe(gulp.dest("lib"));

  return merge([
    // We need to override references in types to use nodejs
    // module resolution instead of relative node_modules for types
    tsResult.dts
      .pipe(replace(/import\(".*\/node_modules\//g, 'import("'))
      .pipe(replace('/// <reference path="../../node_modules/emotion/types/index.d.ts" />', ""))
      .pipe(gulp.dest("types")),
    babelResult
  ]);
};

const compileStylesSass = () =>
  gulp
    .src("./scss/styles.scss")
    .pipe(sass())
    .pipe(gulp.dest("styles/css"));

const compileStylesCSS = () => gulp.src("css-gridish/css/**/*.css").pipe(gulp.dest("styles/css"));

const copyStylesSass = () => gulp.src("./scss/**/*").pipe(gulp.dest("styles/scss"));

gulp.task(
  "build",
  gulp.series([clean, compileScripts, compileStylesSass, compileStylesCSS, copyStylesSass])
);
