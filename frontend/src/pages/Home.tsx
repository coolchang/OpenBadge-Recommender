import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { RootState } from '../store'
import { setRecommendedBadges, setLoading, setError } from '../store/slices/badgeSlice'
import axios from 'axios'

interface BadgeRecommendation {
  badge_id: string
  name: string
  issuer: string
  skills: string[]
  competency: string
  similarity_score: number
  recommendation_reason: string
  preparation_steps: string
  expected_benefits: string
}

interface UserProfile {
  name: string
  goal: string
  skills: string[]
  competency_level: string
  education_level: string
  acquired_badges: string[]
}

interface BadgeInfo {
  badge_id: string
  name: string
  issuer: string
}

const Home = () => {
  const dispatch = useDispatch()
  const { recommendedBadges, loading, error } = useSelector((state: RootState) => state.badges)
  const [userId, setUserId] = useState('')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [badgeInfoMap, setBadgeInfoMap] = useState<Record<string, BadgeInfo>>({})

  const getGoalEmoji = (goal: string): string => {
    const lowerGoal = goal.toLowerCase()
    if (lowerGoal.includes('ai') || 
        lowerGoal.includes('인공지능') || 
        lowerGoal.includes('machine learning') || 
        lowerGoal.includes('ml') || 
        lowerGoal.includes('딥러닝') || 
        lowerGoal.includes('deep learning') || 
        lowerGoal.includes('neural') || 
        lowerGoal.includes('신경망')) return '🤖'
    if (lowerGoal.includes('data') || lowerGoal.includes('데이터')) return '📊'
    if (lowerGoal.includes('web') || lowerGoal.includes('웹')) return '🌐'
    if (lowerGoal.includes('mobile') || lowerGoal.includes('모바일')) return '📱'
    if (lowerGoal.includes('cloud') || lowerGoal.includes('클라우드')) return '☁️'
    if (lowerGoal.includes('security') || lowerGoal.includes('보안')) return '🔒'
    if (lowerGoal.includes('game') || lowerGoal.includes('게임')) return '🎮'
    if (lowerGoal.includes('design') || lowerGoal.includes('디자인')) return '🎨'
    if (lowerGoal.includes('network') || lowerGoal.includes('네트워크')) return '🌐'
    if (lowerGoal.includes('database') || lowerGoal.includes('데이터베이스')) return '🗄️'
    return '🎯' // 기본 목표 이모지
  }

  const fetchBadgeInfo = async (badgeId: string) => {
    try {
      const response = await axios.get(`/api/badges/${badgeId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching badge info for ${badgeId}:`, error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim()) {
      dispatch(setError('사용자 ID를 입력해주세요.'))
      return
    }

    try {
      dispatch(setLoading(true))
      dispatch(setError(null))
      
      // 사용자 프로필 정보 가져오기
      console.log('Fetching user profile...')
      const profileResponse = await axios.get(`/api/recommendations/user/${userId}`)
      console.log('User profile response:', profileResponse.data)
      setUserProfile(profileResponse.data)
      
      // 획득한 배지 정보 가져오기
      const badgeInfoPromises = profileResponse.data.acquired_badges.map(fetchBadgeInfo)
      const badgeInfos = await Promise.all(badgeInfoPromises)
      const badgeMap: Record<string, BadgeInfo> = {}
      badgeInfos.forEach((info, index) => {
        if (info) {
          badgeMap[profileResponse.data.acquired_badges[index]] = info
        }
      })
      setBadgeInfoMap(badgeMap)
      
      // 추천 배지 가져오기
      console.log('Fetching badge recommendations...')
      const response = await axios.post<{ recommendations: BadgeRecommendation[] }>(
        `/api/recommendations/${userId}`,
        {},
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      )
      console.log('Badge recommendations response:', response.data)
      console.log('Number of recommended badges:', response.data?.recommendations?.length)

      if (response.data?.recommendations) {
        dispatch(setRecommendedBadges(response.data.recommendations))
      } else {
        dispatch(setError('추천 배지 데이터가 없습니다.'))
      }
    } catch (err) {
      console.error('API Error:', err)
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.detail || err.message
        dispatch(setError(`API 오류: ${errorMessage}`))
      } else {
        dispatch(setError('추천 배지를 가져오는데 실패했습니다.'))
      }
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Your Next Open Badge
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Get personalized recommendations for Open Badges based on your skills, interests, and career goals.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex gap-4">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="사용자 ID를 입력하세요 (예: U00255)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? '추천 중...' : '추천 받기'}
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
          <p className="text-lg font-semibold">오류가 발생했습니다</p>
          <p className="mt-2">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {!loading && !error && userProfile && (
        <div className="space-y-12">
          <section className="bg-blue-50 rounded-lg shadow-sm p-8 border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-blue-900">사용자 프로필</h2>
              <div className="h-8 w-1 bg-blue-300"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-blue-900 mb-2">{userProfile.name}</h3>
                <div className="bg-white p-4 rounded-lg mb-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">목표</h4>
                  <p className="text-blue-700 flex items-center gap-2">
                    <span className="text-xl">{getGoalEmoji(userProfile.goal)}</span>
                    {userProfile.goal}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-blue-600">
                    <span className="font-medium">교육 수준:</span> {userProfile.education_level}
                  </p>
                  <p className="text-sm text-blue-600">
                    <span className="font-medium">역량 수준:</span> {userProfile.competency_level}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-2">보유 기술</h4>
                <div className="flex flex-wrap gap-2">
                  {userProfile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <h4 className="text-sm font-medium text-blue-900 mt-4 mb-2">획득한 배지</h4>
                <div className="space-y-3">
                  {userProfile.acquired_badges.map((badgeId) => {
                    const badgeInfo = badgeInfoMap[badgeId]
                    return (
                      <div key={badgeId} className="bg-white p-3 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-blue-800">
                              {badgeInfo ? badgeInfo.name : badgeId}
                            </span>
                            <span className="text-xs text-blue-500 ml-2">({badgeId})</span>
                          </div>
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {new Date().toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="text-xs text-blue-600">
                            발급자: {badgeInfo ? badgeInfo.issuer : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-purple-50 rounded-lg shadow-sm p-8 border border-purple-100">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-purple-900">사용자 특징 분석</h2>
              <div className="h-8 w-1 bg-purple-300"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-purple-900 mb-2">현재 역량 수준</h3>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-purple-700">
                      {userProfile.competency_level} 수준의 역량을 보유하고 있으며, 
                      {userProfile.education_level}의 교육 배경을 가지고 있습니다.
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-purple-900 mb-2">보유 기술 분석</h3>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-purple-700">
                      {userProfile.skills.length}개의 핵심 기술을 보유하고 있으며, 
                      이는 {userProfile.goal}을 달성하는데 도움이 될 것입니다.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-purple-900 mb-2">배지 획득 현황</h3>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-purple-700">
                      현재 {userProfile.acquired_badges.length}개의 배지를 보유하고 있으며,
                      이를 통해 전문성을 인증받았습니다.
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-purple-900 mb-2">성장 가능성</h3>
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-purple-700">
                      {userProfile.education_level}의 교육 배경과 {userProfile.competency_level} 수준의 역량을 바탕으로,
                      {userProfile.goal}을 달성하기 위한 충분한 잠재력을 가지고 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {recommendedBadges.length > 0 && (
            <section className="bg-emerald-50 rounded-lg shadow-sm p-8 border border-emerald-100">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold text-emerald-900">추천 배지 ({recommendedBadges.length}개)</h2>
                <div className="h-8 w-1 bg-emerald-300"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendedBadges.map((badge, index) => (
                  <Link
                    key={badge.badge_id}
                    to={`/badge/${badge.badge_id}`}
                    className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <h3 className="text-lg font-medium text-emerald-900 mb-2">{badge.name}</h3>
                      <p className="text-sm text-emerald-700 mb-2">발급자: {badge.issuer}</p>
                      <div className="space-y-4">
                        <div className="max-h-32 overflow-y-auto">
                          <p className="text-emerald-700">{badge.recommendation_reason}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {badge.skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-emerald-600">
                            <span className="font-medium">필요 역량:</span> {badge.competency}
                          </p>
                          <p className="text-sm text-emerald-600">
                            <span className="font-medium">유사도 점수:</span> {badge.similarity_score.toFixed(2)}
                          </p>
                        </div>
                        <div className="max-h-32 overflow-y-auto">
                          <p className="text-sm text-emerald-700">
                            <span className="font-medium">준비사항:</span> {badge.preparation_steps}
                          </p>
                        </div>
                        <div className="max-h-32 overflow-y-auto">
                          <p className="text-sm text-emerald-700">
                            <span className="font-medium">기대효과:</span> {badge.expected_benefits}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="bg-indigo-50 rounded-lg shadow-sm p-8 border border-indigo-100">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-indigo-900">종합 코멘트</h2>
              <div className="h-8 w-1 bg-indigo-300"></div>
            </div>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-indigo-900 mb-4">추천 배지 선정 이유</h3>
                <p className="text-indigo-700 leading-relaxed">
                  {userProfile.name}님의 {userProfile.goal} 목표를 고려할 때, 
                  {userProfile.competency_level} 수준의 역량과 {userProfile.education_level}의 교육 배경을 바탕으로 
                  {recommendedBadges.length}개의 배지를 추천드립니다. 
                  특히 {recommendedBadges[0]?.name}과 같은 배지는 {userProfile.skills.join(', ')} 등의 
                  보유 기술을 더욱 발전시키고 인증받을 수 있는 좋은 기회가 될 것입니다.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-indigo-900 mb-4">학습 경로 제안</h3>
                <div className="space-y-4">
                  <p className="text-indigo-700 leading-relaxed">
                    {userProfile.name}님의 {userProfile.goal} 목표 달성을 위해 다음과 같은 학습 경로를 제안드립니다:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-indigo-700">
                    <li className="leading-relaxed">
                      <span className="font-medium">기초 역량 강화:</span> {userProfile.competency_level} 수준에서 
                      {recommendedBadges[0]?.competency} 역량을 더욱 발전시킬 수 있는 기초 학습
                    </li>
                    <li className="leading-relaxed">
                      <span className="font-medium">핵심 기술 심화:</span> {userProfile.skills.slice(0, 3).join(', ')} 등의 
                      핵심 기술을 더욱 심화하여 전문성 확보
                    </li>
                    <li className="leading-relaxed">
                      <span className="font-medium">실무 적용:</span> 추천된 배지들의 준비사항을 참고하여 
                      실제 프로젝트나 과제에 적용해보기
                    </li>
                  </ol>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-indigo-900 mb-4">기대 효과</h3>
                <p className="text-indigo-700 leading-relaxed">
                  제안된 학습 경로를 따르면 {userProfile.goal} 목표 달성에 필요한 핵심 역량을 
                  체계적으로 발전시킬 수 있을 것입니다. 특히 추천된 배지들을 획득함으로써 
                  전문성을 객관적으로 인증받고, {userProfile.education_level}의 교육 배경을 
                  더욱 강화할 수 있을 것입니다.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Home