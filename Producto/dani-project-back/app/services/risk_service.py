from typing import List, Dict, Any
from datetime import datetime
import json

class RiskService:
    def __init__(self, db_session, redis_client):
        self.db = db_session
        self.redis = redis_client
    
    async def create_risk(self, risk_data: Dict[str, Any], user_id: str):
        """Create a new risk assessment"""
        risk = {
            "id": self._generate_id(),
            "title": risk_data["title"],
            "description": risk_data["description"],
            "category": risk_data.get("category", "general"),
            "likelihood": risk_data.get("likelihood", 1),
            "impact": risk_data.get("impact", 1),
            "risk_level": self._calculate_risk_level(
                risk_data.get("likelihood", 1), 
                risk_data.get("impact", 1)
            ),
            "controls": risk_data.get("controls", []),
            "status": "open",
            "created_by": user_id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Save to database (using your DB of choice)
        # await self.db.risks.insert_one(risk)
        
        # Cache in Redis
        await self.redis.setex(
            f"risk:{risk['id']}", 
            3600, 
            json.dumps(risk)
        )
        
        return risk
    
    async def get_risk(self, risk_id: str):
        """Get risk by ID with caching"""
        # Try cache first
        cached = await self.redis.get(f"risk:{risk_id}")
        if cached:
            return json.loads(cached)
        
        # Get from database
        # risk = await self.db.risks.find_one({"id": risk_id})
        
        # Cache it
        # await self.redis.setex(f"risk:{risk_id}", 3600, json.dumps(risk))
        
        return None
    
    async def evaluate_risk(self, risk_id: str):
        """AI-powered risk evaluation"""
        risk = await self.get_risk(risk_id)
        if not risk:
            raise ValueError("Risk not found")
        
        # Use AI to analyze risk
        from app.services.ai_service import AIService
        ai_service = AIService()
        
        analysis = await ai_service.analyze_risk(risk)
        
        return analysis
    
    def _calculate_risk_level(self, likelihood: int, impact: int) -> str:
        score = likelihood * impact
        if score >= 15:
            return "critical"
        elif score >= 8:
            return "high"
        elif score >= 4:
            return "medium"
        else:
            return "low"
    
    def _generate_id(self) -> str:
        import uuid
        return str(uuid.uuid4())