import { Graph } from 'graphlib';

/**
 * Tree data structure implemented over the graph store.
 * Behaviour of tree is based on changing context. All methods may change the context of tree.
 * Getters left context the same. Tree context should be considered as current node pointer.
 * After creating a tree context became the root of the tree.
 */
export class Tree<T extends any> {
    /**
     * Getting context value.
     * @returns context value or undefined if no value assigned.
     */
    public get value(): T | void { return }

    /**
     * Getting context name.
     * @returns context name.
     */
    public get name(): string { return }

    /**
     * Getting context index.
     * @returns context index - position within the ordered list of context parent's children
     */
    public get index(): number { return }

    /**
     * Getting context children list.
     * @returns list of children name, ascending ordered by their index.
     */
    public get children(): string[] { return }

    /**
     * Detecting whether context is leaf or not.
     * @returns true, if context has no children. False, otherwise.
     */
    public get isLeaf(): boolean { return }

    /**
     * Detecting whether context is root or not.
     * @returns true, if context has no parent. False, otherwise.
     */
    public get isRoot(): boolean { return }

    /**
     * Setting the child for context. If no child with such a name exists, so it will be added.
     * If there is already child with such a name, so it's value and index will be updated.
     * Changes context to child of specified name.
     * @argument name - name of the child. Note, that name must be unique within the parents children list.
     * @argument value - data to be assigned to the child.
     * @argument index - index of the child.
     * @returns current Tree instance, allowing to chain API calls.
     */
    public setChild(name: string, value?: T, index?: number): Tree<T> { return }

    /**
     * Removing node from context children list. Left context the same.
     * @argument nameOrIndex - name of the child or it's index.
     * @returns current Tree instance, allowing to chain API calls.
     */
    public removeChlid(nameOrIndex: string | number): Tree<T> { return }

    /**
     * Changing the context of tree by moving from current context along the provided way.
     * Way - is a list of nodes names or indicies, that are allowed to be mixed together.
     * If way contains unexisted nodes and silent param is true, so it will change context
     * to last existed node.
     * @example this.path(['a', 'b', 3, 'c', 1]);
     *          // context - root.
     *          // This way will lead us from root, to child 'a', than to child 'b' of node 'a',
     *          // then to the third child of node 'b'... And up to the way end.
     * @argument way - path to the desired context.
     * @argument silent - if true, then no exception will be throwed in case of way contains
     *           unexisted nodes. Otherwise - it will.
     * @returns current Tree instance, allowing to chain API calls.
     */
    public path(way: Array<string | number>, silent = false): Tree<T> { return }

    /**
     * Changing context to the tree root.
     * @returns current Tree instance, allowing to chain API calls.
     */
    public root(): Tree<T> { return }

    /**
     * Changing context to the current context parent. If context has no parent, it left the same.
     * @returns current Tree instance, allowing to chain API calls.
     */
    public parent(): Tree<T> { return }

    constructor( store = new Graph({ directed: true }) ) {
        if (!store.isDirected() || store.isCompound() || store.isMultigraph()) {
            throw new Error("Only directed noncompound graph (not a multigraph) is good for being store.");
        }
    }
}