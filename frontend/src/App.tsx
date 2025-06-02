import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import BadgeDetail from './pages/BadgeDetail'
import Profile from './pages/Profile'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/badge/:id" element={<BadgeDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  )
}

export default App 