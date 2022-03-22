import React, { useState, useEffect, forwardRef } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { blueGrey, lightBlue, teal, orange, red, yellow, cyan } from "@mui/material/colors";
import Button from '@mui/material/Button';
import { styled } from "@mui/material/styles";
import ModeStandbyIcon from '@mui/icons-material/ModeStandby';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import * as AlgorithmProcessLabels from '../labels/AlgorithmProcessLabels.json';
import {EMPTY_CELL, DEPARTURE_POINT, ARRIVAL_POINT} from '../AlgorithmVisualizer';

const StyledButton = styled(Button)(({ theme }) => ({
    ...theme.typography.body2,
    textAlign: "center",
    color: theme.palette.text.secondary,
    height: 60,
    lineHeight: "60px",
}));

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

let settingDeparturePoint = false;
let settingArrivalPoint = false;
let startingAlgorithm = false;
let removingPoint = false;
let sNode = {};
let aNode = {};

function AlgorithmProcess(props, ref) {
    const [graphGrid, setGraphGrid] = useState(
        Array(14)
            .fill()
            .map(() => Array(24).fill(0))
    );
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [startingNode, setStartingNode] = useState({});
    const [arrivalNode, setArrivalNode] = useState({});

    const gridBorder = 1;
    const gridRadius = 15;

    const cellColor = ["white", blueGrey[800], lightBlue["A100"], lightBlue["A100"], lightBlue["A100"], teal[100], teal[200], teal[300]];
    const [clicked, setClicked] = useState(false);

    const countPoints = () => {
        let countStartingPoints = 0;
        let countArrivalPoints = 0;
        
        for(let i=0; i < graphGrid.length; i++) {
            for(let j=0; j < graphGrid[i].length; j++) {
                if(graphGrid[i][j] === DEPARTURE_POINT) {
                    countStartingPoints++;
                    sNode = { x: i, y: j };
                    setStartingNode(sNode);
                } else if(graphGrid[i][j] === ARRIVAL_POINT) {
                    countArrivalPoints++;
                    aNode = { x: i, y: j };
                    setArrivalNode(aNode);
                }
            }
        }
        props.updateNodes(sNode, aNode);
        return [countStartingPoints, countArrivalPoints];
    }

    const buttonVisibility = () => {
        let currentActions = Object.create(actions);
        for(let i=0; i<4; i++) {
            currentActions[i].disabled = (settingDeparturePoint || settingArrivalPoint || startingAlgorithm || removingPoint);
        }

        const [countStartingPoints, countArrivalPoints] = countPoints();
        if(countStartingPoints) 
            currentActions[0].disabled = true;
        if(countArrivalPoints) 
            currentActions[1].disabled = true;

        currentActions[5].disabled = !(settingDeparturePoint || settingArrivalPoint || startingAlgorithm || removingPoint);
        setActions(currentActions);
    }

    const setDeparturePoint = () => {
        settingDeparturePoint = true;
        buttonVisibility();     
    }

    const setArrivalPoint = () => {
        settingArrivalPoint = true;
        buttonVisibility();
    }

    const startAlgorithm = async () => {
        if(!actions[0].disabled || !actions[1].disabled) {
            setOpenSnackbar(true);
            return;
        }

        startingAlgorithm = true;
        buttonVisibility();
        props.updateChildButtons(startingAlgorithm);
        await props.startAlgorithm(graphGrid, setGraphGrid);
        cancelAction();
    }

    const deletePoint = () => {
        removingPoint = true;
        buttonVisibility();
    }

    const cancelAction = () => {
        settingDeparturePoint = settingArrivalPoint = startingAlgorithm = removingPoint = false;
        props.updateChildButtons(startingAlgorithm);
        buttonVisibility();
    }

    const [actions, setActions] = useState([
        {
            name: "Set departure point",
            icon: <KeyboardArrowRightIcon fontSize="large"/>,
            padding: 0,
            disabled: false,
            action: () => setDeparturePoint(),
        },
        {
            name: "Set arrival point",
            icon: <ModeStandbyIcon/>,
            padding: 1,
            disabled: false,
            action: () => setArrivalPoint()
        },
        {
            name: "Delete point",
            icon: <RemoveIcon/>,
            padding: 1,
            disabled: false,
            action: () => deletePoint()
        },
        {
            name: "Start algorithm",
            icon: <PlayArrowIcon fontSize="large"/>,
            padding: 1,
            disabled: false,
            action: () => startAlgorithm()
        },
        {
            name: "Clean grid",
            icon: <DeleteIcon/>,
            padding: 1,
            disabled: false,
            action: () => props.reRender()
        },
        {
            name: "Cancel action",
            icon: <CloseIcon/>,
            padding: 1,
            disabled: true,
            action: () => cancelAction()
        }
    ]);

    const selectCell = (row, column) => {
        if (!clicked || graphGrid[row][column] > 1 || !actions[5].disabled) return;
        
        let grid = graphGrid.slice();
        grid[row][column] = 1 * !grid[row][column];
        setGraphGrid(grid);
    };

    const setPoint = (row, column) => {
        let grid = graphGrid.slice();
        
        if(settingDeparturePoint) {
            grid[row][column] = DEPARTURE_POINT;
            cancelAction();
        } else if(settingArrivalPoint) {
            grid[row][column] = ARRIVAL_POINT;
            cancelAction();
        } else if(removingPoint) {
            grid[row][column] = EMPTY_CELL;
        }

        setGraphGrid(grid);
    }

    return (
        <React.Fragment>
            {props.algorithm && (
                <Grid
                    container
                    alignItems="center"
                    justifyContent="center"
                    onMouseDown={() => setClicked(true)}
                    onMouseUp={() => setClicked(false)}
                >
                    <Grid item xs={10}>
                        <Box
                            sx={{
                                display: "grid",
                                gap: 2,
                            }}
                        >
                            <Typography
                                variant="h5"
                                component="div"
                                gutterBottom
                                align="center"
                            >
                                {props.algorithm.description}
                            </Typography>

                            <Grid container spacing={0} pl={10}>
                                <Grid container item xs>
                                    {graphGrid.map((row, i) => {
                                        return row.map((column, j) => (
                                            <React.Fragment key={ i.toString() + "-" + j.toString() } >
                                                <Paper
                                                    sx={{
                                                        borderLeft: gridBorder,
                                                        borderRight: gridBorder * (j === row.length - 1),
                                                        borderTop: gridBorder,
                                                        borderBottom: gridBorder * (i === graphGrid.length - 1),
                                                        borderColor: blueGrey[200],
                                                        width: 50,
                                                        height: 50,
                                                        borderTopLeftRadius: i === 0 && gridRadius * (j === 0),
                                                        borderTopRightRadius: i === 0 && gridRadius * (j === row.length - 1),
                                                        borderBottomLeftRadius: i === graphGrid.length - 1 && gridRadius * (j === 0),
                                                        borderBottomRightRadius: i === graphGrid.length - 1 && gridRadius * (j === row.length - 1),
                                                        backgroundColor: cellColor[column],
                                                    }}
                                                    elevation={0}
                                                    square={true}
                                                    onMouseEnter={() => selectCell(i, j) }
                                                    onMouseDown={() => setPoint(i, j) }
                                                >
                                                    {i === startingNode.x && j === startingNode.y && <KeyboardArrowRightIcon sx={{ width: 50, height: 50 }}/>}
                                                    {i === arrivalNode.x && j === arrivalNode.y && <ModeStandbyIcon sx={{ width: 50, height: 50 }}/>}
                                                </Paper>
                                                {j === row.length - 1 && (
                                                    <Box width="100%" />
                                                )}
                                            </React.Fragment>
                                        ));
                                    })}
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                    <Grid item 
                          xs={2} 
                          pr={3} 
                          sx={{
                            display: "grid",
                            gap: 2,
                          }}
                    >
                        {actions.map((action) => (
                            <StyledButton 
                                        key={action.name}
                                        fullWidth={true} 
                                        sx={{ borderRadius: 4, boxShadow: 4 }}
                                        onClick={action.action}
                                        disabled={action.disabled}>
                                {action.icon} 
                                <Typography pl={action.padding} variant="body2" component="div" align="center">
                                    {action.name}
                                </Typography>
                            </StyledButton>      
                        ))}
                    </Grid>
                </Grid>
            )}

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
                <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
                    {AlgorithmProcessLabels.default.algorithmError}
                </Alert>
            </Snackbar>
        </React.Fragment>
    );
}

export default forwardRef(AlgorithmProcess);