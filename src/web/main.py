from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.web.route import recommendation
import json
from fastapi import HTTPException
from src.rag.recommender import BadgeRecommender

app = FastAPI(
    title="OpenBadge Recommendation API",
    description="오픈배지 추천 시스템 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 운영 환경에서는 특정 도메인만 허용하도록 수정
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(recommendation.router)

@app.get("/")
async def root():
    """
    API 루트 엔드포인트
    """
    return {
        "message": "OpenBadge Recommendation API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.post("/api/recommendations/{user_id}")
async def recommend_badges(user_id: str):
    try:
        print(f"\n=== API 호출: 사용자 {user_id}의 배지 추천 요청 ===")
        recommender = BadgeRecommender()
        recommendations = recommender.recommend_badges(user_id)
        print(f"API 응답 - 추천된 배지 수: {len(recommendations.get('recommendations', []))}")
        print("API 응답 데이터:", json.dumps(recommendations, indent=2, ensure_ascii=False))
        return recommendations
    except Exception as e:
        print(f"API 오류 발생: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 