import 'jasmine';

import { Tree } from './tree.class';



describe(`Tree`, () => {

    let tree: Tree<any>;

    beforeEach( () => tree = new Tree() );

    it(`should create an instance`, () => {
        expect(tree).toBeTruthy();
    });
});
