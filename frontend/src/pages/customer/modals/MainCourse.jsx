import React from "react";
import { X, Star, Flame, Leaf, Clock, Plus } from "lucide-react";

const MainCourseModal = ({ isOpen, onClose, addtocart }) => {
    const mainCourses = [
        {
            id: 101,
            name: "Dal Bhat Tarkari (Chicken)",
            description: "Steamed rice, lentil soup, seasonal veggies, achar + chicken curry",
            price: 420,
            image: "🍛",
            rating: 4.9,
            isVeg: false,
            isSpicy: true,
            prepTime: "18 min",
            popular: true,
        },
        {
            id: 102,
            name: "Dal Bhat Tarkari (Veg)",
            description: "Classic Nepali set: rice, dal, tarkari, saag, achar, papad",
            price: 320,
            image: "🥗",
            rating: 4.7,
            isVeg: true,
            isSpicy: false,
            prepTime: "15 min",
            popular: true,
        },
        {
            id: 103,
            name: "Chicken Thakali Set",
            description: "Thakali style dal-bhat with gundruk, aloo-tama, achar + chicken",
            price: 520,
            image: "🍗",
            rating: 4.8,
            isVeg: false,
            isSpicy: true,
            prepTime: "20 min",
            popular: true,
        },
        {
            id: 104,
            name: "Veg Thakali Set",
            description: "Thakali set with local pickles, gundruk, saag, aloo-tama",
            price: 420,
            image: "🍲",
            rating: 4.6,
            isVeg: true,
            isSpicy: true,
            prepTime: "18 min",
            popular: false,
        },
        {
            id: 105,
            name: "Chicken Chowmein",
            description: "Wok-tossed noodles with chicken, veggies, soy and Nepali spices",
            price: 280,
            image: "🍜",
            rating: 4.7,
            isVeg: false,
            isSpicy: false,
            prepTime: "12 min",
            popular: true,
        },
        {
            id: 106,
            name: "Veg Chowmein",
            description: "Stir-fried noodles with fresh veggies and light sauce",
            price: 220,
            image: "🍜",
            rating: 4.5,
            isVeg: true,
            isSpicy: false,
            prepTime: "10 min",
            popular: false,
        },
        {
            id: 107,
            name: "Buff Momo Platter (Jhol)",
            description: "Buff momo served with spicy soup (jhol) and house achar",
            price: 260,
            image: "🥟",
            rating: 4.8,
            isVeg: false,
            isSpicy: true,
            prepTime: "14 min",
            popular: true,
        },
        {
            id: 108,
            name: "Chicken Fried Rice",
            description: "Fragrant fried rice with chicken, egg, veggies and spring onion",
            price: 300,
            image: "🍚",
            rating: 4.6,
            isVeg: false,
            isSpicy: false,
            prepTime: "12 min",
            popular: false,
        },
        {
            id: 109,
            name: "Veg Fried Rice",
            description: "Fried rice with mixed veggies and light seasoning",
            price: 240,
            image: "🍚",
            rating: 4.4,
            isVeg: true,
            isSpicy: false,
            prepTime: "10 min",
            popular: false,
        },
        {
            id: 110,
            name: "Newari Samay Baji (Set)",
            description: "Beaten rice set with choila, egg, bhutan, achar (varies by cafe)",
            price: 480,
            image: "🍽️",
            rating: 4.7,
            isVeg: false,
            isSpicy: true,
            prepTime: "16 min",
            popular: true,
        },
        {
            id: 111,
            name: "Paneer Butter Masala + Naan",
            description: "Creamy paneer curry with 2 naan (Indian-Nepali cafe favorite)",
            price: 420,
            image: "🧀",
            rating: 4.6,
            isVeg: true,
            isSpicy: false,
            prepTime: "18 min",
            popular: false,
        },
        {
            id: 112,
            name: "Chicken Sekuwa Plate",
            description: "Char-grilled chicken sekuwa with salad, achar and lemon",
            price: 450,
            image: "🔥",
            rating: 4.8,
            isVeg: false,
            isSpicy: true,
            prepTime: "17 min",
            popular: true,
        },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50" onMouseDown={onClose}>
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
                            <h2 className="text-2xl font-bold text-white">Main Course</h2>
                            <p className="text-orange-100 text-sm">Hearty meals, cafe classics</p>
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
                        {/* Info Banner */}
                        <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg flex items-start gap-3">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-lg">🍽️</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Fresh & Filling</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Prepared fresh — ask for less spicy or extra achar.
                                </p>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mainCourses.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                                >
                                    {/* Image */}
                                    <div className="relative aspect-video bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">
                                        {item.image}
                                        {item.popular && (
                                            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                <Flame size={12} />
                                                Popular
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-base text-gray-900 group-hover:text-orange-500 transition-colors">
                                                    {item.name}
                                                </h3>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                    {item.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg ml-2">
                                                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                                <span className="text-xs font-semibold text-gray-900">
                                                    {item.rating}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                                            {item.isVeg && (
                                                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                                                    <Leaf size={10} />
                                                    Veg
                                                </span>
                                            )}
                                            {item.isSpicy && (
                                                <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                                                    <Flame size={10} />
                                                    Spicy
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full">
                                                <Clock size={10} />
                                                {item.prepTime}
                                            </span>
                                        </div>

                                        {/* Price + Add */}
                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                            <p className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                                                Rs. {item.price}
                                            </p>
                                            <button
                                                onClick={() => addtocart(item)}
                                                className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm font-medium"
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
    );
};

export default MainCourseModal;
