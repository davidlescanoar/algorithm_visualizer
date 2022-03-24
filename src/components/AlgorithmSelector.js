import React, { useState } from "react";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Button from '@mui/material/Button';
import * as AlgorithmSelectorLabels from '../labels/AlgorithmSelectorLabels.json';

const Item = styled(Button)(({ theme }) => ({
    ...theme.typography.body2,
    textAlign: "center",
    color: theme.palette.text.secondary,
    height: 100,
    lineHeight: "100px",
}));

function AlgorithmSelector(props) {
    const borderTypes = [
        { border: 0, borderRadius: 4, boxShadow: 4},
        { border: 1, borderColor: "primary.light", borderRadius: 4, boxShadow: 4 },
        { border: 3, borderColor: "info.main", borderRadius: 4, boxShadow: 4 },
    ];

    const [cardBorder, setCardBorder] = useState(Array(3).fill(0));

    const updateCardBorder = (index, borderIndex) => {
        if (cardBorder[index] === 2 && borderIndex !== 2) 
            return;

        let currentCardBorder = Array(3).fill(0);
        if (cardBorder.includes(2) && borderIndex !== 2)
            currentCardBorder = cardBorder.slice();

        currentCardBorder[index] = borderIndex;
        setCardBorder(currentCardBorder);
    };

    const selectAlgorithm = (index) => {
        updateCardBorder(index, 2);
        props.selectAlgorithm(index);
    };

    return (
        <Box
            sx={{
                display: "grid",
                gap: 2,
            }}
        >
            <Typography variant="h5" component="div" gutterBottom align="center">
                {AlgorithmSelectorLabels.default.title}
            </Typography>

            {props.algorithms.map((algorithm, index) => (
                <Item
                    disableRipple = {true}
                    key={algorithm.name}
                    sx={borderTypes[cardBorder[index]]}
                    onMouseOver={() => updateCardBorder(index, 1)}
                    onMouseOut={() => updateCardBorder(index, 0)}
                    onClick={() => selectAlgorithm(index)}
                >
                    <Box sx={cardBorder[index] === 2 ? { fontWeight: 'bold' } : {}}>{algorithm.name}</Box>
                </Item>
            ))}
        </Box>
    );
}

export default AlgorithmSelector;
