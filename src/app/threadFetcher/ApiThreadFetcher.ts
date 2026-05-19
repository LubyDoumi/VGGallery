import { VGController } from "../VGController";
import {
  VGImageModel,
  VGImageTypeModel,
  VGPostModel,
  VGThreadFetcher,
  VGThreadModel,
} from "./VGThreadFetcher";

export class ApiThreadFetcher implements VGThreadFetcher {
  private controller: VGController;
  private fetchURL: string;

  /////

  constructor(controller: VGController, pageURL: string) {
    const pageThreadID = parseInt(pageURL.split("/threads/")[1].split("-")[0]);

    var url = new URL(pageURL);

    this.controller = controller;
    this.fetchURL = `https://${url.hostname}/vr.php?t=${pageThreadID}`;
  }

  /////

  private Post(node: Element): VGPostModel {
    const post: VGPostModel = {
      imageCount: parseInt(node.getAttribute("imagecount") ?? "0"),
      images: [],
      postID: parseInt(node.getAttribute("id")!),
      title: node.getAttribute("title")!,
    };

    const imagesNode = node.querySelectorAll("image") ?? [];

    for (const imageNode of imagesNode) {
      post.images.push(this.Image(imageNode));
    }

    return post;
  }

  private Image(node: Element): VGImageModel {
    const imageURL = node.getAttribute("main_url")!;
    const thumbnailURL = node.getAttribute("thumb_url") ?? imageURL;
    const type = node.getAttribute("type")!;

    return {
      imageURL: imageURL,
      thumbnailURL: thumbnailURL,
      type: type as VGImageTypeModel,
    };
  }

  /////

  public async Fetch(): Promise<VGThreadModel> {
    const request = this.controller.RequestQueue.add({
      method: "GET",
      url: this.fetchURL,
    });

    try {
      await request.wait();
    } catch (err) {
      throw err;
    }

    if (request.httpStatus !== 200) {
      throw new Error("[VGGallery] FetchPosts: unexpected HTTP status");
    }

    const xml = this.controller.DomParser.parseFromString(
      request.response!.responseText,
      "application/xml",
    );
    const threadNode = xml.querySelector("thread")!;
    const threadTitle = threadNode.getAttribute("title") ?? "Thread";
    const postNodes = xml.querySelectorAll("post");
    const posts: VGPostModel[] = [];

    for (const node of postNodes) {
      const postModel = this.Post(node);

      if (postModel.imageCount > 0) posts.push(postModel);
    }

    return {
      title: threadTitle,
      posts: posts,
    };
  }
}
