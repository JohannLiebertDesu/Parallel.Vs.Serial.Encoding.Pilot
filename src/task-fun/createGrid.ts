/**
 * Creates a grid layout for positioning stimuli on the screen.
 * The grid is marked such that border cells and the middle column cells are initially occupied.
 * Allows random selection of cells based on specific criteria.
 * @return An array of GridCell objects representing the grid cells.
 */

import FullscreenPlugin from "@jspsych/plugin-fullscreen";

// Define screen and grid properties
export const screenWidth = window.screen.width; // Width of the user's screen
export const screenHeight = window.screen.height; // Height of the user's screen
export const numColumns = 13; // Number of columns in the grid
export const numRows = 6; // Number of rows in the grid

// Parameters to control adjacency of occupied cells
const ADJACENCY_LIMIT = 1; // Maximum horizontal/vertical proximity to mark cells as occupied
const DIAGONAL_ADJACENCY = 1; // Maximum diagonal proximity to mark cells as occupied

// Calculate cell dimensions based on screen size and grid structure
export const cellSize = calculateCellSize(screenWidth, screenHeight, numColumns, numRows);
export const radius = Math.min(cellSize.cellWidth, cellSize.cellHeight) / 2.3; // Radius for stimuli size

// Define plugins to enable and disable fullscreen mode
export const goFullScreen = {
    type: FullscreenPlugin,
    fullscreen_mode: true
}

export const closeFullScreen = {
    type: FullscreenPlugin,
    fullscreen_mode: false
}

export const centerX = screenWidth / 2;
export const centerY = screenHeight / 2;


// Function to calculate cell dimensions based on grid and screen sizes
export function calculateCellSize(screenWidth: number, screenHeight: number, numColumns: number, numRows: number) {
    const cellWidth = screenWidth / numColumns;
    const cellHeight = screenHeight / numRows;
    return {
        cellWidth,
        cellHeight
    };
}

// Define the structure of each cell in the grid
export type GridCell = {
    id: string; // Unique identifier for the cell
    occupied: boolean; // Indicates if the cell is currently occupied
    x: number; // X-coordinate (column) of the cell
    y: number; // Y-coordinate (row) of the cell
};

// Generate a grid of cells with specified dimensions and mark border/middle column cells as occupied
export function createGrid(numColumns: number, numRows: number): GridCell[] {
    const grid: GridCell[] = [];
    const middleColumnIndex = Math.floor(numColumns / 2); // Calculate the index of the middle column
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numColumns; col++) {
            // Adjust border logic:
            // - Top or bottom row
            // - First two or last two columns
            const isBorder = (row === 0 || row === numRows - 1) || (col < 2 || col >= numColumns - 2);
            const isMiddleColumn = col === middleColumnIndex;
            
            grid.push({
                id: `${col + 1}${String.fromCharCode(65 + row)}`,
                occupied: isBorder || isMiddleColumn,
                x: col,
                y: row
            });
        }
    }
    return grid;
}

// Select a random cell on the specified side (left, right, or both) and mark it as occupied
export function selectAndOccupyCell(grid: GridCell[], side: 'left' | 'right' | 'both') {
    // Filter for cells that are available (not occupied) based on the specified side
    let availableCells = grid.filter(cell => !cell.occupied && (
        side === 'both' ||
        (side === 'left' && cell.x < numColumns / 2) ||
        (side === 'right' && cell.x >= numColumns / 2)
    ));

    if (availableCells.length === 0) return null; // Return null if no cells are available

    let selectedCell = availableCells[Math.floor(Math.random() * availableCells.length)];
    
    // Mark the selected cell and adjacent cells as occupied
    markAdjacentCellsAsOccupied(grid, selectedCell);
    return selectedCell;
}

// Mark a cell and its adjacent cells as occupied based on defined proximity limits
export function markAdjacentCellsAsOccupied(grid: GridCell[], selectedCell: GridCell) {
    grid.forEach(cell => {
        // Mark cells within the specified horizontal/vertical and diagonal proximity as occupied
        if (
            (Math.abs(cell.x - selectedCell.x) <= ADJACENCY_LIMIT && cell.y === selectedCell.y) ||
            (Math.abs(cell.y - selectedCell.y) <= ADJACENCY_LIMIT && cell.x === selectedCell.x) ||
            (Math.abs(cell.x - selectedCell.x) === DIAGONAL_ADJACENCY && Math.abs(cell.y - selectedCell.y) === DIAGONAL_ADJACENCY)
        ) {
            cell.occupied = true;
        }
    });
    // Ensure the selected cell is marked as occupied
    selectedCell.occupied = true;
}

// Reset the grid to its initial state, marking border and middle column cells as occupied
export function resetGrid(grid: GridCell[], numColumns: number, numRows: number) {
    const middleColumnIndex = Math.floor(numColumns / 2); // Middle column index
    grid.forEach(cell => {
        // Update border condition to match createGrid
        const isBorder = (cell.y === 0 || cell.y === numRows - 1) || (cell.x < 2 || cell.x >= numColumns - 2);
        const isMiddleColumn = cell.x === middleColumnIndex;
        cell.occupied = isBorder || isMiddleColumn;
    });
}
