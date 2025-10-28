# Nikon Support Agent Demo

This repository is a demo project showing how to build and embed an AI support agent using **OpenAI’s Agent Builder** and **ChatKit** inside a Node.js Express app.

The demo agent is connected to the Nikon D700 camera manual (472 pages), allowing it to answer support questions directly from the PDF with page references.

---

## Features
- Node.js + Express server setup
- Secure ChatKit session handling (never expose your API key in the browser)
- Frontend with a simple chat widget
- File Search integration with a Vector Store
- Example workflow using OpenAI Agent Builder

---

## Getting Started

### 1. Clone this repo
```bash
git clone https://github.com/BitBloom-HQ/openai_agent_builder_nikondemo.git
cd openai_agent_builder_nikondemo
```
### 2. Install dependencies
```bash
npm install
```
### 3. Set up environment variables
```bash
OPENAI_API_KEY=your_api_key_here
WORKFLOW_ID=your_workflow_id_here
CHATKIT_DOMAIN_PK=your_allowed_domain_pk here
```
### 4. Run locally
```bash
node server.js
```
### Folder Structure
```bash
.
├── server.js                # Express server with ChatKit session route
├── views/
│   ├── index.ejs            # Main page template
│   └── partials/chat-container.ejs
├── public/
│   ├── app-chatkit.js       # Frontend logic to mount ChatKit
│   └── styles.css           # Basic styling
├── package.json
└── .env.example             # Example env file
```
### Notes
Keep your OPENAI_API_KEY on the server side only.
Make sure you’ve added credits to your OpenAI account, otherwise your agent won’t respond.
If deploying to production, add your domain to the Domain allowlist in the OpenAI dashboard.


