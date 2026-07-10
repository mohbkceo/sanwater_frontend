
export const mainSanWaterRoute = `/sanwater/admins/secure`
export const ABOUT = `/about`
export const PRODUCTS = `/products`
export const NEWS = `/news`
export const CONTACTSALES = `/contact_sales`
export const PRODUCTVIEWDETAIL = `/products/view/:serialNumber`;
export const LANDINGPRODUCT = `/products/landing_product/:serialNumber`;
export const AUTH = `${mainSanWaterRoute}/auth`

export const SANWATERGROUPROUTES = {
    users: {
        list: {
            subPath: `users`,
            fullPath: `${mainSanWaterRoute}/users`
        }
    },
    logs: {
        list: {
            subPath: `logs`,
            fullPath: `${mainSanWaterRoute}/logs`
        }
    },
    hiring: {
        list: {
            subPath: `hiring`,
            fullPath: `${mainSanWaterRoute}/hiring`
        }
    },
    submissions: {
        list: {
            subPath: `submissions`,
            fullPath: `${mainSanWaterRoute}/submissions`
        }
    },
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
    profile: {
       subPath: `profile`,
       fullPath: `${mainSanWaterRoute}/profile`
    },
    orders: {
       subPath: `orders`,
       fullPath: `${mainSanWaterRoute}/orders`
    },
    settings: {
       subPath: `settings`,
       fullPath: `${mainSanWaterRoute}/settings`,
       children: {
        manage_users: {
            subPath: "settings/manage_users",
            fullPath: `${mainSanWaterRoute}/settings/manage_users`
        }
       }
    },
    profile: {
         subPath: `profile`,
         fullPath: `${mainSanWaterRoute}/profile`,
    },
    content: {
        subPath: `content`,
        fullPath: `${mainSanWaterRoute}/content`,

        children: {
            news: {
            subPath: `content/edit-news`,
            fullPath: `${mainSanWaterRoute}/content/edit-news`,
            },

            images: {
            subPath: `content/edit-images`,
            fullPath: `${mainSanWaterRoute}/content/edit-images`,
            },

            sales: {
            subPath: `content/edit-sales`,
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