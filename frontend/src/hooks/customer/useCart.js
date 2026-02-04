import { useState } from "react"

const useCart = () => {
    const [cart, setcart] = useState([])

    const addtocart = (item) => {
        setcart((prev) => [...prev, item])
    }

    return { cart, addtocart }
}
export default useCart