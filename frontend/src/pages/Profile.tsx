import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { setCurrentUser, updateInterests, updateSkills, updateCareerGoals } from '../store/slices/userSlice'
import axios from 'axios'

const Profile = () => {
  const dispatch = useDispatch()
  const currentUser = useSelector((state: RootState) => state.user.currentUser)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/user/profile')
        dispatch(setCurrentUser(response.data))
      } catch (err) {
        setError('Failed to fetch user profile')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [dispatch])

  const handleInterestsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const interests = e.target.value.split(',').map(item => item.trim())
    dispatch(updateInterests(interests))
  }

  const handleSkillsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const skills = e.target.value.split(',').map(item => item.trim())
    dispatch(updateSkills(skills))
  }

  const handleCareerGoalsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const goals = e.target.value.split(',').map(item => item.trim())
    dispatch(updateCareerGoals(goals))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.put('/api/user/profile', currentUser)
      alert('Profile updated successfully!')
    } catch (err) {
      setError('Failed to update profile')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !currentUser) {
    return (
      <div className="text-center text-red-600">
        <p>{error || 'User profile not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={currentUser.name}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={currentUser.email}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                Interests (comma-separated)
              </label>
              <textarea
                id="interests"
                value={currentUser.interests.join(', ')}
                onChange={handleInterestsChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                Skills (comma-separated)
              </label>
              <textarea
                id="skills"
                value={currentUser.skills.join(', ')}
                onChange={handleSkillsChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="careerGoals" className="block text-sm font-medium text-gray-700">
                Career Goals (comma-separated)
              </label>
              <textarea
                id="careerGoals"
                value={currentUser.careerGoals.join(', ')}
                onChange={handleCareerGoalsChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile 