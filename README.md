# DocuSense: AI Legal & Compliance Assistant

DocuSense is a RAG-powered intelligent chatbot built for the **Inarva Solutions AI/ML Internship Assessment**. It helps small business owners understand complex legal documents by providing grounded, document-specific answers.

## The Problem
Small businesses often lack the budget for constant legal consultation. DocuSense bridges the "Legal Gap" by providing a tool that explains NDAs, contracts, and compliance documents in plain English, backed by the actual text of the documents.

## Tech Stack & AI Services
- **Platform:** Azure AI Foundry (Azure AI Studio)
- **Model:** `gpt-4o-mini`
- **Vector Store:** Azure AI Search (RAG Implementation)
- **Frontend:** Streamlit
- **Bonus Integration:** Google Sheets API (for audit logging)
- **Philosophy:** Vibe Coding — leveraging AI tools for rapid, clean development.

## System Architecture (RAG Flow)
1. **Ingestion:** Legal PDFs are chunked and vectorized in Azure AI Search.
2. **Retrieval:** When a user asks a question, Azure AI Search identifies the top 3 relevant text chunks using vector similarity.
3. **Augmentation:** The system prompt is augmented with these chunks to provide context.
4. **Generation:** GPT-4o-mini generates a factual response based strictly on the provided context.
5. **Bonus Logging:** Every interaction is logged to a Google Sheet for a compliance audit trail.

## Setup Instructions
1. **Clone the repo:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/DocuSense.git
   cd DocuSense
