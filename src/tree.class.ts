import { Graph } from 'graphlib';

export interface NodeContent<T> {
    name: string;
    value: T | void;
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
    public get name(): string { return this.store.node(this.context).name; }

    /**
     * Getting context children list.
     * @returns list of children name.
     */
    public get children(): string[] {
        let tmp = <string[]>this.store.successors(this.context);
        let ans: string[] = [];
        for (let i in tmp) {
            ans[i] = this.store.node(tmp[i]).name;
        }
        return ans;
    }

    /**
     * Detecting whether context is leaf or not.
     * @returns true, if context has no children. False, otherwise.
     */
    public get isLeaf(): boolean { return this.store.sinks().indexOf(this.context) >= 0; }

    /**
     * Detecting whether context is root or not.
     * @returns true, if context has no parent. False, otherwise.
     */
    public get isRoot(): boolean { return this.context === this.rootName; }

    /**
     * Setting the child for context. If no child with such a name exists, so it will be added.
     * If there is already child with such a name, so it's value will be updated.
     * @argument name - name of the child. Note, that name must be unique within the parents children list.
     * @argument value - data to be assigned to the child.
     * @returns current Tree instance, allowing to chain API calls.
     */
    public setChild(name: string, value?: T): this {
        if (arguments.length < 2) { return this.CreateTreeNode(name, this.context); }
        return this.CreateTreeNode(name, this.context, value);
    }

    /**
     * Removing child with specified name of current context. Left context the same.
     * @argument name - name of the child.
     * @returns current Tree instance, allowing to chain API calls.
     */
    public removeChild(name: string, removeSubtree = false) {
        let fullChildName = this.context + name + '/';
        if (this.store.hasEdge(this.context, fullChildName)) {
            if (removeSubtree) { this.removeSubtree(fullChildName); }
            else { this.removeLeaf(fullChildName); }
        }
        else { throw new Error('There is no child with a such name'); }
        return this;
    }

    /**
     * Changing the context of tree to the specified path (formed according to the POSIX
     * standard). If way contains unexisted nodes and silent param is true, so it will do nothing.
     * @example this.path('../a/b');
     * @example this.path('./c//d');
     * @example this.path('/e/f');
     * @example this.path('g/h'); // equal to './g/h';
     * @argument path - path to the desired context.
     * @argument silent - if true, then no exception will be throwed in case of way contains
     *           unexisted nodes. Otherwise - it will.
     * @returns current Tree instance, allowing to chain API calls.
     */
    public path(path: string, silent = false): this {
        let finalPath = this.parsePathString(path);
        if (this.store.node(finalPath)) { this.context = finalPath; }
        else { if (!silent) { throw new Error('Path is incorrect'); } }
        return this;
    }

    // @internal
    private CreateTreeNode(name: string, parent: string, value?: T): this {
        if ((name.includes('/')) || (name.includes('.'))) {
            throw new Error(`Name of node can not contain '/' or '.'`);
        }
        let uniqueName: string = parent + name + '/';
        let content: NodeContent<T> = {
            name: name,
            value: value
        };
        if (arguments.length < 3) {
            if (this.store.node(uniqueName)) {
                return this;
            }
        }
        this.store.setNode(uniqueName, content);
        this.store.setEdge(parent, uniqueName);
        return this;
    }

    // @internal
    private removeSubtree(subtreeRootName: string): this {
        this.store = this.store.filterNodes(
            function (nodeName: string): boolean {
                if (nodeName.includes(subtreeRootName)) {
                    return false;
                }
                return true;
            }
        );
        return this;
    }

    // @internal
    private removeLeaf(leafFullName: string): this {
        let currentContext = this.context;
        this.context = leafFullName;
        if (this.isLeaf) {
            this.store.removeNode(leafFullName);
        }
        else {
            throw new Error('This is not a leaf');
        }
        this.context = currentContext;
        return this;
    }

    // @internal
    private parsePathString(path: string): string {
        if (path[0] !== '/') { path = this.context + '/' + path; }
        let pathArray = path.split('/');
        let finalPathArray: string[] = [];
        for (let i = 0; i < pathArray.length; ++i) {
            switch (pathArray[i]) {
                case '..': finalPathArray.pop(); break;
                case '.': break;
                case '': break;
                default: finalPathArray.push(pathArray[i]);
            }
        }
        if (finalPathArray.length !== 0) { return '/' + finalPathArray.join('/') + '/'; }
        else { return '/'; }
    }

    constructor(private store = new Graph({ directed: true })) {
        if (!store.isDirected() || store.isCompound() || store.isMultigraph()) {
            throw new Error('Only directed noncompound graph (not a multigraph) is good for being store.');
        }
        this.context = '/';
        this.store.setNode(this.context, { name: this.context });
        this.rootName = this.context;
    }
}
