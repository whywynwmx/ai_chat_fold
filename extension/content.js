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
  aistudio: {
    chatContainerSelector: 'app-root',
    answerContainerSelector: 'div.chat-turn-container.model', // AI message container (outer container with model class)
    answerContentSelector: 'div.turn-content', // The actual content to fold
    globalControlsSelector: 'ms-chunk-editor ms-toolbar > div', // The toolbar in the chat editor
    observerTargetSelector: 'app-root' // A stable parent for observing mutations
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
  if (hostname.includes('aistudio.google.com')) {
    return siteConfigs.aistudio;
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
  console.log('AI Fold Debug: Using content selector:', currentSiteConfig.answerContentSelector);

  // Poll for the content element to appear, as it might render after the container
  let pollCount = 0;
  const pollForContent = setInterval(() => {
    pollCount++;
    
    // For DeepSeek: check if there are multiple foldable sections (thinking + answer)
    if (currentSiteConfig === siteConfigs.deepseek) {
      const allContentElements = answerEl.querySelectorAll(currentSiteConfig.answerContentSelector);
      
      if (allContentElements.length > 0) {
        clearInterval(pollForContent);
        console.log(`AI Fold Debug: Found ${allContentElements.length} content elements to fold in answer`);
        
        // If there are multiple blocks, add individual fold buttons for each
        if (allContentElements.length > 1) {
          // Reverse the content array so first button controls thinking (last element), second controls answer (first element)
          const reversedElements = Array.from(allContentElements).reverse();
          reversedElements.forEach((contentEl, index) => {
            addIndividualFoldButton(contentEl, index, allContentElements.length);
          });
          return;
        }
        // Otherwise, fall through to single button logic
      }
    }
    
    // For other sites or single content blocks
    const contentEl = answerEl.querySelector(currentSiteConfig.answerContentSelector);
    
    if (pollCount % 5 === 0) {
      console.log(`AI Fold Debug: Poll attempt ${pollCount}, found:`, !!contentEl);
    }
    
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
        
        // For AI Studio: also hide the virtual-scroll-container to collapse the placeholder div
        if (currentSiteConfig === siteConfigs.aistudio) {
          const virtualScrollContainer = contentEl.closest('.virtual-scroll-container');
          if (virtualScrollContainer) {
            virtualScrollContainer.classList.toggle('aifold-folded-content');
            console.log('AI Fold Debug: Toggled virtual-scroll-container, folded:', isFolded);
          } else {
            console.log('AI Fold Debug: virtual-scroll-container not found');
          }
        }
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
 * Adds a fold button for an individual content block (e.g., thinking or answer)
 * @param {HTMLElement} contentEl - The content element to fold
 * @param {number} index - Index of this content block
 * @param {number} total - Total number of content blocks
 */
function addIndividualFoldButton(contentEl, index, total) {
  // Check if this content block already has a button
  const parent = contentEl.parentElement;
  const existingButton = parent.querySelector(`.aifold-fold-button-${index}`);
  if (existingButton) {
    return;
  }

  const button = document.createElement('button');
  
  // Simple labels for all buttons - just "折叠"/"展开"
  const foldLabel = '折叠';
  const unfoldLabel = '展开';
  
  button.textContent = foldLabel;
  button.className = `aifold-fold-button aifold-fold-button-${index}`;
  button.style.marginRight = '8px';
  
  // Store the labels as data attributes for reliable toggling
  button.dataset.foldLabel = foldLabel;
  button.dataset.unfoldLabel = unfoldLabel;
  
  button.addEventListener('click', () => {
    const isFolded = contentEl.classList.toggle('aifold-folded-content');
    
    // Update button text using stored labels
    button.textContent = isFolded ? button.dataset.unfoldLabel : button.dataset.foldLabel;
  });

  // Insert button before the content element
  parent.insertBefore(button, contentEl);
  console.log(`AI Fold Debug: Added fold button for content block ${index + 1}/${total}: "${foldLabel}"`, contentEl);
}

/**

 * Adds global "Fold All" and "Unfold All" buttons to the page.

 */

function addGlobalControls() {
  // Prevent adding duplicate controls
  if (document.querySelector('.aifold-global-controls')) {
    console.log('AI Fold Debug: Global controls already exist, skipping.');
    return;
  }

  // Poll for the target element (especially for AI Studio where toolbar loads later)
  let pollCount = 0;
  const maxPolls = 50; // 10 seconds max
  
  const pollForTarget = setInterval(() => {
    pollCount++;
    const targetEl = document.querySelector(currentSiteConfig.globalControlsSelector);

    if (pollCount % 10 === 0) {
      console.log(`AI Fold Debug: Polling for global controls container (attempt ${pollCount}):`, currentSiteConfig.globalControlsSelector, 'Found:', !!targetEl);
    }

    if (targetEl) {
      clearInterval(pollForTarget);
      console.log('AI Fold Debug: Global controls container found! Adding buttons.');
      createGlobalControlButtons(targetEl);
    } else if (pollCount >= maxPolls) {
      clearInterval(pollForTarget);
      console.error('AI Fold: Global controls target element not found after polling.');
    }
  }, 200);
}

function createGlobalControlButtons(targetEl) {



  const controlsContainer = document.createElement('div');

  controlsContainer.className = 'aifold-global-controls';



  const foldAllButton = document.createElement('button');

  foldAllButton.textContent = '全部折叠';

  foldAllButton.className = 'aifold-global-button';

  foldAllButton.addEventListener('click', () => {

      const allAnswers = document.querySelectorAll(currentSiteConfig.answerContainerSelector);

      allAnswers.forEach(answerEl => {

        // Handle multiple content blocks in the same answer (e.g., thinking + answer)
        const allContentElements = answerEl.querySelectorAll(currentSiteConfig.answerContentSelector);

        allContentElements.forEach((contentEl, index) => {

          const button = answerEl.querySelector(`.aifold-fold-button-${index}`) || answerEl.querySelector('.aifold-fold-button');

          if (contentEl && !contentEl.classList.contains('aifold-folded-content')) {

            contentEl.classList.add('aifold-folded-content');

            answerEl.classList.add('aifold-container-folded');

            if (button) {
              // Use stored labels if available, otherwise replace text
              button.textContent = button.dataset.unfoldLabel || button.textContent.replace('折叠', '展开');
            }

            // For AI Studio: also hide the virtual-scroll-container
            if (currentSiteConfig === siteConfigs.aistudio) {
              const virtualScrollContainer = contentEl.closest('.virtual-scroll-container');
              if (virtualScrollContainer) {
                virtualScrollContainer.classList.add('aifold-folded-content');
              }
            }

          }

        });

      });

    });

  

    const unfoldAllButton = document.createElement('button');

    unfoldAllButton.textContent = '全部展开';

    unfoldAllButton.className = 'aifold-global-button';

    unfoldAllButton.addEventListener('click', () => {

      const allAnswers = document.querySelectorAll(currentSiteConfig.answerContainerSelector);

      allAnswers.forEach(answerEl => {

        // Handle multiple content blocks in the same answer (e.g., thinking + answer)
        const allContentElements = answerEl.querySelectorAll(currentSiteConfig.answerContentSelector);

        allContentElements.forEach((contentEl, index) => {

          const button = answerEl.querySelector(`.aifold-fold-button-${index}`) || answerEl.querySelector('.aifold-fold-button');

          if (contentEl && contentEl.classList.contains('aifold-folded-content')) {

            contentEl.classList.remove('aifold-folded-content');

            answerEl.classList.remove('aifold-container-folded');

            if (button) {
              // Use stored labels if available, otherwise replace text
              button.textContent = button.dataset.foldLabel || button.textContent.replace('展开', '折叠');
            }

            // For AI Studio: also show the virtual-scroll-container
            if (currentSiteConfig === siteConfigs.aistudio) {
              const virtualScrollContainer = contentEl.closest('.virtual-scroll-container');
              if (virtualScrollContainer) {
                virtualScrollContainer.classList.remove('aifold-folded-content');
              }
            }

          }

        });

      });

    });



  controlsContainer.appendChild(foldAllButton);

  controlsContainer.appendChild(unfoldAllButton);



  // For AI Studio toolbar, append to the end; for others, prepend to the top

  if (currentSiteConfig === siteConfigs.aistudio) {
    targetEl.appendChild(controlsContainer);
  } else {
    targetEl.prepend(controlsContainer);
  }

}



/**

 * The callback for the MutationObserver.

 * Finds new answer elements and adds fold buttons to them.

 * @param {MutationRecord[]} mutationsList - The list of mutations.

 */

function handleMutations(mutationsList) {

  console.log(`AI Fold Debug: MutationObserver detected ${mutationsList.length} mutations.`);
  console.log('AI Fold Debug: Current answer container selector:', currentSiteConfig.answerContainerSelector);

  for (const mutation of mutationsList) {

    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {

      console.log(`AI Fold Debug: ${mutation.addedNodes.length} nodes added.`);

      mutation.addedNodes.forEach(node => {

        if (node.nodeType === Node.ELEMENT_NODE) {
          
          console.log('AI Fold Debug: Checking node:', node.tagName, node.className);

          // Check if the added node itself is an answer container

          if (node.matches && node.matches(currentSiteConfig.answerContainerSelector)) {

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

  console.log(`AI Fold Debug: Found ${initialAnswers.length} existing answer containers on init using selector: ${currentSiteConfig.answerContainerSelector}`);
  
  if (initialAnswers.length > 0) {
    console.log('AI Fold Debug: First answer element:', initialAnswers[0]);
  }

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






