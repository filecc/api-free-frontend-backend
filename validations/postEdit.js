/**
 * @type {import("express-validator").Schema}
 */

const { PrismaClient } = require("@prisma/client");
const CustomError = require("../lib/CustomError");
const prisma = new PrismaClient();


module.exports = {
    slug: {
        in: ["body"],
        isString: {
            bail: true,
            errorMessage: 'Slug must be provided and has to be a string.',
        },
        custom: {
            options: async (value) => {
                await prisma.post.findUnique({
                    where: {
                        slug: value
                    }
                }).then((post) => {
                    if(!post){
                        throw new Error(`Post with slug '${value}' not found.`, 404)
                    }
                    return true
                })
                .catch((error) => {
                    throw new CustomError('Something went wrong. (Err: PostEdit-30)', 500)
                })
            }
        }
        
    },
    title: {
        in: ["body"],
        isString: true,
        errorMessage: 'Title must be a string.',
        optional: true
    },
    content: {
        in: ["body"],
        isString: true,
        errorMessage: 'Content has to be a string.',
        isLength: {
            options: { min: 10 },
            errorMessage: 'Content must be at least 10 characters long.'
        },
        optional: true
    },
    published: {
        in: ["body"],
        isBoolean: true,
        toBoolean: true,
        errorMessage: 'You can specifiy 0 or false for unpublished posts and 1 or true for published posts.',
        optional: true
    },
    image: {
        in: ["body"],
        isString: true,
        isURL: {
            errorMessage: "Not a valid URL"
        },
        optional: true
    },
    category: {
        in: ["body"],
        isInt: {
            bail: true,
            errorMessage: 'Category has to be an integer.',
        },
        custom: {
            options: async (value) => {
                const categories = await prisma.category.findMany()
                const categoryIds = categories.map((category) => category.id.toString())
              
                if(!categoryIds.includes(value)){
                    throw new Error(`Category ${value} does not exist. Possible values: [${categories.map(category => {
                        return [category.id, category.name].join(': ')
                    }).join(" - ")}]`)
                }
                return true
            }
        },
        optional: true
    }, 
    tags: {
        in: ["body"],
        isArray: {
            bail: true,
            errorMessage: 'Tags have to be an array of string.',
        },
        optional: true
    }
    
    
}

