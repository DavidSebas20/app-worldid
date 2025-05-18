"use client"
import { Car, ShoppingBag, User, Plus } from "lucide-react"

interface BottomNavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isAuthenticated: boolean
}

export default function BottomNavigation({ activeTab, setActiveTab, isAuthenticated }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => setActiveTab("cars")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            activeTab === "cars" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <Car className="h-6 w-6" />
          <span className="text-xs mt-1">Autos</span>
        </button>

        <button
          onClick={() => setActiveTab("mybids")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            activeTab === "mybids" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <ShoppingBag className="h-6 w-6" />
          <span className="text-xs mt-1">Mis Pujas</span>
        </button>

        {isAuthenticated && (
          <button
            onClick={() => setActiveTab("addcar")}
            className={`flex flex-col items-center justify-center w-full h-full ${
              activeTab === "addcar" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <Plus className="h-6 w-6" />
            <span className="text-xs mt-1">Añadir Auto</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            activeTab === "profile" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Perfil</span>
        </button>
      </div>
    </div>
  )
}
