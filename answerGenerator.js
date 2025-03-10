const { Configuration, OpenAIApi } = require("openai");
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const TfIdf = natural.TfIdf;

let openai;
if (process.env.OPENAI_API_KEY) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);
}

class KnowledgeBase {
  constructor() {
    this.documents = [];
    this.tfidf = new TfIdf();
    this.urlIndex = new Map(); 
  }
  
  addDocument(scrapedData) {
    const docIndex = this.documents.length;
    this.documents.push(scrapedData);
    
    this.tfidf.addDocument(scrapedData.markdown);
    
    this.urlIndex.set(scrapedData.url, docIndex);
    
    return docIndex;
  }
  
  addDocuments(scrapedDataArray) {
    scrapedDataArray.forEach(data => this.addDocument(data));
  }
  
  findRelevantContent(query, maxResults = 3) {
    const queryTerms = tokenizer.tokenize(query.toLowerCase());
    const stemmedQuery = queryTerms.map(term => stemmer.stem(term));
    
    const scores = [];
    this.tfidf.documents.forEach((_, docIndex) => {
      let score = 0;
      stemmedQuery.forEach(term => {
        score += this.tfidf.tfidf(term, docIndex);
      });
      scores.push({ docIndex, score });
    });
    
    scores.sort((a, b) => b.score - a.score);
    
    return scores
      .slice(0, maxResults)
      .map(result => this.documents[result.docIndex]);
  }
  
  findRelevantSections(query, maxSections = 5) {
    const relevantDocs = this.findRelevantContent(query);
    const sectionScores = [];
    
    relevantDocs.forEach(doc => {
      Object.entries(doc.sections).forEach(([heading, content]) => {
        const tfidf = new TfIdf();
        tfidf.addDocument(content);
        tfidf.addDocument(query);
        
        let score = 0;
        const terms = tokenizer.tokenize(query.toLowerCase());
        terms.forEach(term => {
          score += tfidf.tfidf(term, 0); 
          
        });
        
        sectionScores.push({
          docUrl: doc.url,
          docTitle: doc.title,
          heading,
          content,
          score
        });
      });
    });
    
    sectionScores.sort((a, b) => b.score - a.score);
    return sectionScores.slice(0, maxSections);
  }
}

class AnswerGenerator {
  constructor(knowledgeBase) {
    this.knowledgeBase = knowledgeBase;
  }
  
  async generateOpenAIAnswer(query, contextSections) {
    if (!openai) {
      throw new Error("OpenAI API key not configured");
    }
    
    const context = contextSections
      .map(section => `# ${section.heading}\n${section.content}`)
      .join('\n\n');
    
    try {
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful documentation assistant. Answer the user's question based only on the provided documentation context. If you cannot find the answer in the context, say so clearly."
          },
          {
            role: "user",
            content: `Context from documentation:\n${context}\n\nQuestion: ${query}`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });
      
      const answer = response.data.choices[0].message.content.trim();
      return {
        answer,
        sources: contextSections.map(section => ({
          url: section.docUrl,
          title: section.docTitle,
          heading: section.heading
        }))
      };
    } catch (error) {
      console.error("Error generating answer with OpenAI:", error);
      return this.generateBasicAnswer(query);
    }
  }
  
  generateBasicAnswer(query) {
    const relevantSections = this.knowledgeBase.findRelevantSections(query);
    
    if (relevantSections.length === 0) {
      return {
        answer: "I couldn't find information related to your question in the documentation.",
        sources: []
      };
    }
    
    const topSection = relevantSections[0];
    
    return {
      answer: `Based on the documentation: ${topSection.content}`,
      sources: relevantSections.map(section => ({
        url: section.docUrl,
        title: section.docTitle,
        heading: section.heading
      }))
    };
  }
  
  async generateAnswer(query) {
    const relevantSections = this.knowledgeBase.findRelevantSections(query);
    
    if (relevantSections.length === 0) {
      return {
        answer: "I couldn't find information related to your question in the documentation.",
        sources: []
      };
    }
    
    if (openai) {
      return this.generateOpenAIAnswer(query, relevantSections);
    } else {
      return this.generateBasicAnswer(query);
    }
  }
}

module.exports = {
  KnowledgeBase,
  AnswerGenerator
};