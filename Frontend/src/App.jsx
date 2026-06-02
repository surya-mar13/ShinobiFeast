import React from 'react'
import RootLayout from './components/RootLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Logout from './pages/Logout'
import RestaurantsPage from './pages/RestaurantsPage'
import RestaurantDetail from './pages/RestaurantDetail'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import VendorDashboard from './pages/vendor/VendorDashboard'
import VendorRestaurants from './pages/vendor/VendorRestaurants'
import VendorProducts from './pages/vendor/VendorProducts'
import VendorOrders from './pages/vendor/VendorOrders'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminOrders from './pages/admin/AdminOrders'
import AdminRestaurants from './pages/admin/AdminRestaurants'
import AdminDeliveryPartners from './pages/admin/AdminDeliveryPartners'
import DeliveryDashboard from './pages/delivery/DeliveryDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import { CartProvider } from './context/CartContext'

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <RootLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'restaurants', element: <RestaurantsPage /> },
        { path: 'restaurant/:id', element: <RestaurantDetail /> },
        {
          path: 'cart',
          element: <ProtectedRoute roles={['user']}><CartPage /></ProtectedRoute>
        },
        {
          path: 'orders',
          element: <ProtectedRoute roles={['user']}><OrdersPage /></ProtectedRoute>
        },
        {
          path: 'profile',
          element: <ProtectedRoute roles={['user', 'vendor', 'admin', 'deliveryPartner']}><ProfilePage /></ProtectedRoute>
        },
        // Vendor
        {
          path: 'vendor',
          element: <ProtectedRoute roles={['vendor']}><VendorDashboard /></ProtectedRoute>
        },
        {
          path: 'vendor/restaurants',
          element: <ProtectedRoute roles={['vendor']}><VendorRestaurants /></ProtectedRoute>
        },
        {
          path: 'vendor/products',
          element: <ProtectedRoute roles={['vendor']}><VendorProducts /></ProtectedRoute>
        },
        {
          path: 'vendor/orders',
          element: <ProtectedRoute roles={['vendor']}><VendorOrders /></ProtectedRoute>
        },
        // Admin
        {
          path: 'admin',
          element: <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
        },
        {
          path: 'admin/users',
          element: <ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>
        },
        {
          path: 'admin/orders',
          element: <ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>
        },
          {
            path: 'admin/restaurants',
            element: <ProtectedRoute roles={['admin']}><AdminRestaurants /></ProtectedRoute>
          },
          {
            path: 'admin/delivery',
            element: <ProtectedRoute roles={['admin']}><AdminDeliveryPartners /></ProtectedRoute>
          },
        // Delivery
        {
          path: 'delivery',
          element: <ProtectedRoute roles={['deliveryPartner']}><DeliveryDashboard /></ProtectedRoute>
        },
      ]
    },
    { path: '/login', element: <Login /> },
    { path: '/signup', element: <Register /> },
    { path: '/logout', element: <Logout /> },
  ])

  return (
    <UserProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </UserProvider>
  )
}

export default App