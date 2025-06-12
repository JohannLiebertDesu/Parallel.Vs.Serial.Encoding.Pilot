# Default experiment

This experiment relies on Node.js (https://nodejs.org/en/) and jsPsych-builder package (https://github.com/bjoluc/jspsych-builder). Please install the dependent package before running the experiment.

After completing local testing, the code is designed for compatibility with a jatos server, and relies on code from jatos to determine participant number.

## How to run the experiment

- run `npm install` to install dependencies
- run `npm start`. After building the project, a browser window will open with the experiment at `localhost:3000`.
- run `npm run build` to build the project for production.

## Experiment description

This experiment is part of a larger group of experiments that aim to clarify to what extent storing two item sets in working memory influences their immediate recall, and how this interaction is modulated by additional factors, such as recall order or item type.

The focus of this specific experiment lies on participant knowledge of recall order, employing a between-participant contrast of a systematic A-B-B-A and a random A-B-A-B or A-B-B-A recall order.

## Experiment.ts

This is the main entry point for the experiment. It is responsible for creating the experiment, and running it. It imports trials from the `trials` folder and concatenates them in a timeline.



## Code contribution:

Authors:
Chenyu Li, Noah Rischert, ChatGPT4o
