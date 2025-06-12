import htmlButtonResponse from "@jspsych/plugin-html-button-response";
import { jsPsych } from "../jsp";

export const debrief_screen = {
  type: htmlButtonResponse,
  stimulus: `
    <div style="font-family: 'Open Sans', sans-serif; font-size: 20px; color: black; margin: 0 auto; padding: 20px; max-width: 1100px; text-align: left; padding-top: 70px;">
      <h2 style="color: darkblue; text-align: center; margin-bottom: 80px; font-size: 50px;">Debriefing</h2>
      <div style="margin-left: 0; padding-left: 20px;">
        <p>Thank you for taking part in this experiment. We’re studying how two sets of information can affect each other when you try to remember them at the same time. This helps us understand how memory works when you need to handle a lot of information quickly.</p>
        <p>More specifically, we looked at how knowing the order of recall affects memory. Some participants knew the recall order (right first, then left), while others had to recall in a random order. This let us see if having a set order makes it easier to remember things.</p>
        <p>Your participation helps us learn more about how memory works and what factors make it easier or harder to remember things.</p>
        <p>If you have any remaining questions regarding the study, please contact Noah Rischert at <a href="mailto:rischert@psychologie.uzh.ch">rischert@psychologie.uzh.ch</a>.</p>
        <div style="text-align: right;">
          <button id="finish-button" style="margin-top: 20px; padding: 15px 30px; font-size: 18px; font-weight: bold;">Finish</button>
        </div>
      </div>
      <div style="margin-left: 0; padding-left: 20px; margin-top: 100px;">
        <p><strong>Literature:</strong></p>
        <ul style="padding-left: 20px; list-style-type: disc;">
          <li style="margin-bottom: 15px;">Cocchini, G., Logie, R. H., Della Sala, S., MacPherson, S. E., & Baddeley, A. D. (2002). Concurrent performance of two memory tasks: Evidence for domain-specific working memory systems. Memory & Cognition, 30(7), 1086–1095. <a href="https://doi.org/10.3758/bf03194326">https://doi.org/10.3758/bf03194326</a></li>
          <li style="margin-bottom: 15px;">Markov, Y. A., Tiurina, N. A., & Utochkin, I. S. (2019). Different features are stored independently in visual working memory but mediated by object-based representations. Acta Psychologica, 197, 52–63. <a href="https://doi.org/10.1016/j.actpsy.2019.05.003">https://doi.org/10.1016/j.actpsy.2019.05.003</a></li>
          <li style="margin-bottom: 15px;">Oberauer, K., & Kliegl, R. (2004). Simultaneous cognitive operations in working memory after Dual-Task practice. Journal of Experimental Psychology. Human Perception and Performance, 30(4), 689–707. <a href="https://doi.org/10.1037/0096-1523.30.4.689">https://doi.org/10.1037/0096-1523.30.4.689</a></li>
          <li style="margin-bottom: 15px;">Uittenhove, K., Chaabi, L., Camos, V., & Barrouillet, P. (2019). Is working memory storage intrinsically domain-specific? Journal of Experimental Psychology. General, 148(11), 2027–2057. <a href="https://doi.org/10.1037/xge0000566">https://doi.org/10.1037/xge0000566</a></li>
          <li style="margin-bottom: 15px;">Wang, B., Cao, X., Theeuwes, J., Olivers, C. N. L., & Wang, Z. (2017). Separate capacities for storing different features in visual working memory. Journal of Experimental Psychology. Learning, Memory, and Cognition, 43(2), 226–236. <a href="https://doi.org/10.1037/xlm0000295">https://doi.org/10.1037/xlm0000295</a></li>
          <li style="margin-bottom: 15px;">Zhang, J., Ye, C., Sun, H., Zhou, J., Liang, T., Li, Y., & Liu, Q. (2022). The passive state: A protective mechanism for information in working memory tasks. Journal of Experimental Psychology. Learning, Memory, and Cognition, 48(9), 1235–1248. <a href="https://doi.org/10.1037/xlm0001092">https://doi.org/10.1037/xlm0001092</a></li>
        </ul>
      </div>
    </div>
  `,
  choices: [], // No choices since we are handling the button manually
  on_load: function() {
    const finishButton = document.getElementById('finish-button') as HTMLButtonElement;
    finishButton.addEventListener('click', function() {
      jsPsych.finishTrial();
    });
  }
};
