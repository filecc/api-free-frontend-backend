const slugGenerator = require('./slugGenerator');

class Post {
    title;
    content;
    slug;
    published;
    image;
    category;
    tags;
    postedById;

    constructor(title, slug, content, published, image, category, tags, postedById){
        this.title = title;
        this.slug = slug;
        this.content = content;
        this.published = published;
        this.image = image;
        this.category = category;
        this.tags = tags;
        this.postedById = postedById;
      
    }
}

module.exports = Post;