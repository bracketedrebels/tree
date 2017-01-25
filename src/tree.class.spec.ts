import 'jasmine';

import { Tree } from './tree.class';
import { Graph } from 'graphlib';



describe(`Tree`, () => {

    let tree: Tree<any>;
    let store: Graph;
    let a = 'a', b = 'b', c = 'c', d = 'd', e = 'e', f = 'f', g = 'g';

    beforeEach( () => tree = new Tree<any>(store = new Graph({ directed: true })) );

    it(`should create an instance`, () => {
        expect(() => new Tree(new Graph({ directed: true }))).toBeTruthy();
    });
    it(`shold not accept invalid storage graphs`, () => {
        expect(() => new Tree(new Graph({ multigraph: true }))).toThrowError();
        expect(() => new Tree(new Graph({ directed: false }))).toThrowError();
        expect(() => new Tree(new Graph({ compound: true }))).toThrowError();
    });
    it(`should context by default to be root`, () => {
        expect(tree.isRoot).toBeTruthy();
    });
    it(`should correctly change context to root`, () => {
        expect(tree.setChild(a).isRoot).toBeFalsy();
        expect(tree.root().isRoot).toBeTruthy();
    });
    it(`should correctly add child`, () => {
        tree.setChild(a);
        expect(tree.index === 0).toBeTruthy();
        expect(tree.name === a).toBeTruthy();
        expect(tree.value === undefined).toBeTruthy();
        expect(tree.isLeaf).toBeTruthy();
        expect(tree.isRoot).toBeFalsy();
        expect(tree.children.length === 0).toBeTruthy();
        expect(tree.parent().isRoot).toBeTruthy();
    });
    it(`should correctly update child`, () => {
        tree.setChild(a, 42);
        tree.parent().setChild(a);
        expect(tree.index === 0).toBeTruthy();
        expect(tree.name === a).toBeTruthy();
        expect(tree.value === 42).toBeTruthy();
        tree.parent().setChild(a, 43);
        expect(tree.value === 43).toBeTruthy();
        tree.parent().setChild(b);
        tree.parent().setChild(a, 42, 1);
        expect(tree.value === 42).toBeTruthy();
        expect(tree.index === 1).toBeTruthy();
        tree.parent().setChild(b);
        expect(tree.index === 0).toBeTruthy();
    });
    it(`should correctly build a chain of children`, () => {
        tree.setChild(a).setChild(b).setChild(c).setChild(d);
        expect(tree.name === d).toBeTruthy();
        expect(tree.parent().name === c).toBeTruthy();
        expect(tree.parent().name === b).toBeTruthy();
        expect(tree.parent().name === a).toBeTruthy();
        expect(tree.isRoot).toBeTruthy();
    });
    it(`should correctly traverse tree via path`, () => {
        tree.setChild(a).setChild(b).setChild(c).setChild(d)
            .parent().setChild(e).setChild(f)
            .parent().setChild(g)
            .root();

        expect(tree.path([a, b, c, d]).name === d).toBeTruthy();
        expect(tree.parent().path([e, f]).name === f).toBeTruthy();
        expect(tree.parent().path([g]).name === g).toBeTruthy();
    });
    it(`should correctly remove child`, () => {
        tree.setChild(a)
        .root().setChild(b)
        .root().setChild(c)
        .root();

        expect(tree.children.length === 3).toBeTruthy();
        expect(tree.removeChlid('b').children.length === 2).toBeTruthy();
        tree.setChild(a);
        expect(tree.index === 0).toBeTruthy();
        tree.setChild(c);
        expect(tree.index === 1).toBeTruthy();
    });
});
