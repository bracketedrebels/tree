import { Graph } from 'graphlib';
import { ROOT, SEPARATOR, CURRENT, PARENT } from './tree.consts';

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
    public get value(): T | void {
        return this.store.node(this.context).value;
    }

    /**
     * Getting context name.
     * @returns context name.
     */
    public get name(): string { return this.store.node(this.context).name; }

    /**
     * Getting context
     * @return context
     */
    public get ctx(): string { return this.context; }

    /**
     * Getting context children list.
     * @returns list of children name.
     */
    public get children(): string[] {
        // this.store.successors(this.context) will never return void,
        // because this.context is always correct name of graph node.
        return (this.store.successors(this.context) as string[]).map(fullName => this.store.node(fullName).name);
    }

    /**
     * Detecting whether context is leaf or not.
     * @returns true, if context has no children. False, otherwise.
     */
    public get isLeaf(): boolean { return this.isNodeLeaf(this.context); }

    /**
     * Detecting whether context is root or not.
     * @returns true, if context has no parent. False, otherwise.
     */
    public get isRoot(): boolean { return this.context === ROOT; }

    /**
     * Setting the child for context. If no child with such a name exists, so it will be added.
     * If there is already child with such a name, so it's value will be updated.
     * @argument name - name of the child. Note, that name must be unique within the parents children list.
     * @argument value - data to be assigned to the child.
     * @returns current Tree instance, allowing to chain API calls.
     * @throws {Error} when name is invalid
     */
    public setChild(name: string, value?: T): this {
        this.validateName(name);
        return arguments.length < 2
            ? this.createNode(name, this.context)
            : this.createNode(name, this.context, value);
    }

    /**
     * Removing child with specified name of current context. Left context the same.
     * @argument name - name of the child.
     * @returns current Tree instance, allowing to chain API calls.
     * @throws {Error} when name is invalid
     * @throws {Error} when node is not a leaf, and removeSubtree is false;
     */
    public removeChild(name: string, removeSubtree = false): this {
        this.validateName(name);
        let fullChildName = `${this.context}${SEPARATOR}${name}`;
        if (this.store.hasEdge(this.context, fullChildName)) {
            if (removeSubtree) { this.removeSubtree(fullChildName); }
            else { this.removeLeaf(fullChildName); }
        }
        else { throw new Error('There is no child with such a name.'); }
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
     * @throws {Error} in non silent mode, when path is incorrect
     */
    public path(path: string, silent = false): this {
        let finalPath = this.normalizePath(path);
        if (this.store.hasNode(finalPath)) { this.context = finalPath; }
        else { if (!silent) { throw new Error('Path is incorrect.'); } }
        return this;
    }

    constructor(private store = new Graph({ directed: true })) {
        if (!store.isDirected() || store.isCompound() || store.isMultigraph()) {
            throw new Error('Only directed noncompound graph (not a multigraph) is good for being store.');
        }
        this.context = ROOT;
        this.store.setNode(ROOT, { name: ROOT });
    }


    
    private context: string;

    // @internal
    private createNode(validName: string, parent: string, value?: T): this {
        let uniqueName: string = `${parent}${SEPARATOR}${validName}`;
        if ((arguments.length < 3) && (this.store.hasNode(uniqueName))) { return this; }
        this.store
            .setNode(uniqueName, { name: validName, value: value })
            .setEdge(parent, uniqueName);
        return this;
    }

    // @internal
    private removeSubtree(subtreeRootName: string): this {
        this.store = this.store.filterNodes(
            nodeName => !nodeName.startsWith(subtreeRootName)
        );
        return this;
    }

    // @internal
    private removeLeaf(leafFullName: string): this {
        if (this.isNodeLeaf(leafFullName)) {
            this.store.removeNode(leafFullName);
        }
        else {
            throw new Error('This is not a leaf.');
        }
        return this;
    }

    // @internal
    private normalizePath(path: string): string {
        return `${SEPARATOR}${
            (path.startsWith(SEPARATOR) ? path : `${this.context}${SEPARATOR}${path}`)
            .split(SEPARATOR)
            .filter( v => !!v && v !== CURRENT)
            .reduce( (acc, v) => (v === PARENT ? acc.pop() : acc.push(v), acc), [] )
            .join(SEPARATOR)
        }`;
    }

    // @internal
    private validateName(name: string): void {
        if (name.includes(SEPARATOR) || name.includes(CURRENT) || name.includes(PARENT)) {
            throw new Error(`Name of node can not contain neither '${SEPARATOR}' nor '${CURRENT}' nor '${PARENT}'.`);
        }
    }

    // @internal
    private isNodeLeaf(node: string): boolean { return this.store.sinks().indexOf(node) >= 0; }
}
