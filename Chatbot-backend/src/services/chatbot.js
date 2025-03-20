const OpenAI = require('openai');
const { SYSTEM_PROMPTS, formatWebContentPrompt, formatGeneralKnowledgePrompt } = require('./promptTemplates');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function generateResponse(question, context = null) {
    try {
        let messages = [];

        if (context) {
            // If context is provided, use web content mode
            messages = [
                {
                    role: "system",
                    content: SYSTEM_PROMPTS.WEB_CONTENT
                },
                {
                    role: "user",
                    content: formatWebContentPrompt(context, question)
                }
            ];
        } else {
            // If no context, use general knowledge mode
            messages = [
                {
                    role: "system",
                    content: SYSTEM_PROMPTS.GENERAL_KNOWLEDGE
                },
                {
                    role: "user",
                    content: formatGeneralKnowledgePrompt(question)
                }
            ];
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000,
            presence_penalty: 0.6,
            frequency_penalty: 0.5
        });

        const response = completion.choices[0].message.content;

        // Add metadata to the response
        return {
            response,
            metadata: {
                source: context ? 'web_content' : 'general_knowledge',
                timestamp: new Date().toISOString(),
                model: 'gpt-3.5-turbo'
            }
        };
    } catch (error) {
        console.error('Error generating response:', error);
        throw error;
    }
}

// Function to validate if the response is grounded in the provided content
async function validateResponse(response, context) {
    if (!context) return true; // Skip validation for general knowledge responses

    try {
        const validationPrompt = `Please analyze if the following response is grounded in the provided web content.
        Response: ${response}
        Content: ${context.content}
        
        Return only "true" if the response is grounded in the content, or "false" if it's not.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a response validator. Analyze if the response is grounded in the provided content."
                },
                {
                    role: "user",
                    content: validationPrompt
                }
            ],
            temperature: 0.3,
            max_tokens: 10
        });

        return completion.choices[0].message.content.trim().toLowerCase() === 'true';
    } catch (error) {
        console.error('Error validating response:', error);
        return true; // Default to true if validation fails
    }
}

module.exports = {
    generateResponse,
    validateResponse
}; 