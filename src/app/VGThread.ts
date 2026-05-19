import { VGThreadFetcher } from "./threadFetcher/VGThreadFetcher";
import { VGController } from "./VGController";
import { VGPost } from "./VGPost";

export class VGThread {
  private controller: VGController;

  private threadName: string = "";
  private postIDs: number[] = [];
  private posts = new Map<number, VGPost>();

  private fetchDone: boolean = false;
  private fetcher: VGThreadFetcher;

  /////

  constructor(controller: VGController, fetcher: VGThreadFetcher) {
    this.controller = controller;
    this.fetcher = fetcher;
  }

  /////

  public get ThreadName(): string {
    return this.threadName;
  }

  public get PostCount(): number {
    return this.PostIDs.length;
  }

  public get PostIDs(): number[] {
    return this.postIDs;
  }

  public get Posts(): Map<number, VGPost> {
    return this.posts;
  }

  /////

  public async FetchPosts(): Promise<void> {
    if (this.fetchDone) return;

    try {
      const threadModel = await this.fetcher.Fetch();

      this.threadName = threadModel.title;

      for (const postModel of threadModel.posts) {
        var post = new VGPost(this.controller, postModel);

        if (post.Images.length > 0) {
          this.posts.set(postModel.postID, post);
          this.postIDs.push(postModel.postID);
        }
      }

      this.fetchDone = true;
    } catch (err) {
      console.error(err);
    }
  }
}
