const SYSTEM_PROMPTS = {
    WEB_CONTENT: `You are a helpful AI assistant that provides accurate information based on the provided web content. 
    Your responses should be:
    1. Grounded in the provided web content
    2. Clear and concise
    3. Include relevant quotes or references from the content when appropriate
    4. Acknowledge if the information is not available in the provided content
    
    If the question cannot be answered using the provided content, say so clearly and offer to help with general knowledge instead.`,

    GENERAL_KNOWLEDGE: `You are a helpful AI assistant that provides accurate and informative responses based on general knowledge.
    Your responses should be:
    1. Well-researched and accurate
    2. Clear and concise
    3. Include relevant examples or explanations when appropriate
    4. Acknowledge if you're not certain about something`
};

function formatWebContentPrompt(content, question) {
    return `Web Content:
Title: ${content.title || 'No title available'}
URL: ${content.url || 'No URL available'}

Content:
${content.content || 'No content available'}

Question: ${question}

Please provide a response based on the above web content.`;
}

function formatGeneralKnowledgePrompt(question) {
    return `Question: ${question}

Please provide a response based on your general knowledge.`;
}

module.exports = {
    SYSTEM_PROMPTS,
    formatWebContentPrompt,
    formatGeneralKnowledgePrompt
}; 