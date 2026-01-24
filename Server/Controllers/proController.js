const Product = require('../Models/Product.models')

const getProducts = async (request, response) => {
        try {
        const products = await Product.find({})
        const convertedProducts = products.map(product => ({
            ...product.toObject(),
            price: convertINRToKES(product.price),
            currency: "KES"
        }))
        response.status(200).json(convertedProducts)
    } catch(error) {
        response.status(500).json({message: error.message})
    }
}

const createProduct = async (request, response) => {
    try {
        const product = await Product.create(request.body)
        response.status(500).json(product)
    } catch(error) {
        response.status(200).json({message: error.message})
    }
}

const getProduct = async (request, response) => {
    try {
        const { id } = request.params
        const product = await Product.findById(id)
        if (product) {
            const convertedProduct = {
                ...product.toObject(),
                price: convertINRToKES(product.price),
                currency: "KES"
            }
            response.status(200).json(convertedProduct)
        } else {
            response.status(404).json({ message: "Product not found" })
        }
    } catch (error) {
        response.status(500).json({ message: error.message })
    }
}



const deleteProduct = async (request, response) => {
    try {
        const { id } = request.params

        const product = await Product.findByIdAndDelete(id)

        if(!product) {
            return response.status(404).json({ message: "Product not found" })
        }
        response.status(200).json({ message: "Product deleted successfully"})
        
    } catch (error) {
        response.status(500).json({message: error.message})
    }
}

const updateProduct = async (request, response) => {
    try {
        const { id } = request.params

        const product = await Product.findByIdAndUpdate(id, request.body, { new: true })

        if(!product) {
            return response.status(404).json({ message: "Product not found"})
        }
    } catch (error) {
        const updateProduct = await Product.findById(id)
        response.status(201).json(updateProduct)
    }

}
 
module.exports = {
    getProducts,
    getProduct, 
    createProduct,
    updateProduct,
    deleteProduct
}