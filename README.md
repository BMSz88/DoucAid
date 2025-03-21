# DocuAid - Intelligent Document Assistant

DocuAid is an AI-powered chatbot for document assistance, capable of extracting and analyzing content from web pages.

## Features

- Extract content from web pages
- Chat with an AI about extracted content
- Dark/light mode support
- Responsive design for all devices
- Persistent context across sessions

## Project Structure

```
DocuAid/
├── .github/
│   └── workflows/      # CI/CD configurations
├── Chatbot-backend/    # Node.js Express backend
└── Chatbot-frontend/   # HTML/CSS/JS frontend
```

## Local Development

### Backend

```bash
cd Chatbot-backend
npm install
npm run dev
```

The backend server will start on port 3001 by default.

### Frontend

```bash
cd Chatbot-frontend
python -m http.server 8010
```

Access the test page at: http://localhost:8010/test.html

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment to Railway.

### Setup Railway Deployment

1. **Create a Railway Account**
   - Sign up at [Railway.app](https://railway.app/)
   - Create a new project

2. **Set up Railway Token in GitHub**
   - In Railway, go to Account Settings → Tokens
   - Generate a new token
   - In GitHub repository, go to Settings → Secrets and Variables → Actions
   - Add a new repository secret named `RAILWAY_TOKEN` with your Railway token

3. **Link GitHub Repo to Railway**
   - In Railway project, add a new service from GitHub
   - Select your repository
   - Configure environment variables:
     - `PORT`: 3001
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `MONGODB_URI`: Your MongoDB connection string (optional)

### Pipeline Workflow

The CI/CD pipeline automatically:

1. Tests the backend by checking critical files and running linting
2. Validates frontend files to ensure they're properly formatted
3. Deploys to Railway when changes are pushed to the main branch
4. Sends notifications about the deployment status

### Manual Deployment

You can also manually trigger a deployment by:

1. Going to the Actions tab in your GitHub repository
2. Selecting the "DocuAid CI/CD Pipeline" workflow
3. Clicking "Run workflow"

## Accessing the Deployed Application

- Backend API: https://doucaid-production.up.railway.app
- Test page: Serve the frontend locally and configure it to use the deployed backend

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Create a pull request

The CI/CD pipeline will automatically run tests on your pull request.

## License

MIT 