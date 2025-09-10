"use strict";
//mymap is a temporary copy of database
//instead of using database directly , we will use mymap for fetching all info about nodes,edges and cached paths
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyMap = void 0;
//these nodes , edges , cachedPaths arrays will be in local memory untill server restarts
// they are not stored in database
// This is a simple in-memory representation of the map
//instead of using a database , we will use in memory data structure
let nodes = [];
let edges = [];
let cachedPaths = [];
//my map is a object
exports.MyMap = {
    addNode: (node) => {
        nodes.push(node);
        return node;
    },
    getNodeById: (id) => {
        return nodes.find((n) => n.id === id);
    },
    getAllNodes: () => nodes,
    addEdge: (edge) => {
        edges.push(edge);
        return edge;
    },
    getAllEdges: () => edges,
    getGraph: () => {
        return { nodes: nodes, edges: edges }; // Return a graph object
    },
    saveCachedPath: (path) => {
        // Check if same route (from -> to with same mode) already cached
        const existing = cachedPaths.find((p) => p.path[0]?.from === path.path[0]?.from &&
            p.path[p.path.length - 1]?.to === path.path[path.path.length - 1]?.to &&
            p.mode === path.mode);
        if (!existing) {
            path.cached = true;
            cachedPaths.push(path);
        }
        return path;
    },
    getCachedPath: (from, to, mode) => {
        return cachedPaths.find((p) => p.path[0]?.from === from &&
            p.path[p.path.length - 1]?.to === to &&
            p.mode === mode);
    },
    getAllCachedPaths: () => cachedPaths,
    clear: () => {
        nodes = [];
        edges = [];
        cachedPaths = [];
    },
};
