
export const mainSanWaterRoute = `/sanwater/admins/secure`
export const ABOUT = `/about`
export const PRODUCTS = `/products`
export const NEWS = `/news`
export const CONTACTSALES = `/contact_sales`
export const PRODUCTVIEWDETAIL = `/products/view/:serialNumber`;
export const AUTH = `${mainSanWaterRoute}/auth`

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
    },
    analystics: {
       subPath: `analystics`,
       fullPath: `${mainSanWaterRoute}/analystics`  
    },
    settings: {
       subPath: `settings`,
       fullPath: `${mainSanWaterRoute}/settings`  
    },
   content: {
        subPath: `content`,
        fullPath: `${mainSanWaterRoute}/content`,

        children: {
            news: {
            subPath: `edit-news`,
            fullPath: `${mainSanWaterRoute}/content/edit-news`,
            },

            images: {
            subPath: `edit-images`,
            fullPath: `${mainSanWaterRoute}/content/edit-images`,
            },

            sales: {
            subPath: `edit-sales`,
            fullPath: `${mainSanWaterRoute}/content/edit-sales`,
            },
        },
        },
    auth: {
        login: {
            subPath: `auth/login`,
            fullPath: `${mainSanWaterRoute}/auth/login`
        },
        register: {
            subPath: `auth/register`,
            fullPath: `${mainSanWaterRoute}/auth/register`
        },
    }
}