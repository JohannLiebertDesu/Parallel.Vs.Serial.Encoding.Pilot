import instructions from "@jspsych/plugin-instructions";

// Define your instruction slides with images
// We use some iffy chatGPT code to determine the format of the gifs, but that way it no longer flickers. See main.css for the code defining these instruction images.
const instructionSlides = [
  '<div class="custom-instruction-slide"><img src="assets/instructionImages/Slide1.gif" class="instruction-image"></div>',
  '<div class="custom-instruction-slide"><img src="assets/instructionImages/Slide2.gif" class="instruction-image"></div>',
  '<div class="custom-instruction-slide"><img src="assets/instructionImages/Slide3.gif" class="instruction-image"></div>',
  '<div class="custom-instruction-slide"><img src="assets/instructionImages/Slide4.gif" class="instruction-image"></div>',
  '<div class="custom-instruction-slide"><img src="assets/instructionImages/Slide5.gif" class="instruction-image"></div>',
  '<div class="custom-instruction-slide"><img src="assets/instructionImages/Slide6.gif" class="instruction-image"></div>'
];


// Log instruction slides
console.log("Instruction Slides: ", instructionSlides);

// Define the instruction slides configuration
export var instructionSlidesConfig = {
  type: instructions,
  pages: instructionSlides,
  button_label_next: "Continue",
  button_label_previous: "Back",
  show_clickable_nav: true,
};