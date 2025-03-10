const pageCache = new Map();

const API_BASE_URL = "http://localhost:3001/api";

async function scrapeCurrentPage(tabId) {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId },
      function: () => {
        return {
          url: window.location.href,
          title: document.title,
          content: document.documentElement.innerHTML
        };
      }
    });
    
    const pageData = result[0].result;
    
    const response = await fetch(`${API_BASE_URL}/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: pageData.url })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    pageCache.set(pageData.url, {
      timestamp: Date.now(),
      ...data
    });
    
    return data;
  } catch (error) {
    console.error("Error scraping page:", error);
    return { error: error.message };
  }
}

async function getAnswer(question, url) {
  try {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, url })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting answer:", error);
    return { 
      error: error.message,
      answer: "Sorry, I encountered an error while trying to answer your question."
    };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "scrape_current_page") {
    scrapeCurrentPage(message.tabId)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true; 
  }
  
  if (message.action === "get_answer") {
    getAnswer(message.question, message.url)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true; 
  }
  
  if (message.action === "check_api_status") {
    fetch(`${API_BASE_URL}/knowledge-base/status`)
      .then(response => {
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        return response.json();
      })
      .then(data => sendResponse({ online: true, data }))
      .catch(error => sendResponse({ online: false, error: error.message }));
    return true;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log("Documentation Assistant extension installed");
  
  fetch(`${API_BASE_URL}/knowledge-base/status`)
    .then(response => {
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log("API server is online", data);
      chrome.storage.local.set({ 
        apiStatus: { online: true, lastChecked: Date.now() } 
      });
    })
    .catch(error => {
      console.error("API server seems to be offline:", error);
      chrome.storage.local.set({ 
        apiStatus: { online: false, error: error.message, lastChecked: Date.now() } 
      });
    });
});