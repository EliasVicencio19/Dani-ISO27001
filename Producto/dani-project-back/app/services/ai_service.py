from openai import AsyncOpenAI
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Pinecone
from typing import List, Dict, Any

from app.config import settings

class AIService:
    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.embeddings = OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY)
        
        # Initialize vector store (example with Pinecone)
        # import pinecone
        # pinecone.init(api_key=settings.VECTOR_STORE_API_KEY)
        # self.vector_store = Pinecone.from_existing_index(
        #     index_name="dani27001",
        #     embedding=self.embeddings
        # )
    
    async def analyze_risk(self, risk: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze risk using GPT and RAG"""
        
        # Build context from vector store (RAG)
        similar_risks = await self._search_similar_risks(risk["description"])
        
        prompt = f"""
        As a security compliance expert for ISO 27001, analyze this risk:
        
        Title: {risk['title']}
        Description: {risk['description']}
        Current Controls: {risk.get('controls', [])}
        
        Similar cases from knowledge base: {similar_risks}
        
        Please provide:
        1. Risk severity assessment
        2. Recommended controls based on ISO 27001 Annex A
        3. Action plan for mitigation
        """
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are an ISO 27001 compliance expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        return {
            "analysis": response.choices[0].message.content,
            "risk_id": risk["id"],
            "analyzed_at": "2024-01-01T00:00:00Z"
        }
    
    async def _search_similar_risks(self, query: str) -> List[str]:
        """RAG query to vector store"""
        # results = self.vector_store.similarity_search(query, k=3)
        # return [doc.page_content for doc in results]
        return []  # Placeholder
    
    async def generate_document(self, doc_type: str, data: Dict[str, Any]) -> str:
        """Generate compliance documents using AI"""
        templates = {
            "risk_report": "Generate a detailed risk assessment report for ISO 27001...",
            "soa": "Generate Statement of Applicability based on controls...",
            "policy": "Generate security policy document..."
        }
        
        prompt = f"""
        Generate an ISO 27001 compliance document of type: {doc_type}
        
        Data: {data}
        
        Template guidelines: {templates.get(doc_type, "")}
        
        Format the document professionally with proper sections.
        """
        
        response = await self.openai_client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are a compliance document generator."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        return response.choices[0].message.content