import { PUBLIC_API_URL } from '$env/static/public';
import { PUBLIC_ESTORE_ID } from '$env/static/public';
import { myFetch } from '$lib/utils/myFetch';

 
export async function load() {
  let url = `${PUBLIC_API_URL}/review/reviews/?page_size=6&estore_id=${PUBLIC_ESTORE_ID}&ordering=-id`;
  
  let tags = [];
  let recentBlogs = [];
  let blogCategories = [];

  try{
    let url = `${PUBLIC_API_URL}/blog/tags?ordering=-id&estore_id=${PUBLIC_ESTORE_ID}`;
    let data = await myFetch(url);
    tags = data.results;
    } catch (e) {
    } 


    try{
        let url = `${PUBLIC_API_URL}/blog/blogs?page_size=5&ordering=-id&estore_id=${PUBLIC_ESTORE_ID}`;
        let data = await myFetch(url);
        recentBlogs = data.results;
        } catch (e) {
        }

    try{
        let url = `${PUBLIC_API_URL}/product/categories/?has_blogs=true&estore_id=${PUBLIC_ESTORE_ID}`;
        let data = await myFetch(url);
        blogCategories = data.results;
        } catch (e) {
        } 
    

  return {
    tags: tags,
    recentBlogs:recentBlogs,
    blogCategories: blogCategories,
  };
}