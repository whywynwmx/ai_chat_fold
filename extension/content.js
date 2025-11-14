/*
  AI Chat Fold/Unfold - content.js
  This script is injected into the target web pages.
*/

// --- Configuration ---
// Note: These selectors are based on the site's structure as of analysis
// and may break if the site updates its layout. These are likely dynamic
// class names and will need a more robust selection method in the future.
const siteConfigs = {
  deepseek: {
    chatContainerSelector: 'div.dad65929',
    answerContainerSelector: 'div.ds-message:has(div.ds-markdown)', // AI message container
    answerContentSelector: 'div.ds-markdown', // The actual content to fold
    globalControlsSelector: 'div.f8d1e4c0', // The chat title bar
    observerTargetSelector: 'div.ds-scroll-area' // A stable parent for observing mutations
  },
  chatgpt: {
    // TODO: Add selectors for ChatGPT
  },
  gemini: {
    // TODO: Add selectors for Gemini
  }
};

// --- State ---
let currentSiteConfig = null;
let observer = null;

// --- Functions ---

/**
 * Detects which site the script is running on based on the hostname.
 * @returns {object|null} The configuration for the detected site, or null.
 */
function detectSite() {
  const hostname = window.location.hostname;
  if (hostname.includes('deepseek.com')) {
    return siteConfigs.deepseek;
  }
  if (hostname.includes('chat.openai.com')) {
    return siteConfigs.chatgpt;
  }
  if (hostname.includes('gemini.google.com')) {
    return siteConfigs.gemini;
  }
  return null;
}

/**
 * Adds a fold/unfold button to a single AI answer element.
 * It polls for the content element to appear before adding the button.
 * @param {HTMLElement} answerEl - The DOM element containing the AI answer.
 */
function addFoldButton(answerEl) {
  // Prevent adding a button if one already exists
  if (answerEl.querySelector('.aifold-fold-button')) {
    return;
  }

  console.log('AI Fold Debug: Attempting to add button to answer element:', answerEl);

  // Poll for the content element to appear, as it might render after the container
  const pollForContent = setInterval(() => {
    const contentEl = answerEl.querySelector(currentSiteConfig.answerContentSelector);
    
    if (contentEl) {
      clearInterval(pollForContent);
      console.log('AI Fold Debug: ...found content element to fold. Adding button.', contentEl);

      const button = document.createElement('button');
      button.textContent = '折叠';
      button.className = 'aifold-fold-button';
      
      button.addEventListener('click', () => {
        const isFolded = contentEl.classList.toggle('aifold-folded-content');
        button.textContent = isFolded ? '展开' : '折叠';
        answerEl.classList.toggle('aifold-container-folded');
      });

      // Prepend the button to the answer container for visibility
      answerEl.prepend(button);
    }
  }, 200); // Check every 200ms

  // Stop polling after a few seconds to prevent infinite loops on unexpected structures
  setTimeout(() => {
    clearInterval(pollForContent);
  }, 5000);
}

/**

 * Adds global "Fold All" and "Unfold All" buttons to the page.

 */

function addGlobalControls() {

  const targetEl = document.querySelector(currentSiteConfig.globalControlsSelector);

  console.log('AI Fold Debug: Searching for global controls container', currentSiteConfig.globalControlsSelector, 'Found:', !!targetEl);

  if (!targetEl) {

    console.error('AI Fold: Global controls target element not found.');

    return;

  }



  const controlsContainer = document.createElement('div');

  controlsContainer.className = 'aifold-global-controls';



  const foldAllButton = document.createElement('button');

  foldAllButton.textContent = '全部折叠';

  foldAllButton.className = 'aifold-global-button';

  foldAllButton.addEventListener('click', () => {

      const allAnswers = document.querySelectorAll(currentSiteConfig.answerContainerSelector);

      allAnswers.forEach(answerEl => {

        const contentEl = answerEl.querySelector(currentSiteConfig.answerContentSelector);

        const button = answerEl.querySelector('.aifold-fold-button');

        if (contentEl && !contentEl.classList.contains('aifold-folded-content')) {

          contentEl.classList.add('aifold-folded-content');

          answerEl.classList.add('aifold-container-folded');

          if (button) button.textContent = '展开';

        }

      });

    });

  

    const unfoldAllButton = document.createElement('button');

    unfoldAllButton.textContent = '全部展开';

    unfoldAllButton.className = 'aifold-global-button';

    unfoldAllButton.addEventListener('click', () => {

      const allAnswers = document.querySelectorAll(currentSiteConfig.answerContainerSelector);

      allAnswers.forEach(answerEl => {

        const contentEl = answerEl.querySelector(currentSiteConfig.answerContentSelector);

        const button = answerEl.querySelector('.aifold-fold-button');

        if (contentEl && contentEl.classList.contains('aifold-folded-content')) {

          contentEl.classList.remove('aifold-folded-content');

          answerEl.classList.remove('aifold-container-folded');

          if (button) button.textContent = '折叠';

        }

      });

    });



  controlsContainer.appendChild(foldAllButton);

  controlsContainer.appendChild(unfoldAllButton);



  // Using prepend to make it appear at the top of the container

  targetEl.prepend(controlsContainer);

}



/**

 * The callback for the MutationObserver.

 * Finds new answer elements and adds fold buttons to them.

 * @param {MutationRecord[]} mutationsList - The list of mutations.

 */

function handleMutations(mutationsList) {

  console.log(`AI Fold Debug: MutationObserver detected ${mutationsList.length} mutations.`);

  for (const mutation of mutationsList) {

    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {

      console.log(`AI Fold Debug: ${mutation.addedNodes.length} nodes added.`);

      mutation.addedNodes.forEach(node => {

        if (node.nodeType === Node.ELEMENT_NODE) {

          // Check if the added node itself is an answer container

          if (node.matches(currentSiteConfig.answerContainerSelector)) {

            console.log('AI Fold Debug: Added node is an answer container. Adding button.', node);

            addFoldButton(node);

          }

          // Check for answer containers within the added node

          const answers = node.querySelectorAll(currentSiteConfig.answerContainerSelector);

          if (answers.length > 0) {

            console.log(`AI Fold Debug: Found ${answers.length} answer containers in added node.`, node);

            answers.forEach(addFoldButton);

          }

        }

      });

    }

  }

}



/**

 * Initializes the folding functionality on the page.

 */

function initialize() {

  if (!currentSiteConfig) {

    console.log('AI Fold: No configuration for this site.');

    return;

  }



  // Add global controls

  addGlobalControls();



  // --- Initial Scan ---

  // Find existing answers and add buttons

  const initialAnswers = document.querySelectorAll(currentSiteConfig.answerContainerSelector);

  console.log(`AI Fold Debug: Found ${initialAnswers.length} existing answer containers on init.`);

  initialAnswers.forEach(addFoldButton);



  // --- Observer for Real-time Additions ---

  const observerTarget = document.querySelector(currentSiteConfig.observerTargetSelector || currentSiteConfig.chatContainerSelector);

  if (!observerTarget) {

    console.error('AI Fold: Observer target not found after polling.');

    return;

  }

  observer = new MutationObserver(handleMutations);

  observer.observe(observerTarget, {

    childList: true,

    subtree: true

  });

  

  // --- Polling for Resilience ---

  // This acts as a fallback for SPA navigations that might replace the observer target.

  setInterval(() => {

    const allAnswers = document.querySelectorAll(currentSiteConfig.answerContainerSelector);

    allAnswers.forEach(addFoldButton);

  }, 2000); // Rescan every 2 seconds



  console.log('AI Chat Fold/Unfold initialized for:', window.location.hostname, 'on observer target:', observerTarget);

}



// --- Main Execution ---



/**

 * Polls the page until the main chat container is found, then starts the script.

 */

function start() {

  currentSiteConfig = detectSite();

  if (!currentSiteConfig) {

    return; // Not a supported site

  }



  const pollSelector = currentSiteConfig.observerTargetSelector || currentSiteConfig.chatContainerSelector;

  if (!pollSelector) return;



  console.log('AI Fold Debug: Polling for main container:', pollSelector);

  const polling = setInterval(() => {

    const container = document.querySelector(pollSelector);

    if (container) {

      console.log('AI Fold Debug: Main container found! Initializing.');

      clearInterval(polling);

      initialize();

    }

  }, 500);

}



start();






