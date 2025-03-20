const axios = require('axios');
const cheerio = require('cheerio');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

/**
 * Extracts content from a URL
 * @param {string} url - URL to extract content from
 * @returns {Object} - Extracted content object
 */
async function extractContent(url) {
    console.log(`Starting extraction for URL: ${url}`);
    try {
        // Validate URL format
        if (!isValidUrl(url)) {
            console.error('Invalid URL format:', url);
            throw new Error('Invalid URL format');
        }

        console.log('URL is valid, preparing to fetch content');

        // Set a timeout for the request
        const options = {
            timeout: 30000, // 30 seconds timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        };

        // Fetch the webpage content
        console.log('Fetching webpage with axios...');
        try {
            const response = await axios.get(url, options);
            console.log(`Received response: ${response.status} ${response.statusText}, content length: ${response.data.length}`);
            const html = response.data;

            if (!html || html.length < 100) {
                console.error('Received empty or very short HTML');
                throw new Error('Received empty or inadequate HTML content');
            }

            // Use JSDOM to create a valid document
            console.log('Creating JSDOM document...');
            const dom = new JSDOM(html, { url });
            const document = dom.window.document;

            // Create a DOM parser
            const $ = cheerio.load(html);

            // Remove unwanted elements
            $('script, style, nav, header, footer, iframe, noscript, [style*="display:none"], [style*="display: none"], .ads, #ads, .ad-container').remove();

            // Use Readability to extract the main content
            console.log('Applying Readability parser...');
            const reader = new Readability(document);
            const article = reader.parse();

            console.log('Readability parsing complete');

            let result;

            if (!article || !article.textContent || article.textContent.trim().length < 50) {
                console.log('Readability extraction returned insufficient content, trying fallback method');
                // Try a fallback method if Readability fails to extract meaningful content
                const fallbackContent = extractFallbackContent($);
                if (!fallbackContent) {
                    console.error('Both Readability and fallback methods failed to extract content');
                    throw new Error('Failed to extract meaningful content');
                }

                result = {
                    title: $('title').text() || url,
                    content: fallbackContent,
                    excerpt: fallbackContent.substring(0, 150) + '...',
                    url: url,
                    extraction_method: 'fallback'
                };
            } else {
                result = {
                    title: article.title || $('title').text() || url,
                    content: article.textContent,
                    excerpt: article.excerpt || article.textContent.substring(0, 150) + '...',
                    url: url,
                    extraction_method: 'readability'
                };
            }

            console.log(`Extraction successful. Title: "${result.title.substring(0, 30)}...", Content length: ${result.content.length}`);
            return result;
        } catch (axiosError) {
            console.error('Error during axios fetch:', axiosError.message);
            if (axiosError.response) {
                throw new Error(`HTTP error! Status: ${axiosError.response.status}`);
            } else if (axiosError.request) {
                throw new Error('No response received from the server');
            } else {
                throw new Error(`Request setup error: ${axiosError.message}`);
            }
        }
    } catch (error) {
        console.error('Error extracting content:', error.message);
        throw new Error(`Content extraction failed: ${error.message}`);
    }
}

/**
 * Fallback content extraction method
 * @param {CheerioStatic} $ - Cheerio instance
 * @returns {string|null} - Extracted content or null if failed
 */
function extractFallbackContent($) {
    // Try to get content from common content containers
    const contentSelectors = [
        'article', 'main', '.content', '#content', '.post', '.article', '.entry-content',
        '[role="main"]', '.main-content', '.post-content', '.page-content'
    ];

    let content = '';

    // Try each selector
    for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
            const text = element.text().trim();
            if (text.length > content.length) {
                content = text;
            }
        }
    }

    // If no content found with selectors, get all paragraphs
    if (!content || content.length < 100) {
        const paragraphs = $('p');
        let allParagraphs = '';
        paragraphs.each((i, el) => {
            const text = $(el).text().trim();
            if (text.length > 20) { // Only include substantial paragraphs
                allParagraphs += text + '\n\n';
            }
        });

        if (allParagraphs.length > content.length) {
            content = allParagraphs;
        }
    }

    return content.length > 50 ? content : null;
}

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is valid
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    extractContent
}; 