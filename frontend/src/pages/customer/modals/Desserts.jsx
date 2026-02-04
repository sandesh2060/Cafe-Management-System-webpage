import React from "react";
import { X, Star, Flame, Leaf, Clock, Plus } from "lucide-react";

const DessertsModal = ({ isOpen, onClose, addtocart }) => {
    const desserts = [
        {
            id: 201,
            name: "Yomari",
            description: "Newari sweet dumpling filled with chaku and sesame (seasonal favorite)",
            price: 180,
            image: "🥟",
            rating: 4.8,
            isVeg: true,
            isSpicy: false,
            prepTime: "10 min",
            popular: true,
        },
        {
            id: 202,
            name: "Sel Roti + Dahi",
            description: "Crispy sel roti served with fresh curd (classic Nepali combo)",
            price: 160,
            image: "🍩",
            rating: 4.6,
            isVeg: true,
            isSpicy: false,
            prepTime: "8 min",
            popular: true,
        },
        {
            id: 203,
            name: "Juju Dhau (King Curd)",
            description: "Thick, creamy Bhaktapur curd — mildly sweet and rich",
            price: 140,
            image: "🥛",
            rating: 4.9,
            isVeg: true,
            isSpicy: false,
            prepTime: "2 min",
            popular: true,
        },
        {
            id: 204,
            name: "Gulab Jamun (2 pcs)",
            description: "Soft milk dumplings soaked in cardamom sugar syrup",
            price: 120,
            image: "🍯",
            rating: 4.7,
            isVeg: true,
            isSpicy: false,
            prepTime: "5 min",
            popular: false,
        },
        {
            id: 205,
            name: "Rasmalai (2 pcs)",
            description: "Cottage cheese discs in saffron milk — cafe classic",
            price: 180,
            image: "🥣",
            rating: 4.7,
            isVeg: true,
            isSpicy: false,
            prepTime: "5 min",
            popular: false,
        },
        {
            id: 206,
            name: "Chocolate Brownie",
            description: "Fudgy brownie, served warm (optional ice cream add-on)",
            price: 220,
            image: "🍫",
            rating: 4.6,
            isVeg: true,
            isSpicy: false,
            prepTime: "7 min",
            popular: true,
        },
        {
            id: 207,
            name: "Fruit Salad (Seasonal)",
            description: "Fresh seasonal fruits with a light honey drizzle",
            price: 200,
            image: "🍓",
            rating: 4.4,
            isVeg: true,
            isSpicy: false,
            prepTime: "6 min",
            popular: false,
        },
        {
            id: 208,
            name: "Ice Cream Scoop (Vanilla/Choco)",
            description: "Single scoop — simple and clean (ask for flavors)",
            price: 120,
            image: "🍨",
            rating: 4.5,
            isVeg: true,
            isSpicy: false,
            prepTime: "2 min",
            popular: false,
        },
        {
            id: 209,
            name: "Carrot Halwa",
            description: "Gajar halwa cooked slow with milk, ghee and nuts",
            price: 180,
            image: "🥕",
            rating: 4.6,
            isVeg: true,
            isSpicy: false,
            prepTime: "6 min",
            popular: false,
        },
        {
            id: 210,
            name: "Cheesecake Slice",
            description: "Creamy cheesecake slice (flavor depends on availability)",
            price: 280,
            image: "🍰",
            rating: 4.7,
            isVeg: true,
            isSpicy: false,
            prepTime: "4 min",
            popular: true,
        },
        {
            id: 211,
            name: "Waffle (Classic)",
            description: "Crispy waffle with chocolate sauce (optional toppings)",
            price: 320,
            image: "🧇",
            rating: 4.6,
            isVeg: true,
            isSpicy: false,
            prepTime: "10 min",
            popular: false,
        },
        {
            id: 212,
            name: "Kulfi (Malai)",
            description: "Traditional frozen dessert with rich malai taste",
            price: 160,
            image: "🍦",
            rating: 4.5,
            isVeg: true,
            isSpicy: false,
            prepTime: "3 min",
            popular: false,
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
                            <h2 className="text-2xl font-bold text-white">Desserts</h2>
                            <p className="text-orange-100 text-sm">Sweet finish, cafe favorites</p>
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
                                <span className="text-white text-lg">🍰</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Fresh & Sweet</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Ask for less sugar or extra toppings (if available).
                                </p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {desserts.map((item) => (
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
                                                <span className="text-xs font-semibold text-gray-900">{item.rating}</span>
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

export default DessertsModal;
