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
    chatContainerSelector: 'main',
    answerContainerSelector: '[data-message-author-role="assistant"]', // AI message container (the div with author role)
    answerContentSelector: '[class*="markdown"]', // The actual content to fold
    globalControlsSelector: 'header#page-header .flex.items-center.justify-center.gap-3', // Page header toolbar
    observerTargetSelector: 'main' // Main content area for observing mutations
  },
  gemini: {
    chatContainerSelector: 'chat-app',
    answerContainerSelector: 'model-response', // Gemini AI response container
    answerContentSelector: 'message-content', // The actual content to fold
    globalControlsSelector: '.left-section', // Left section of the toolbar
    observerTargetSelector: 'chat-app' // Root container for observing mutations
  },
  qwen: {
    chatContainerSelector: '#app-container',
    answerContainerSelector: '.text-response-render-container', // Qwen AI response container
    answerContentSelector: '.text-response-render-container', // The actual content to fold (the container itself)
    globalControlsSelector: '.flex.w-full.items-start', // Toolbar area
    observerTargetSelector: '#messages-container' // Messages container for observing mutations
  },
  claude: {
    chatContainerSelector: 'body',
    answerContainerSelector: '.font-claude-response', // Claude AI response container
    answerContentSelector: '.whitespace-pre-wrap, [class*="markdown"]', // The actual content to fold
    globalControlsSelector: 'header .flex.w-full.items-center.justify-between', // Header controls container (must be in header)
    observerTargetSelector: 'body' // Body element for observing mutations
  },
  grok: {
    chatContainerSelector: 'body',
    answerContainerSelector: '.items-start .message-bubble', // Grok AI message container (only AI messages, not user messages)
    answerContentSelector: '.prose, [class*="markdown"]', // The actual content to fold
    globalControlsSelector: '.h-16.top-0.absolute.z-10.flex.flex-row', // Top bar container
    observerTargetSelector: 'body' // Body element for observing mutations
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
  if (hostname.includes('chat.openai.com') || hostname.includes('chatgpt.com')) {
    return siteConfigs.chatgpt;
  }
  if (hostname.includes('gemini.google.com')) {
    return siteConfigs.gemini;
  }
  if (hostname.includes('qwen.ai')) {
    return siteConfigs.qwen;
  }
  if (hostname.includes('claude.ai')) {
    return siteConfigs.claude;
  }
  if (hostname.includes('grok.com')) {
    return siteConfigs.grok;
  }
  return null;
}

/**
 * Adds a fold/unfold button to a single AI answer element.
 * It polls for the content element to appear before adding the button.
 * @param {HTMLElement} answerEl - The DOM element containing the AI answer.
 */
function addFoldButton(answerEl) {
  // Prevent adding a button if one already exists (check both button and marker)
  if (answerEl.dataset.aifoldProcessed === 'true') {
    return;
  }
  
  // Check if button exists in answerEl or its parent (for Qwen.ai case)
  let existingButton = answerEl.querySelector('.aifold-fold-button');
  if (!existingButton && answerEl.parentElement) {
    // Check if button was added to parent element (for Qwen.ai)
    const siblings = Array.from(answerEl.parentElement.children);
    const answerIndex = siblings.indexOf(answerEl);
    if (answerIndex > 0 && siblings[answerIndex - 1].classList.contains('aifold-fold-button')) {
      existingButton = siblings[answerIndex - 1];
    }
  }
  
  if (existingButton) {
    answerEl.dataset.aifoldProcessed = 'true'; // Add marker
    return;
  }
  
  // Mark this answer as being processed
  answerEl.dataset.aifoldProcessed = 'true';

  // Poll for the content element to appear, as it might render after the container
  let pollCount = 0;
  const pollForContent = setInterval(() => {
    pollCount++;
    
    // For DeepSeek: check if there are multiple foldable sections (thinking + answer)
    if (currentSiteConfig === siteConfigs.deepseek) {
      const allContentElements = answerEl.querySelectorAll(currentSiteConfig.answerContentSelector);
      
      if (allContentElements.length > 0) {
        clearInterval(pollForContent);
        
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
    // Special case: if container and content selectors are the same, use the container itself
    let contentEl;
    if (currentSiteConfig.answerContainerSelector === currentSiteConfig.answerContentSelector) {
      contentEl = answerEl;
    } else {
      contentEl = answerEl.querySelector(currentSiteConfig.answerContentSelector);
    }
    
    if (contentEl) {
      clearInterval(pollForContent);

      const button = document.createElement('button');
      const foldLabel = '折叠';
      const unfoldLabel = '展开';
      
      button.textContent = foldLabel;
      button.className = 'aifold-fold-button';
      
      // Store labels as data attributes for reliable toggling
      button.dataset.foldLabel = foldLabel;
      button.dataset.unfoldLabel = unfoldLabel;
      button.dataset.buttonId = `aifold-btn-${Date.now()}-${Math.random()}`;
      
      button.addEventListener('click', () => {
        const isFolded = contentEl.classList.toggle('aifold-folded-content');
        button.textContent = isFolded ? button.dataset.unfoldLabel : button.dataset.foldLabel;
        answerEl.classList.toggle('aifold-container-folded');
        
        // For AI Studio: also hide the virtual-scroll-container to collapse the placeholder div
        if (currentSiteConfig === siteConfigs.aistudio) {
          const virtualScrollContainer = contentEl.closest('.virtual-scroll-container');
          if (virtualScrollContainer) {
            virtualScrollContainer.classList.toggle('aifold-folded-content');
          }
        }
      });

      // Add button based on whether content is same as container
      if (contentEl === answerEl) {
        // If folding the container itself, add button to parent (before the container)
        const parent = answerEl.parentElement;
        if (parent) {
          // Check if parent already has a button to prevent duplicates
          const existingButtonInParent = parent.querySelector('.aifold-fold-button');
          if (!existingButtonInParent) {
            parent.insertBefore(button, answerEl);
            // Mark parent as processed too
            parent.dataset.aifoldProcessed = 'true';
          }
        } else {
          answerEl.prepend(button);
        }
      } else {
        // Normal case: prepend button to answer container
        answerEl.prepend(button);
      }
    }
  }, 200); // Check every 200ms

  // Stop polling after a few seconds to prevent infinite loops on unexpected structures
  setTimeout(() => {
    clearInterval(pollForContent);
    // If button was never added, remove the marker so we can try again later
    if (!answerEl.querySelector('.aifold-fold-button')) {
      answerEl.dataset.aifoldProcessed = 'false';
    }
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
  button.dataset.buttonId = `aifold-btn-${Date.now()}-${Math.random()}`;
  
  button.addEventListener('click', () => {
    const isFolded = contentEl.classList.toggle('aifold-folded-content');
    
    // Update button text using stored labels
    button.textContent = isFolded ? button.dataset.unfoldLabel : button.dataset.foldLabel;
  });

  // Insert button before the content element
  parent.insertBefore(button, contentEl);
}

/**

 * Adds global "Fold All" and "Unfold All" buttons to the page.

 */

function addGlobalControls() {
  console.log('[AI Fold] addGlobalControls: Looking for toolbar with selector:', currentSiteConfig.globalControlsSelector);
  
  // Poll for the target element (especially for AI Studio where toolbar loads later)
  let pollCount = 0;
  const maxPolls = 50; // 10 seconds max
  
  const pollForTarget = setInterval(() => {
    pollCount++;
    const targetEl = document.querySelector(currentSiteConfig.globalControlsSelector);

    if (targetEl) {
      clearInterval(pollForTarget);
      console.log('[AI Fold] Found toolbar element:', targetEl);
      
      // Check if controls already exist IN THIS SPECIFIC CONTAINER
      const existingControls = targetEl.querySelector('.aifold-global-controls');
      if (existingControls) {
        console.log('[AI Fold] Global controls already exist, skipping');
        return;
      }
      
      console.log('[AI Fold] Creating global control buttons...');
      createGlobalControlButtons(targetEl);
    } else if (pollCount >= maxPolls) {
      clearInterval(pollForTarget);
      console.error('[AI Fold] Global controls target element not found after polling.');
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
        // Special case: if container and content selectors are the same
        let contentEl, button;
        if (currentSiteConfig.answerContainerSelector === currentSiteConfig.answerContentSelector) {
          // Content is the container itself
          contentEl = answerEl;
          // Button is in parent (before the container)
          button = answerEl.parentElement?.querySelector('.aifold-fold-button');
        } else {
          // Handle multiple content blocks in the same answer (e.g., thinking + answer)
          const allContentElements = answerEl.querySelectorAll(currentSiteConfig.answerContentSelector);
          
          // For AI Studio and other single-button sites, only operate on the first content element
          const contentElementsToProcess = (currentSiteConfig === siteConfigs.aistudio && allContentElements.length > 1) 
            ? [allContentElements[0]] 
            : Array.from(allContentElements);

          contentElementsToProcess.forEach((contentEl, index) => {
            // For AI Studio: button doesn't have index suffix, find it directly
            // For DeepSeek with multiple buttons: find by index
            const button = currentSiteConfig === siteConfigs.aistudio 
              ? answerEl.querySelector('.aifold-fold-button')
              : (answerEl.querySelector(`.aifold-fold-button-${index}`) || answerEl.querySelector('.aifold-fold-button'));

            if (contentEl && !contentEl.classList.contains('aifold-folded-content')) {
              contentEl.classList.add('aifold-folded-content');
              answerEl.classList.add('aifold-container-folded');

              if (button) {
                const newText = button.dataset.unfoldLabel || '展开';
                button.textContent = newText;
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
          return; // Exit early for this answer
        }

        // Execute fold for same selector case
        if (contentEl && !contentEl.classList.contains('aifold-folded-content')) {
          contentEl.classList.add('aifold-folded-content');
          answerEl.classList.add('aifold-container-folded');

          if (button) {
            const newText = button.dataset.unfoldLabel || '展开';
            button.textContent = newText;
          }
        }
      });
    });

  

    const unfoldAllButton = document.createElement('button');

    unfoldAllButton.textContent = '全部展开';

    unfoldAllButton.className = 'aifold-global-button';

    unfoldAllButton.addEventListener('click', () => {
      const allAnswers = document.querySelectorAll(currentSiteConfig.answerContainerSelector);

      allAnswers.forEach(answerEl => {
        // Special case: if container and content selectors are the same
        let contentEl, button;
        if (currentSiteConfig.answerContainerSelector === currentSiteConfig.answerContentSelector) {
          // Content is the container itself
          contentEl = answerEl;
          // Button is in parent (before the container)
          button = answerEl.parentElement?.querySelector('.aifold-fold-button');
        } else {
          // Handle multiple content blocks in the same answer (e.g., thinking + answer)
          const allContentElements = answerEl.querySelectorAll(currentSiteConfig.answerContentSelector);
          
          // For AI Studio and other single-button sites, only operate on the first content element
          const contentElementsToProcess = (currentSiteConfig === siteConfigs.aistudio && allContentElements.length > 1) 
            ? [allContentElements[0]] 
            : Array.from(allContentElements);

          contentElementsToProcess.forEach((contentEl, index) => {
            // For AI Studio: button doesn't have index suffix, find it directly
            // For DeepSeek with multiple buttons: find by index
            const button = currentSiteConfig === siteConfigs.aistudio 
              ? answerEl.querySelector('.aifold-fold-button')
              : (answerEl.querySelector(`.aifold-fold-button-${index}`) || answerEl.querySelector('.aifold-fold-button'));

            if (contentEl && contentEl.classList.contains('aifold-folded-content')) {
              contentEl.classList.remove('aifold-folded-content');
              answerEl.classList.remove('aifold-container-folded');

              if (button) {
                const newText = button.dataset.foldLabel || '折叠';
                button.textContent = newText;
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
          return; // Exit early for this answer
        }

        // Execute unfold for same selector case
        if (contentEl && contentEl.classList.contains('aifold-folded-content')) {
          contentEl.classList.remove('aifold-folded-content');
          answerEl.classList.remove('aifold-container-folded');

          if (button) {
            const newText = button.dataset.foldLabel || '折叠';
            button.textContent = newText;
          }
        }
      });
    });



  controlsContainer.appendChild(foldAllButton);

  controlsContainer.appendChild(unfoldAllButton);



  // Insert at the appropriate position based on the platform
  if (currentSiteConfig === siteConfigs.chatgpt) {
    // ChatGPT: insert at the beginning of sidebar
    targetEl.insertBefore(controlsContainer, targetEl.firstChild);
  } else if (currentSiteConfig === siteConfigs.claude) {
    // Claude: insert before the .right-3.flex.gap-2 element
    const rightSection = targetEl.querySelector('.right-3.flex.gap-2');
    if (rightSection) {
      targetEl.insertBefore(controlsContainer, rightSection);
    } else {
      // Fallback: insert at the end
      targetEl.appendChild(controlsContainer);
    }
  } else if (currentSiteConfig === siteConfigs.grok) {
    // Grok: insert before the .absolute.flex.flex-row.items-center.gap-0.5.ms-auto.end-3 element
    const rightSection = targetEl.querySelector('.absolute.flex.flex-row.items-center.ms-auto.end-3');
    if (rightSection) {
      targetEl.insertBefore(controlsContainer, rightSection);
    } else {
      // Fallback: insert at the end
      targetEl.appendChild(controlsContainer);
    }
  } else {
    // Others: insert at the end
    targetEl.appendChild(controlsContainer);
  }

}



/**

 * The callback for the MutationObserver.

 * Finds new answer elements and adds fold buttons to them.

 * @param {MutationRecord[]} mutationsList - The list of mutations.

 */

function handleMutations(mutationsList) {

  for (const mutation of mutationsList) {

    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {

      mutation.addedNodes.forEach(node => {

        if (node.nodeType === Node.ELEMENT_NODE) {

          // Check if the added node itself is an answer container

          if (node.matches && node.matches(currentSiteConfig.answerContainerSelector)) {

            addFoldButton(node);

          }

          // Check for answer containers within the added node

          const answers = node.querySelectorAll(currentSiteConfig.answerContainerSelector);

          if (answers.length > 0) {
            
            answers.forEach((answer) => {
              addFoldButton(answer);
            });

          }
          
          // Check if the global controls container was re-rendered (especially for AI Studio)
          if (currentSiteConfig.globalControlsSelector) {
            // Check if the node itself matches the controls container selector
            if (node.matches && node.matches(currentSiteConfig.globalControlsSelector)) {
              setTimeout(() => addGlobalControls(), 100);
            }
            
            // Also check if the controls container is within the added node
            const controlsContainer = node.querySelector && node.querySelector(currentSiteConfig.globalControlsSelector);
            if (controlsContainer) {
              setTimeout(() => addGlobalControls(), 100);
            }
            
            // For AI Studio: also check for ms-chunk-editor (parent of toolbar)
            if (currentSiteConfig === siteConfigs.aistudio) {
              if ((node.matches && node.matches('ms-chunk-editor')) || 
                  (node.querySelector && node.querySelector('ms-chunk-editor'))) {
                setTimeout(() => addGlobalControls(), 200);
              }
            }
            
            // For Qwen.ai: check for chat-container or model-selector (indicates conversation switch)
            if (currentSiteConfig === siteConfigs.qwen) {
              if ((node.matches && (node.matches('#chat-container') || node.matches('[id^="model-selector"]'))) || 
                  (node.querySelector && (node.querySelector('#chat-container') || node.querySelector('[id^="model-selector"]')))) {
                setTimeout(() => addGlobalControls(), 200);
              }
            }
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
  console.log('AI Fold Debug: initialize() called');

  if (!currentSiteConfig) {
    console.log('AI Fold Debug: No currentSiteConfig in initialize');
    return;
  }
  
  console.log('AI Fold Debug: currentSiteConfig:', currentSiteConfig);

  // Add global controls
  console.log('AI Fold Debug: Adding global controls...');
  addGlobalControls();



  // --- Initial Scan ---

  // Find existing answers and add buttons
  console.log('[AI Fold] Initializing... Looking for:', currentSiteConfig.answerContainerSelector);
  const initialAnswers = document.querySelectorAll(currentSiteConfig.answerContainerSelector);
  console.log('[AI Fold] Found', initialAnswers.length, 'answer containers');

  initialAnswers.forEach((answer) => {
    addFoldButton(answer);
  });



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
    
    // Also check if global controls are still present
    if (currentSiteConfig.globalControlsSelector) {
      const targetEl = document.querySelector(currentSiteConfig.globalControlsSelector);
      if (targetEl) {
        const existingControls = targetEl.querySelector('.aifold-global-controls');
        if (!existingControls) {
          console.log('[AI Fold] Global controls missing, re-adding...');
          addGlobalControls();
        }
      }
    }

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
  
  if (!pollSelector) {
    return;
  }
  
  let pollCount = 0;
  const polling = setInterval(() => {
    pollCount++;
    const container = document.querySelector(pollSelector);
    if (container) {
      clearInterval(polling);
      initialize();
    }
  }, 500);

  setTimeout(() => {
    clearInterval(polling);
    
    // Try one more time after timeout
    const container = document.querySelector(pollSelector);
    if (container) {
      initialize();
    }
  }, 20000); // Stop after 20 seconds
}



start();






