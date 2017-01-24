'use strict';

const del = require('del');
const gulp = require('gulp');
const merge = require('merge2');
const jasmine = require('gulp-jasmine');
const tsprojectDev = require('gulp-typescript').createProject('tsconfig.dev.json');
const tsprojectDist = require('gulp-typescript').createProject('tsconfig.dist.json');

gulp.task('internal:compile:dev', () => 
    tsprojectDev.src()
    .pipe(tsprojectDev()).js
    .pipe(gulp.dest('tmp'))
);
gulp.task('internal:compile:dist', () => {
    let project = tsprojectDist.src().pipe(tsprojectDist());
    let dist = gulp.dest('dist');
    return merge([ project.dts.pipe(dist), project.js.pipe(dist) ]);
});
gulp.task('internal:tests', ['internal:compile:dev'], () => gulp.src('tmp/**/*.spec.js').pipe(jasmine()));

gulp.task('test', ['internal:tests'], () => del('tmp'));
gulp.task('dist', ['internal:tests', 'internal:compile:dist'], () => del('tmp'));
