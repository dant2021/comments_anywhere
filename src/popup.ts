/// <reference types="chrome"/>

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleComments') as HTMLButtonElement;
    
    toggleButton.addEventListener('click', () => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const tabId = tabs[0].id;
        if (tabId) {
          chrome.tabs.sendMessage(tabId, {action: "toggleCommentMode"}, (response) => {
            if (chrome.runtime.lastError) {
              console.log(chrome.runtime.lastError);
              // If content script is not injected, ask background to inject it
              chrome.runtime.sendMessage({action: "injectContentScript", tabId});
            } else {
              console.log("Toggle message sent successfully");
            }
          });
        }
      });
    });
  });