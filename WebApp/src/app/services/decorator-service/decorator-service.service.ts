import { Injectable } from '@angular/core';
import { UtilsService } from 'src/app/services/utils-service/utils-service.service';

@Injectable({
  providedIn: 'root'
})
export class DecoratorService {

  constructor(private utilsService: UtilsService) { }

  /**
   * Decorates a single post
   * @param post object (post)
   * @returns object (post)
   */
  public postDecorator(post) {
      post.inputComment = "";
      post.dateDiff = this.utilsService.getTimeDifferenceFromNow(post.date);

      for(let j=0; j<post.comments.length; j++) {
        post.comments[j].bShowResponse = false;
        post.comments[j].dateDiff = this.utilsService.getTimeDifferenceFromNow(post.comments[j].date);
        
        for(let k=0; k<post.comments[j].replies.length; k++) {
          post.comments[j].replies[k].dateDiff = this.utilsService.getTimeDifferenceFromNow(post.comments[j].replies[k].date);
        }
      
      }
    
    return post;
  }

  /**
   * Removes the decoration made by the postDecorator function
   * @param postList object (post)
   * @returns object (post)
   */
  public postDecoratorRemove(post) {
      delete post.inputComment;
      delete post.dateDiff;

      for(let j=0; j<post.comments.length; j++) {
        delete post.comments[j].bShowReplies;
        delete post.comments[j].dateDiff;

        for(let k=0; k<post.comments[j].replies.length; k++) {
          delete post.comments[j].replies[k].dateDiff;
        }

      }

    return post;
  }
  
  /**
   * Decorates homepage posts
   * @param postList array of objects (posts)
   * @returns array of objects (posts)
   */
  public homepagePostDecorator(postList) {
    for (let i=0; i<postList.length; i++) {
      postList[i] = this.postDecorator(postList[i]);
    } 

    return postList;
  }

  /**
   * Removes the decoration made by the homepagePostDecorator function
   * @param postList array of objects (posts)
   * @returns array of objects (posts)
   */
  public homepagePostDecoratorRemove(postList) {
    for (let i=0; i<postList.length; i++) {
      postList[i] = this.postDecoratorRemove(postList[i]);
    } 

    return postList;
  }
  
  /**
   * Decorates user
   * @param user object (user)
   * @returns object (user)
   */
  public userDecorator(user) {
    for (let i=0; i<user.stories.length; i++) {
      user.stories[i].dateDiff = this.utilsService.getTimeDifferenceFromNow(user.stories[i].date);
    }

    for (let i=0; i<user.posts.length; i++) {
      user.posts[i] = this.postDecorator(user.posts[i]);
    } 

    return user;
  }

  /**
   * Removes the decoration made by the userDecorator function
   * @param user object (user)
   * @returns object (user)
   */
  public userDecoratorRemove(user) {
    for (let i=0; i<user.stories.length; i++) {
      delete user.stories[i].dateDiff;
    }

    for (let i=0; i<user.posts.length; i++) {
      user.posts[i] = this.postDecoratorRemove(user.posts[i]);
    } 

    return user;
  }
}
