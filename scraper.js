const axios = require('axios');
const cheerio = require('cheerio');
const TurndownService = require('turndown');
const { JSDOM } = require('jsdom');
const turndownService = new TurndownService();

async function scrapeWebpage(url) {
  try {
    console.log(`Scraping content from: ${url}`);
    const response = await axios.get(url);
    const html = response.data;
    
    const $ = cheerio.load(html);
    
    const title = $('title').text().trim();
    
    const contentSelectors = [
      'main', 'article', '.content', '.documentation', 
      '.docs-content', '#content', '.markdown-body'
    ];
    
    let mainContent = '';
    for (const selector of contentSelectors) {
      const content = $(selector).html();
      if (content && content.length > mainContent.length) {
        mainContent = content;
      }
    }
    
    if (!mainContent) {
      mainContent = $('body').html();
    }
    
    const markdown = turndownService.turndown(mainContent);
    
    const toc = [];
    const sections = {};
    
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
      const headingText = heading.textContent.trim();
      const headingLevel = parseInt(heading.tagName.substring(1));
      
      toc.push({
        text: headingText,
        level: headingLevel,
        id: heading.id || `section-${index}`
      });
      
      let content = '';
      let node = heading.nextSibling;
      while (node && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(node.nodeName)) {
        if (node.textContent) {
          content += node.textContent.trim() + ' ';
        }
        node = node.nextSibling;
      }
      
      sections[headingText] = content.trim();
    });
    
    const codeBlocks = [];
    $('pre code').each((i, el) => {
      const language = $(el).attr('class') || '';
      const code = $(el).text().trim();
      codeBlocks.push({
        language: language.replace('language-', ''),
        code: code
      });
    });
    
    return {
      url,
      title,
      markdown,
      toc,
      sections,
      codeBlocks,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return null;
  }
}

async function scrapeDocumentation(baseUrl, paths = ['/']) {
  const results = [];
  
  for (const path of paths) {
    const url = new URL(path, baseUrl).toString();
    const pageData = await scrapeWebpage(url);
    
    if (pageData) {
      results.push(pageData);
      
    }
  }
  
  return results;
}

module.exports = {
  scrapeWebpage,
  scrapeDocumentation
};