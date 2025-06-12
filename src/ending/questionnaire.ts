import survey from '@jspsych/plugin-survey';
import '@jspsych/plugin-survey/css/survey.css';

import { varSystem, expInfo } from "../settings";
import { SURVEY_INFO, TEXT } from "../task-fun/text";

function gen_survey_content(lang) {
  if (!SURVEY_INFO || !SURVEY_INFO.TITLE_INFO || !SURVEY_INFO.TITLE_INFO[lang]) {
      return { pages: [] };
  }

  let pages = [
      {
          name: "page1",
          elements: [
              {
                  type: "html",
                  html: SURVEY_INFO.TITLE_INFO[lang],
              },
              {
                  type: "html",
                  html: SURVEY_INFO.DESCRIPTION[lang],
              },
              {
                  type: "text",
                  title: SURVEY_INFO.AGE_QUES[lang],
                  name: "age",
                  isRequired: true,
                  size: 5,
              },
              {
                  type: "radiogroup",
                  title: SURVEY_INFO.SEX_QUES[lang],
                  name: "sex",
                  choices: SURVEY_INFO.SEX_OPT[lang],
                  isRequired: true,
              },
              {
                  type: "text",
                  title: SURVEY_INFO.STRATEGY_QUES[lang],
                  name: "strategy",
                  isRequired: false,
                  rows: 3,
              },
              {
                  type: "radiogroup",
                  title: SURVEY_INFO.ATTENTION_QUES[lang],
                  name: "attention",
                  choices: SURVEY_INFO.ATTENTION_OPT[lang],
                  isRequired: true,
              },
              {
                type: "radiogroup",
                title: SURVEY_INFO.EFFORT_QUES[lang],
                name: "seriousness",
                choices: SURVEY_INFO.EFFORT_OPT[lang],
                isRequired: true,
            },
              {
                  type: "text",
                  title: SURVEY_INFO.COMMENT_QUES[lang],
                  name: "comments",
                  isRequired: false,
                  rows: 5,
              },
          ]
      }
  ];

  return { pages };
}

const survey_content = gen_survey_content(expInfo.LANG);

export const survey_screen = {
  type: survey,
  survey_json: survey_content,
  button_label_finish: function() {
      return TEXT.submitButton[expInfo.LANG];
  },
  show_question_numbers: "on",
  on_load: function(data) {
      varSystem.TRACK = false;
  },
};
