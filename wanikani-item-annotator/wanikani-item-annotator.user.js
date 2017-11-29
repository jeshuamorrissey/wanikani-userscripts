// ==UserScript==
// @name       WaniKani Item Annotator
// @version    3.0
// @description  Annoates item on the radical, kanji and vocab pages with their SRS level.
// @require https://greasyfork.org/scripts/34539-wanikani-api/code/WaniKani%20API.js?version=226222
// @include https://www.wanikani.com/radicals*
// @include https://www.wanikani.com/kanji*
// @include https://www.wanikani.com/vocabulary*
// @include https://www.wanikani.com/settings/account*
// @include https://www.wanikani.com/level/*
// @copyright  2017, Jeshua
// @grant        GM_registerMenuCommand
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// ==/UserScript==

/**
 * Mapping of SRS --> Object, where the object contains a series
 * of transformation colors. These transformations will be applied
 * via the element.style property, so should have priority.
 */
let newColors = {
  'apprentice': {
    'background': '#f100a0',
    'border': '#f100a0',
    'gradient_start': '#f0a',
    'gradient_end': '#dd0093'
  },

  'guru': {
    'background': '#882d9e',
    'border': '#882d9e',
    'gradient_start': '#aa38c6',
    'gradient_end': '#882d9e'
  },

  'master': {
    'background': '#294ddb',
    'border': '#294ddb',
    'gradient_start': '#5571e2',
    'gradient_end': '#294ddb'
  },

  'enlighten': {
    'background': '#0093dd',
    'border': '#0093dd',
    'gradient_start': '#0af',
    'gradient_end': '#0093dd'
  }
};

/**
 * Main function: actually annotate the elements. Takes as input information from
 * the WK API as a mapping from Japanese Element --> Object. In this case, the
 * object need only contain the SRS level of the element.
 */
function ColouriseItems(itemMapping, target) {
  // If the target specifies a level, then be more specific.
  let elements = undefined;
  if (target.indexOf('/') >= 0) {
    let target_split = target.split('/');
    let target = target_split[0];
    let level = target_split[1];
    elements = document.querySelectorAll('#level-' + level + '-' + target + ' .character-item')
  } else {
    elements = document.querySelectorAll('.character-item');
  }

  for (let element of elements) {
    // If this isn't actually an element (could happen, who knows), just skip it.
    if (!element.querySelector || !element.style) {
      continue;
    }

    // Get the element containing the japanese information.
    let japaneseElement = element.querySelector('.character');

    // The japanese value to look up in the item mapping is the text of this element.
    let japanese = japaneseElement.textContent;

    // If we happen to be looking at radicals, some of them use pictures instead. It is
    // simpler to use the radical meaning in this case (as there is only one meaning).
    // The meaning is stored in the last list element within the element (for some reason
    // there is a &nbsp; list element first).
    if (target === 'radicals') {
      japanese = element.querySelectorAll('li')[1].textContent.toLowerCase();
    }

    // Find the actual japanese SRS information.
    japanese = itemMapping[japanese.trim()];

    // If we couldn't find the SRS information for the element, or the element hasn't been unlocked
    // yet, just ignore it.
    if (japanese == undefined || !japanese.srs) {
      continue;
    }

    // Find the corresponding colors.
    let colors = newColors[japanese.srs];

    // If the item is burned, then ignore it.
    if (!colors) {
      continue;
    }

    // Actually change the properties. This was essentially taken from the elements already on the page.
    element.style['background'] =
      colors.background + ' linear-gradient(to bottom, ' + colors.gradient_start + ', ' + colors.gradient_end + ')';
    element.style['borderColor'] = colors.border;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Make sure the API key is available.
  if (WaniKaniAPI.getAPIKey() === undefined) {
    console.log('ITEM-ANNOTATOR: No WaniKani API key found!');
    return;
  }

  // Determine which API call we are going to make.
  let targets = ['kanji'];
  if (window.URL.indexOf('vocabulary') >= 0) {
    targets = ['vocabulary'];
  } else if (window.URL.indexOf('radicals') >= 0) {
    targets = ['radicals'];
  } else if (window.URL.indexOf('level') >= 0) {
    let url_split = window.URL.split('/');
    let level = url_split[url_split.length - 1];
    targets = ['kanji/' + level, 'vocabulary/' + level, 'radicals/' + level];
  }

  // Load the API data.
  for (let target of targets) {
    // Need to closure the target parameter, otherwise weird stuff starts to happen.
    (function(target) {
      WaniKaniAPI.load(WaniKaniAPI.apiURL(target), function(xhr) {
        // Parse the response.
        let response = JSON.parse(xhr.response);

        // Build up an item mapping from Kanji --> Information
        let itemMapping = {};

        // Get the actual request information. If the target is vocabulary, for some reason
        // we have to got an additional level into 'request_information.general'. This is
        // probably to account for specialised vocab which will be added later.
        let information = response.requested_information;
        if (target === 'vocabulary') {
          information = information.general;
        }

        for (let item of information) {
          // Extract the character (Kanji) from the item.
          let character = item.character;

          // If we are looking at radicals, use the meaning instead (convert the meaning to
          // the 'user friendly' format).
          if (target.indexOf('radicals') >= 0) {
            character = item.meaning.toLowerCase().replace('-', ' ');
          }

          // Get the SRS level from the item. The 'user_specific' object will be `null` if the item
          // hasn't been unlocked yet. In this case, just set the SRS level to `null`.
          let srs = null;
          if (item.user_specific) {
            srs = item.user_specific.srs;
          }

          // Build the mapping for this character.
          itemMapping[character] = {
            'srs': srs
          };
        }

        // Actually do stuff with this mapping.
        ColouriseItems(itemMapping, target);
      });
    })(target);
  }
});