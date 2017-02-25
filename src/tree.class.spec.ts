import 'jasmine';

import { Tree } from './tree.class';
import { Graph } from 'graphlib';



describe(`Tree`, () => {

    let tree: Tree<any> = new Tree();
    let a = 'a', b = 'b', c = 'c', d = 'd';

    it(`should create an instance`, () => {
        expect(tree).toBeTruthy();
    });
    it(`shold not accept invalid storage graphs`, () => {
        expect(() => new Tree(new Graph({ multigraph: true }))).toThrowError();
        expect(() => new Tree(new Graph({ directed: false }))).toThrowError();
        expect(() => new Tree(new Graph({ compound: true }))).toThrowError();
    });
    it(`should context by default to be root`, () => {
        expect(tree.isRoot).toBeTruthy();
    });
    it(`should correctly add child`, () => {
        tree.setChild(a);
        expect(tree.name).toBe('/');
        expect(tree.value).toBeUndefined();
        expect(tree.isLeaf).toBeFalsy();
        expect(tree.isRoot).toBeTruthy();
        expect(tree.children.length).toBe(1);
        expect(tree.children[0]).toBe(a);
    });
    it(`should correctly remove child`, () => {
        tree.removeChild(a);
        expect(tree.children.length).toBe(0);
        expect(tree.isLeaf).toBeTruthy();
        expect(() => tree.removeChild(b)).toThrowError();
    });
    it(`should correctly change context`, () => {
        tree.setChild(a).path(a);
        expect(tree.name).toBe(a);
        expect(tree.isLeaf).toBeTruthy();
        expect(tree.isRoot).toBeFalsy();
        expect(tree.children.length).toBe(0);
        expect(tree.setChild(b).path(`./${b}`).name).toBe(b);
        expect(tree.path(`..`).name).toBe(a);
        expect(tree.path(`.`).name).toBe(a);
        expect(tree.path(`/${a}`).name).toBe(a);
        expect(tree.path(`/`).name).toBe(`/`);
        expect(tree.path(`../..`).name).toBe(`/`);
        expect(() => tree.path(`/i/am/not/exist`)).toThrowError();
        expect(tree.path(`/i/am/not/exist`, true).name).toBe(`/`);
        expect(tree.path(`../../${a}/${b}/../${b}/././../.././${a}/${b}/..`).name).toBe(a);
    });
    it(`should correctly update child`, () => {
        tree.setChild(a, 42).path(a);
        expect(tree.name).toBe(a);
        expect(tree.value).toBe(42);
        tree.path('..');
        tree.setChild(a).path(a);
        expect(tree.value).toBe(42);
        tree.path('..');
        tree.setChild(a, 43).path(a);
        expect(tree.value).toBe(43);
        tree.path('..');
        tree.setChild(a, 42).path(a);
        expect(tree.value).toBe(42);
    });
    it(`should correctly build a chain of children`, () => {
        tree.path('/');
        tree.setChild(a).path(a)
            .setChild(b).path(b)
            .setChild(c).path(c)
            .setChild(d).path(d);
        expect(tree.name).toBe(d);
        expect(tree.path('..').name).toBe(c);
        expect(tree.path('..').name).toBe(b);
        expect(tree.path('..').name).toBe(a);
        expect(tree.path('..').isRoot).toBeTruthy();
    });
});
