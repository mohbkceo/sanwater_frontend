
export const mainSanWaterRoute = `/sanwater/admins/secure`
export const ABOUT = `/about`
export const PRODUCTS = `/products`
export const NEWS = `/news`
export const CONTACTSALES = `/contact_sales`
export const PRODUCTVIEWDETAIL = `/products/view/:serialNumber`;
export const LANDINGPRODUCT = `/products/landing_product/:serialNumber`;
export const COMPARE = `/products/compare`;
export const FAVORITES = `/favorites`;
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
        categories: {
            list: {
                subPath: `products/categories`,
                fullPath: `${mainSanWaterRoute}/products/categories`,
            },
            create: {
                subPath: `products/categories/create`,
                fullPath: `${mainSanWaterRoute}/products/categories/create`,
            },
            edit: {
                subPath: `products/categories/edit`,
                fullPath: `${mainSanWaterRoute}/products/categories/edit`,
            },
        },
        collections: {
            list: {
                subPath: `products/collections`,
                fullPath: `${mainSanWaterRoute}/products/collections`,
            },
            create: {
                subPath: `products/collections/create`,
                fullPath: `${mainSanWaterRoute}/products/collections/create`,
            },
            edit: {
                subPath: `products/collections/edit`,
                fullPath: `${mainSanWaterRoute}/products/collections/edit`,
            },
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
    quotations: {
       subPath: `quotations`,
       fullPath: `${mainSanWaterRoute}/quotations`
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