/**
 * @type {import("express-validator").Schema}
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


module.exports = {
    title: {
        in: ["body"],
        isString: true,
        errorMessage: 'Title must be provided and has to be a string.'
    },
    content: {
        in: ["body"],
        isString: true,
        errorMessage: 'Content must be provided and has to be a string.',
        isLength: {
            options: { min: 10 },
            errorMessage: 'Content must be at least 10 characters long.'
        }
    },
    published: {
        in: ["body"],
        isBoolean: true,
        toBoolean: true,
        errorMessage: 'You can specifiy 0 or false for unpublished posts and 1 or true for published posts.'
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
            errorMessage: 'Category must be provided and has to be an integer.',
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
       
    }, 
    tags: {
        in: ["body"],
        isArray: {
            bail: true,
            errorMessage: 'Tags must be provided and have to be an array.',
        },
    }
    
    
}

