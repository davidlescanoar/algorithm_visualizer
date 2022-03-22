import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import CssBaseline from "@mui/material/CssBaseline";
import AlgorithmSelector from "./components/AlgorithmSelector";
import AlgorithmProcess from "./components/AlgorithmProcess";
//import { dfs, bfs, dijkstra } from "./utils/algorithms";
import Queue from './utils/Queue';

let startingNode, arrivalNode, runAlgorithm;
const INF = (1<<30);
const dx = [-1, 0, 0, 1];
const dy = [0, -1, 1, 0];
export const EMPTY_CELL = 0;
export const WALLED_CELL = 1;
export const DEPARTURE_POINT = 2;
export const ARRIVAL_POINT = 3;
export const PATH = 4;
export const NODE_IN_PROCESS = 5;
export const NODE_TO_BE_PROCESSED = 6;
export const NODE_PROCESSED = 7;

function itIsValid(n, m, a, b) {
    return (a>=0 && a<n && b>=0 && b<m);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function setNode(graphGrid, setGraphGrid, node, color, delay) {
    let grid = graphGrid.slice();
    grid[node.x][node.y] = color;
    setGraphGrid(grid);
    await sleep(delay);
}

async function dfs() {
    
}

async function bfs(graphGrid, setGraphGrid) {
    let n = graphGrid.length;
    let m = graphGrid[0].length;

    let distance = Array(n).fill().map(() => Array(m).fill(INF));
    let parent = Array(n).fill().map(() => Array(m).fill(null));
    distance[startingNode.x][startingNode.y] = 0;

    let queue = new Queue();
    queue.enqueue(startingNode);

    while(queue.length) {
        let node = queue.dequeue();

        if(!runAlgorithm) {
            await setNode(graphGrid, setGraphGrid, startingNode, DEPARTURE_POINT, 0);
            await setNode(graphGrid, setGraphGrid, arrivalNode, ARRIVAL_POINT, 0);
            return;
        }

        await setNode(graphGrid, setGraphGrid, node, NODE_IN_PROCESS, 0);

        for(let k=0; k<4; k++) {
            const i2 = node.x+dx[k];
            const j2 = node.y+dy[k];
            if(itIsValid(n,m,i2,j2) && graphGrid[i2][j2] !== WALLED_CELL && distance[node.x][node.y]+1 < distance[i2][j2]) {
                distance[i2][j2] = distance[node.x][node.y]+1;
                parent[i2][j2] = JSON.parse(JSON.stringify(node));
                await setNode(graphGrid, setGraphGrid, node, NODE_TO_BE_PROCESSED, 0);
                queue.enqueue({x: i2, y: j2});
            }
        }

        await setNode(graphGrid, setGraphGrid, node, NODE_PROCESSED, 0);
    }

    let grid = graphGrid.slice();
    for(let i = 0; i < n; i++) {
        for(let j = 0; j < m; j++) {
            if(grid[i][j] === NODE_PROCESSED) {
                grid[i][j] = EMPTY_CELL;
            }
        }
    }
    setGraphGrid(grid);

    let i = arrivalNode.x, j = arrivalNode.y;

    let path = [arrivalNode];
    while(parent[i][j]) {
        const node = parent[i][j];
        path.push(node);
        i = node.x;
        j = node.y;
    }

    for(let i=path.length-1; i>=0; i--) 
        await setNode(graphGrid, setGraphGrid, path[i], PATH, 10);

    await setNode(graphGrid, setGraphGrid, startingNode, DEPARTURE_POINT, 0);
    await setNode(graphGrid, setGraphGrid, arrivalNode, ARRIVAL_POINT, 0);
    return distance[arrivalNode.x][arrivalNode.y];
}

async function dijkstra() {

}

function AlgorithmVisualizer() {
    const graphAlgorithms = [
        {
            name: "DFS",
            description: "DFS algorithm",
            algorithm: dfs,
        },
        {
            name: "BFS",
            description: "BFS algorithm",
            algorithm: bfs,
        },
        {
            name: "Dijkstra",
            description: "Dijkstra's algorithm",
            algorithm: dijkstra,
        },
    ];

    const [keyValue, setKeyValue] = useState(0);

    const [algorithmIndex, setAlgorithmIndex] = useState(null);

    const selectAlgorithm = (index) => {
        setAlgorithmIndex(index);
    };

    const reRender = () => {
        setKeyValue(1*!keyValue);
    }

    const startAlgorithm = (graphGrid, setGraphGrid) => {
        return graphAlgorithms[algorithmIndex].algorithm(graphGrid, setGraphGrid);
    }

    const updateNodes = (start, arrival) => {
        startingNode = start;
        arrivalNode = arrival;
    }

    const updateChildButtons = (value) => {
        runAlgorithm = value;
    }

    return (
        <React.Fragment>
            <CssBaseline />
            <Grid
                container
                pl={3}
                spacing={2}
                alignItems="center"
                justifyContent="center"
                style={{ minHeight: '100vh' }}
            >
                <Grid item xs={2}>
                    <AlgorithmSelector
                        algorithms={graphAlgorithms}
                        selectAlgorithm={selectAlgorithm}
                    />
                </Grid>
                <Grid item xs={10}>
                    <AlgorithmProcess 
                        key={algorithmIndex+parseInt(keyValue)} 
                        reRender={reRender} 
                        algorithm={graphAlgorithms[algorithmIndex]} 
                        startAlgorithm={startAlgorithm}
                        updateNodes={updateNodes}
                        updateChildButtons={updateChildButtons}/>
                </Grid>
            </Grid>
        </React.Fragment>
    );
}

export default AlgorithmVisualizer;
