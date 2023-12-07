const express = require("express");
const jwt = require("jsonwebtoken");
const Post = require("../lib/Post");
const generateJWT = require("../lib/generateJWT");
const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient()
const CustomError= require("../lib/CustomError");
const CustomErrorValidation = require("../lib/CustomError");
const slugGenerator = require("../lib/slugGenerator");
const { validationResult } = require("express-validator");


const port = process.env.PORT ?? "";
// @ts-ignore
const host = process.env.HOST.includes("localhost")
  ? "localhost"
  : "https://" + process.env.HOST + "/";

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */

async function index(req, res, next) {
  const query = req.query
 
  
  if(Object.keys(query).length != 0){
    const { maxResult, startIndex } = query
    if(maxResult < 1 || startIndex < 0 || !startIndex){
      next(new CustomError(400, "startIndex and maxResults are required"))
      return
    }

    await prisma.post.findMany({
      include: {
        tags: true
      }
    })
    .then(async (posts) => {
      const parsedStart = parseInt(startIndex)
      const parsedMax = parseInt(maxResult)
      const totalResults = posts.length
      
      const possibleLimit = (parsedStart + parsedMax) <= totalResults ? (parsedStart + parsedMax) : totalResults
      

      const newIndex = (possibleLimit + parsedMax) <= (totalResults) 
      ? (parsedStart + parsedMax) 
      : (parsedStart + 1 < totalResults ? totalResults - 1 : null)
      

      const nextPage = newIndex 
      ? `http://${host}:${port}/api/posts?maxResult=${parsedMax}&startIndex=${newIndex}` 
      : null
      await prisma.user.findMany({
        select: {
          id: true, 
          name: true,
          email: true
        }
      }).then((users) => {
        
        res.json({
          totalResults: posts.length,
          nextPage: nextPage,
          posts: posts.slice(startIndex, possibleLimit).map((post) => {
            const user = users.find((user) => user.id === post.postedById)
            const tags = post.tags.map((tag) => {
              return tag.name
            })
            return [{
              ...post, 
              author: {name: user?.name, email: user?.email},
              tags: post.tags.map((tag) => tag.name),
              image: `http://${host}:${port}/images${post.image}`,
            }]
          })
          
        }
        )
        return
      })
      
    })
    .catch((error) => {
      next(new CustomError(404, error.message))
      return
    })
  }

  await prisma.post.findMany({
    include: {
      tags: {
        select: {
          name: true
        },
        orderBy: {
          name: "asc"
        }
      }
    }
  })
  .then(async (posts) => {
    await prisma.user.findMany({
      select: {
        id: true, 
        name: true,
        email: true
      }
    }).then((users) => {
      
      if (posts.lenght === 0) {
        next(new CustomError(404, `No posts found`))
        return
      }
     
      const postsToReturn = posts.map((post) => {
        const user = users.find((user) => user.id === post.postedById)
        return {
          ...post,
          author: {name: user?.name, email: user?.email},
          tags: post.tags.map((tag) => tag.name),
          image: `http://${host}:${port}/images${post.image}`,
        }
      });
      res.json(postsToReturn)
      
  
      return 
    })
    
  })
  .catch((error) => {
    next(new CustomError(404, error.message))
    return
  })
  
  
}

async function show(req, res, next) {
  await prisma.post.findUnique({
    where: {
      slug: req.params.slug
    }
  })
  .then(async (post) => {
    if (!post) {
      next(new CustomError(404, `Post with slug ${req.params.slug} not found`))
      return
    }
    await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        id: true
      }
    }).then((users) => {
      const imgPath = `http://${host}:${port}/images${post.image}`;
      const downloadLink = `http://${host}:${port}/posts/${post.slug}/download`;
     const user = users.find((user) => user.id === post.postedById)
      
      res.json({
        ...post,
        author: {name: user?.name, email: user?.email},
        image: imgPath,
        image_url: `${imgPath}`,
        download_link: `${downloadLink}`,
      });
    })
    

    
  })
  .catch((error) => {
    next(new CustomError(404, error.message))
    return
  })
  
  

}

async function store (req, res, next) {
  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    next(new CustomErrorValidation('Some errors', 500, validation.array()))
    return
  }
  const data = req.body 
  const token = req.cookies['pl-token']
  
  // @ts-ignore
  const { id } = jwt.decode(token)
  let imageSlug;

  const slug = await slugGenerator(data.title)
  const tags = data.tags
  const newPost = new Post(
    data.title, 
    slug,
    data.content,
    data.published === "true" ? true : false,
    imageSlug ?? '/placeholder.jpg',
    parseInt(data.category),
    tags,
    id
    )

  
   
    try {
      prisma.post.create({
        data: {
          title: newPost.title,
          content: newPost.content,
          published: newPost.published,
          image: newPost.image,
          slug: newPost.slug,
          categoryId: newPost.category,
          postedById: newPost.postedById,
          tags: {
            connectOrCreate: newPost.tags.map((tag) => {
              return {
                where: {
                  name: tag,
                  slug: tag
                },
                create: {
                  name: tag,
                  slug: tag
                }
              }
            })
            
          }
        }
      })
      .then(async (post) => {
        const postCreated = await prisma.post.findUnique({
          where: {
            slug: post.slug
          }, 
          include: {
            tags: {
              select: {
                name: true
              }
            }
          }
        })
        if(postCreated && postCreated.tags){
          // @ts-ignore
          postCreated.tags = postCreated.tags.map((tag) => tag.name)
        }
        
        res.json(postCreated)
      })
      .catch((error) => {
        next(new CustomError(404, error.message))
        return
      })
    } catch (error) {
      next(new CustomError(400, error.message))
      return
    }
}

async function destroy(req, res, next) {
  
  const validation = validationResult(req);
  if(!validation.isEmpty()){
    next(new CustomErrorValidation('Some errors', 500, validation.array()))
    return
  }

  const { slug } = req.body

  await prisma.post.delete({
    where: {
      slug: slug
    },
    include: {
      tags: true
    }
  })
  .then((post) => {
    const oldPost = post
    oldPost.tags = oldPost.tags.map((tag) => tag.name)
    res.json({
      message: `Post with slug '${slug}' deleted`,
      oldPost: oldPost
    })
  })
  .catch((error) => {
    next(new CustomError(404, error.message))
    return
  })
}

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {express.NextFunction} next 
 * @returns 
 */
async function edit(req, res, next){

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    next(new CustomErrorValidation('Some errors', 500, validation.array()))
    return
  }
  
  const data = req.body

  if(Object.keys(data).length === 0 || Object.keys(data).length === 1 && data.slug){
    res.json({
      message: "Nothing to change."
    })
    return
  }

  const { title, content, published, image, category, tags, slug } = req.body

  const oldPost = await prisma.post.findUnique({
    where: {
      slug: slug
    },
    include: {
      tags: {
        select: {
          name: true
        }
      }
    }
  })

  // @ts-ignore
  const oldTags = oldPost.tags.map((tag) => tag.name)

  // @ts-ignore
  const newSlug = title ? await slugGenerator(title) : oldPost.slug

  const editedPost = new Post(
    // @ts-ignore
    title ?? oldPost.title, 
    newSlug,
    // @ts-ignore
    content ?? oldPost.content, 
    // @ts-ignore
    published ?? oldPost.published,
    // @ts-ignore
    image ?? oldPost.image,
    // @ts-ignore
    category ?? oldPost.categoryId,
    tags ?? oldTags
    )

 
  await prisma.post.update({
    where: {
      slug: slug
    },
    data: {
      title: editedPost.title,
      slug: editedPost.slug,
      content: editedPost.content,
      published: editedPost.published,
      image: editedPost.image,
      categoryId: editedPost.category,
      tags: {
        set: [],
        connectOrCreate: editedPost.tags.map((tag) => {
          return {
            where: {
              name: tag,
              slug: tag
            },
            create: {
              name: tag,
              slug: tag
            }
          }
        })
        
      }
    }
  
  })
  .then(async (post) => {
    const postEdited = await prisma.post.findUnique({
      where: {
        slug: post.slug
      },
      include: {
        tags: true
      }
    })
    // @ts-ignore
    postEdited.tags = postEdited.tags.map((tag) => tag.name)
    res.json(postEdited)
    return
  })
  .catch((error) => {
    next(new CustomError(404, error.message))
    return
  })
}

async function register(req, res, next){
  res.json({
    ciao: 'registrati'
  })
}

module.exports = {
  index,
  show,
  store,
  destroy,
  edit,
  register
};
