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
        let tmp = this.store.successors(this.context);
        if (typeof (tmp) === 'object') {
            if (!tmp.length) {
                return true;
            };
        }
        return false;
    }

    /**
     * Detecting whether context is root or not.
     * @returns true, if context has no parent. False, otherwise.
     */
    public get isRoot(): boolean {
        if (this.context === this.rootName) {
            return true;
        }
        return false;
    }

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
    public setChild(name: string, value?: T, index?: number): Tree<T> {
        if ((name.indexOf('/') + 1) || (name.indexOf('.') + 1)) {
            throw new Error('name of node cannot contain / or .');
        }
        let uniqueName: string = this.context + '/' + name;
        let content: NodeContent<T> = {
            nonUniqueName: name,
            value: value,
            index: index
        };
        this.store.setNode(uniqueName, content);
        this.store.setEdge(this.context, uniqueName, this.context);
        return;
    }

    /**
     * Removing node from context children list. Left context the same.
     * @argument nameOrIndex - name of the child or it's index.
     * @returns current Tree instance, allowing to chain API calls.
     */
    public removeChlid(name: string): Tree<T> {
        let tmp = this.store.successors(this.context);
        let fullChildName = this.context + '/' + name;
        if (this.store.hasEdge(this.context, fullChildName)) {
            this.store.removeEdge(this.context, fullChildName);
        }
        else {
            throw new Error('there is no edge with the same name');
        }
        return;
    }

    /**
     * Changing the context of tree by moving from current context along the provided way.
     * Way - is a list of nodes names or indicies, that are allowed to be mixed together.
     * If way contains unexisted nodes and silent param is true, so it will do nothing.
     * @example this.path(['a', 'b', 'c', 'd', 'e']);
     *          // context - root.
     *          // This way will lead us from root, to child 'a', then to child 'b' of node 'a',
     *          // then to child 'c' of node 'b'... And up to the way end.
     * @argument way - path to the desired context.
     * @argument silent - if true, then no exception will be throwed in case of way contains
     *           unexisted nodes. Otherwise - it will.
     * @returns current Tree instance, allowing to chain API calls.
     */
    public path(way: string[], silent = false): Tree<T> {
        let s: string = 'root';
        if ((way[0] === '.') || (way[0] === '..')) {
            s = this.context;
        }
        for (let step of way) {
            if (step === '..') {
                let index = s.lastIndexOf('/');
                if (index !== -1) {
                    s = s.substring(0, index);
                }
            }
            else if (step === '.') { }
            else {
                s += '/' + step;
            }

        }

        if (this.store.node(s)) {
            this.context = s;
        }
        else {
            console.log(s);
            // throw new Error('Path is incorrect');
        }
        return;
    }

    /**
     * Changing context to the tree root.
     * @returns current Tree instance, allowing to chain API calls.
     */
    public root(): Tree<T> {
        this.context = this.rootName;
        return;
    }

    /**
     * Changing context to the current context parent. If context has no parent, it left the same.
     * @returns current Tree instance, allowing to chain API calls.
     */
    public parent(): Tree<T> {
        if (this.context !== this.rootName) {
            this.context = this.store.predecessors(this.context)[0];
        }
        return;
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
