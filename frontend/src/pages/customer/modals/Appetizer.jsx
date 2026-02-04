import React from 'react'
import { X, Star, Flame, Leaf, Clock, Plus } from 'lucide-react'

const AppetizersModal = ({ isOpen, onClose, addtocart }) => {
    const appetizers = [
        {
            id: 1,
            name: 'Chicken Choila',
            description: 'Grilled chicken marinated with Nepali spices, mustard oil, and fresh herbs',
            price: 350,
            image: '🍗',
            rating: 4.8,
            isVeg: false,
            isSpicy: true,
            prepTime: '15 min',
            popular: true
        },
        {
            id: 2,
            name: 'Veg Momo (Steam)',
            description: 'Traditional Nepali dumplings filled with mixed vegetables, served with achar',
            price: 180,
            image: '🥟',
            rating: 4.9,
            isVeg: true,
            isSpicy: false,
            prepTime: '12 min',
            popular: true
        },
        {
            id: 3,
            name: 'Chicken Momo (Fried)',
            description: 'Crispy fried dumplings stuffed with spiced chicken mince',
            price: 220,
            image: '🥟',
            rating: 4.7,
            isVeg: false,
            isSpicy: true,
            prepTime: '14 min',
            popular: true
        },
        {
            id: 4,
            name: 'Chatpate',
            description: 'Spicy puffed rice mixed with vegetables, chickpeas, and tangy sauce',
            price: 120,
            image: '🍲',
            rating: 4.6,
            isVeg: true,
            isSpicy: true,
            prepTime: '5 min',
            popular: false
        },
        {
            id: 5,
            name: 'Samosa (2 pcs)',
            description: 'Crispy pastry filled with spiced potatoes and peas',
            price: 80,
            image: '🥟',
            rating: 4.5,
            isVeg: true,
            isSpicy: false,
            prepTime: '8 min',
            popular: false
        },
        {
            id: 6,
            name: 'Sukuti',
            description: 'Spicy dried buffalo meat fried with onions, tomatoes and green chilies',
            price: 400,
            image: '🥩',
            rating: 4.9,
            isVeg: false,
            isSpicy: true,
            prepTime: '10 min',
            popular: true
        },
        {
            id: 7,
            name: 'Paneer Chilli',
            description: 'Indo-Chinese style cottage cheese cubes tossed in spicy sauce',
            price: 280,
            image: '🧀',
            rating: 4.6,
            isVeg: true,
            isSpicy: true,
            prepTime: '12 min',
            popular: false
        },
        {
            id: 8,
            name: 'Chicken Lollipop',
            description: 'Crispy fried chicken wings marinated in spices, served with mayo',
            price: 320,
            image: '🍗',
            rating: 4.7,
            isVeg: false,
            isSpicy: true,
            prepTime: '15 min',
            popular: false
        },
        {
            id: 9,
            name: 'Aloo Sadeko',
            description: 'Spiced potato salad with sesame seeds, timur, and fresh coriander',
            price: 150,
            image: '🥔',
            rating: 4.4,
            isVeg: true,
            isSpicy: true,
            prepTime: '8 min',
            popular: false
        }
    ]

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50"
            onMouseDown={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal Wrapper */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Appetizers</h2>
                            <p className="text-orange-100 text-sm">Start your meal right</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X size={24} className="text-white" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {appetizers.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center text-6xl">
                                        {item.image}
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                                        <p className="text-xs text-gray-600 mt-1">{item.description}</p>

                                        <div className="flex items-center gap-2 mt-2">
                                            {item.isVeg && <Leaf size={12} className="text-green-600" />}
                                            {item.isSpicy && <Flame size={12} className="text-red-600" />}
                                            <Clock size={12} className="text-gray-500" />
                                            <span className="text-xs">{item.prepTime}</span>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <p className="text-lg font-bold text-orange-600">Rs. {item.price}</p>
                                            <button
                                                onClick={() => addtocart(item)}
                                                className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                                            >
                                                <Plus size={16} />
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default AppetizersModal
