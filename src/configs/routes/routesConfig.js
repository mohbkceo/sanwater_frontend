
export const mainSanWaterRoute = `/sanwater/admins/secure`
export const ABOUT = `/about`
export const PRODUCTS = `/products`
export const CONTACTSALES = `/contact_sales`

export const SANWATERGROUPROUTES = {
    products: {
        list: {
            subPath: `products`,
            fullPath: `${mainSanWaterRoute}/products`
        },
        create: {
            fullPath: `${mainSanWaterRoute}/products/create`,
            subPath: `products/create`,
        },

        edit: {
            fullPath: `${mainSanWaterRoute}/products/edit`, 
            subPath: `products/edit`
        },
    }
}