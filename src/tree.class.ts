import { Graph } from 'graphlib';

export interface NodeContent<T> {
    nonUniqueName: string;
    value: T | void;
    index?: number;
}

/**
 * Tree data structure implemented over the graph store.
 * Behaviour of tree is based on changing context. All methods may change the context of tree.
 * Getters left context the same. Tree context should be considered as current node pointer.
 * After creating a tree context became the root of the tree.
 */
export class Tree<T extends any> {
    private context: string;
    private rootName: string;
    /**
     * Getting context value.
     * @returns context value or undefined if no value assigned.
     */
    public get value(): T | void {
        return this.store.node(this.context).value;
    }

    /**
     * Getting context name.
     * @returns context name.
     */
    public get name(): string { return this.context; }

    /**
     * Getting context index.
     * @returns context index - position within the ordered list of context parent's children
     */
    public get index(): number { return this.store.node(this.context).index; }

    /**
     * Getting context children list.
     * @returns list of children name, ascending ordered by their index.
     */
    public get children(): string[] {
        let tmp = this.store.successors(this.context);
        if (typeof (tmp) === 'object') {
            let ans: string[] = [];
            for (let i in tmp) {
                let index = tmp[i].lastIndexOf('/');
                ans[i] = tmp[i].substring(index + 1);
            }
            return ans;
        }
        else {
            throw new Error('incorrect node or context');
        }
    }

    /**
     * Detecting whether context is leaf or not.
     * @returns true, if context has no children. False, otherwise.
     */
    public get isLeaf(): boolean {
        return (this.store.sinks().indexOf(this.context) >= 0);
    }

    /**
     * Detecting whether context is root or not.
     * @returns true, if context has no parent. False, otherwise.
     */
    public get isRoot(): boolean { return (this.context === this.rootName); }

    /**
     * Setting the child for context. If no child with such a name exists, so it will be added.
     * If there is already child with such a name, so it's value and index will be updated.
     * @argument name - name of the child. Note, that name must be unique within the parents children list.
     * @argument value - data to be assigned to the child.
     * @argument index - index of the child. By default index starts from zero and limited by children
     *           count. It means, that when you are adding 17-th child, you can not sepcify index more
     *           than 16 and less than 0.
     * @returns current Tree instance, allowing to chain API calls.
     */
    public setChild(name: string, value?: T, index?: number): this {
        if ((name.indexOf('/') + 1) || (name.indexOf('.') + 1)) {
            throw new Error(`Name of node can not contain '/' or '.'`);
        }
        let uniqueName: string = this.context + '/' + name;
        let content: NodeContent<T> = {
            nonUniqueName: name,
            value: value,
            index: index
        };
        this.store.setNode(uniqueName, content);
        this.store.setEdge(this.context, uniqueName, this.context);
        return this;
    }

    /**
     * Removing child with specified name of current context. Left context the same.
     * @argument name - name of the child.
     * @returns current Tree instance, allowing to chain API calls.
     */
    public removeChild(name: string): this {
        let fullChildName = this.context + '/' + name;
        if (this.store.hasEdge(this.context, fullChildName)) {
            this.store.removeEdge(this.context, fullChildName);
        }
        else {
            throw new Error('There is no edge with a such name');
        }
        return this;
    }

    /**
     * Changing the context of tree to the specified path (formed according to the POSIX
     * standard). If way contains unexisted nodes and silent param is true, so it will do nothing.
     * @example this.path('../a/b');
     * @example this.path('./c/d');
     * @example this.path('/e/f');
     * @example this.path('g/h'); // equal to './g/h';
     * @argument path - path to the desired context.
     * @argument silent - if true, then no exception will be throwed in case of way contains
     *           unexisted nodes. Otherwise - it will.
     * @returns current Tree instance, allowing to chain API calls.
     */
    public path(path: string, silent = false): this {
        // let s: string = 'root';
        // if ((path[0] === '.') || (path[0] === '..')) {
        //     s = this.context;
        // }
        // for (let step of path) {
        //     if (step === '..') {
        //         let index = s.lastIndexOf('/');
        //         if (index !== -1) {
        //             s = s.substring(0, index);
        //         }
        //     }
        //     else if (step === '.') { }
        //     else {
        //         s += '/' + step;
        //     }

        // }

        // if (this.store.node(s)) {
        //     this.context = s;
        // }
        // else {
        //     throw new Error('Path is incorrect');
        // }
        return this;
    }

    constructor(private store = new Graph({ directed: true })) {
        if (!store.isDirected() || store.isCompound() || store.isMultigraph()) {
            throw new Error('Only directed noncompound graph (not a multigraph) is good for being store.');
        }
        this.context = 'root';
        this.store.setNode(this.context, { index: 0 });
        this.rootName = this.context;
    }
}
