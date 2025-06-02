import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Badge } from '../store/slices/badgeSlice'

const BadgeDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [badge, setBadge] = useState<Badge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBadgeDetails = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/badges/${id}`)
        setBadge(response.data)
      } catch (err) {
        setError('Failed to fetch badge details')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchBadgeDetails()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !badge) {
    return (
      <div className="text-center text-red-600">
        <p>{error || 'Badge not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-center mb-8">
            <img
              src={badge.imageUrl}
              alt={badge.name}
              className="w-32 h-32"
            />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{badge.name}</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600">{badge.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Issuer</h2>
            <p className="text-gray-600">{badge.issuer}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Criteria</h2>
            <p className="text-gray-600">{badge.criteria}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {badge.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <button
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              onClick={() => window.open(badge.imageUrl, '_blank')}
            >
              View Badge
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BadgeDetail 