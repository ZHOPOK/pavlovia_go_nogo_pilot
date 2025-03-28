/**
 * jspsych-pit-instructions
 * Sam Zorowitz
 *
 * plugin for running one trial of the robot factory PIT task
 *
 **/

jsPsych.plugins["pit-trial"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'pit-trial',
    description: '',
    parameters: {
      robot_rune: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Robot rune',
        description: 'Filename of rune image in static folder.'
      },
      scanner_color: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Scanner color',
        description: 'Color of scanner light.'
      },
      outcome_correct: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Outcome correct',
        default: '+10',
        description: 'Outcome to present on correct action.',
      },
      outcome_incorrect: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Outcome incorrect',
        default: '-10',
        description: 'Outcome to present on incorrect action.',
      },
        choice_color: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Choice color',
        default: '#CCAA3B',
        description: 'Indication for the type of action.'
      },
      outcome_color: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Outcome color',
        description: 'Color of outcome text.'
      },
      correct: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Correct response',
        description: 'Correct response for trial.'
      },
      rune_set: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Rune font',
        default: 'elianto',//elianto
        description: 'Rune font style [elianto, bacs1, bacs2].'
      },
      valid_responses: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: [ ],
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      animation_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Animation duration',
        default: 850,//noam 1500
        description: 'How long before keyboard listener should start.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: 1500,//noam 1500
        description: 'How long to show trial before it ends.'
      },
      feedback_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Feedback duration',
        default: 1200,//noam 1000
        description: 'How long to show feedback before it ends.'
      },
    }
  };

  plugin.trial = function(display_element, trial) {

    //---------------------------------------//
    // Define HTML.
    //---------------------------------------//

    // Initialize HTML.
    var new_html = '';

    // Insert CSS (window animation).
    new_html += `<style>
    body {
      height: 100vh;
      max-height: 100vh;
      overflow: hidden;
      position: fixed;
      background: -webkit-gradient(linear, left bottom, left top, from(#808080), color-stop(50%, #606060), color-stop(50%, rgba(28, 25, 23, 0.5)), to(rgba(179, 230, 230, 0.5)));
      background: linear-gradient(0deg, #808080 0%, #606060 50%, #A0A0A0 50%, #D3D3D3 100%);
    }
    .jspsych-content-wrapper {
      overflow: hidden;
    }
    @-webkit-keyframes pavlovian {
      0%    {border-bottom-color: rgba(0, 0, 0, 0);}
      90%   {border-bottom-color: rgba(0, 0, 0, 0);}
      100%  {border-bottom-color: ${trial.scanner_color};}
    }
    @keyframes pavlovian {
      0%    {border-bottom-color: rgba(0, 0, 0, 0);}
      90%   {border-bottom-color: rgba(0, 0, 0, 0);}
      100%  {border-bottom-color: ${trial.scanner_color};}
    }
     </style>`;

    // Add robot factor wrapper.
    new_html += '<div class="factory-wrap">';

    // Add factory machine parts (back).
    new_html += '<div class="machine-back"></div>';
    new_html += '<div class="conveyor"></div>';
    new_html += '<div class="shadows"></div>';

    // Add robot 1 (active).
    new_html += '<div class="robot" status="active">';
    new_html += '<div class="antenna"></div>';
    new_html += '<div class="head"></div>';
    new_html += '<div class="torso">';
    new_html += '<div class="left"></div>';
    new_html += '<div class="right"></div>';
    new_html += `<div class="rune" set="${trial.rune_set}">${trial.robot_rune}</div></div>`;
    new_html += '<div class="foot"></div></div>';

    // Add robot 2 (hidden).
    new_html += '<div class="robot" status="hidden">';
    new_html += '<div class="antenna"></div>';
    new_html += '<div class="head"></div>';
    new_html += '<div class="torso">';
    new_html += '<div class="left"></div>';
    new_html += '<div class="right"></div>';
    new_html += `<div class="rune"></div></div>`;
    new_html += '<div class="foot"></div></div>';

    // Add factory window.
    new_html += `<div class="scanner-light" style="border-bottom-color: ${trial.scanner_color}"></div>`;

    // Add factory machine parts (front).
    new_html += '<div class="machine-front">';
    new_html += '<div class="score-container">';
    //new_html += '<div class="action-indicator">'; // id="choice"
    new_html += '<div class="score" id="outcome"></div>';
    new_html += '</div></div>';
    new_html += '<div class="machine-top"></div>';
    
    //add space-bar indication
    
    new_html += '<div class="space-bar"></div>';


    // Close wrapper.
    new_html += '</div>';

    // Display HTML
    display_element.innerHTML = new_html;

    //---------------------------------------//
    // Response handling.
    //---------------------------------------//

    // Initialize response
    var all_responses = [];
    var response = {
      rt: -1,
      key: -1
    };
    
    //var browser_interactions = [];

     browser_interactions
    // Record any response
    var any_response = function(info) {
      all_responses.push(info.rt);
    };

    // Feedback phase
    var after_response = function(info) {

      // Kill any timeout handlers / keyboard listeners
      jsPsych.pluginAPI.clearAllTimeouts();
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);

      // Record response (if any made)
      if (info != null) {
        response = info;
      }

      // Define accuracy
      if (trial.correct == response.key) {
        response.accuracy = 1;
      } else {
        response.accuracy = 0;
      }

      // Define outcome
      if (response.accuracy == 1) {
        trial.outcome = trial.outcome_correct;
      } else {
        trial.outcome = trial.outcome_incorrect;
      }


   // if (response.key == 32) {
     //   trial.choice_color = '#CCAA3B';
     // } else {
        trial.choice_color = '#F8F8F8';
      //}
      
      // Present outcome
      document.getElementById("outcome").innerHTML = trial.outcome;
      document.getElementById("outcome").style.color = trial.outcome_color;
     // document.getElementById("choice").style.color = "blue";
 

      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.feedback_duration);

    };
    
    // End trial
    var end_trial = function() {
                  
                  


      // Kill any timeout handlers / keyboard listeners
      jsPsych.pluginAPI.clearAllTimeouts();
      jsPsych.pluginAPI.cancelKeyboardResponse(keyboardSuperListener);
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // Store data
      var trial_data = {
        "rune": trial.robot_rune,
        "rune_set": trial.rune_set,
        "hex": trial.scanner_color,
        "correct": trial.correct,
        "choice": response.key,
        "rt": response.rt,
        "accuracy": response.accuracy,
        "outcome": trial.outcome,
        "keys": all_responses,
        "total_keys": all_responses.length,
        "age": age,
        "subject": subj,
        "participantId": participant_ID,
       // "browser_interactions":browser_interactions

      };


      // Clear the display
      display_element.innerHTML = '';

      // End trial
      jsPsych.finishTrial(trial_data);

    };

    // Start the response listener
    if (trial.valid_responses != jsPsych.NO_KEYS) {

      // Task keyboardListener
      var keyboardListener = "";
      setTimeout(function() {
        keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.valid_responses,
          rt_method: 'performance',
          persist: false, //false noam
          allow_held_key: false
        });
      }, trial.animation_duration);

      // Universal keyboardListener
      var keyboardSuperListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: any_response,
          valid_responses: trial.valid_responses,
          rt_method: 'performance',
          persist: true,
          allow_held_key: false
        });

    }

    // End trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        after_response();
      }, trial.animation_duration + trial.trial_duration);
    }

  };

  return plugin;
})();
