import { catchAsync } from '../utils/catchAsync.js';


export function createProductController({ productService }) {
    

    return {

        getAllProducts: catchAsync(async (req, res) => {
            const products = await productService.getAllProducts();
            console.log("Qp: ",req.validated);
            res.status(200).json({
                success: true,
                message: 'Products retrieved successfully.',
                data: { products },
            });
        }),
        listProducts: catchAsync(async (req, res) => {
            const products = await productService.list(req.validated.query, req.LoginUser);
            res.status(200).json({
                success: true,
                message: 'Products retrieved successfully.',
                data: products,
            });
        }),
        getProductById: catchAsync(async (req, res) => {
            const product = await productService.getById(req.params.id, req.user);
            res.status(200).json({
                success: true,
                message: 'Product retrieved successfully.',
                data: { product },
            });
        }),

    }
 
}