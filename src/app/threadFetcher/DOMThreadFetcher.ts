import {
  VGImageModel,
  VGPostModel,
  VGThreadFetcher,
  VGThreadModel,
} from "./VGThreadFetcher";

export class DOMThreadFetcher implements VGThreadFetcher {
  private isMobileTheme: boolean;

  /////

  constructor() {
    this.isMobileTheme = document.querySelector(".ui-mobile-viewport") !== null;
  }

  /////

  private Post(node: Element): VGPostModel {
    const postID = parseInt(node.id.substring("post_".length));
    const title = node.querySelector(
      this.isMobileTheme ? "h2.posttitle.icon" : "h2.title.icon",
    )!.textContent;
    const images: VGImageModel[] = [];
    const imagesNodes = node.querySelectorAll<HTMLAnchorElement>(
      "div.content a[target='_blank'][rel='nofollow']",
    );

    for (const imageNode of imagesNodes) {
      const imageModel = this.Image(imageNode);

      if (imageModel.thumbnailURL !== "") images.push(imageModel);
    }

    return {
      imageCount: images.length,
      images: images,
      postID: postID,
      title: title,
    };
  }

  private Image(node: HTMLAnchorElement): VGImageModel {
    return {
      imageURL: node.href,
      thumbnailURL: node.querySelector<HTMLImageElement>("img")?.src ?? "",
      type: "linked",
    };
  }

  /////

  public async Fetch(): Promise<VGThreadModel> {
    const threadTitle = document.querySelector(
      "span.threadtitle > a",
    )!.textContent;
    const postsNodes = [...document.querySelectorAll("li[id^='post_']")].filter(
      (el) => /^post_\d+$/.test(el.id),
    );
    const posts: VGPostModel[] = [];

    for (const postNode of postsNodes) {
      const postModel = this.Post(postNode);

      if (postModel.imageCount > 0) posts.push(postModel);
    }

    return {
      title: threadTitle,
      posts: posts,
    };
  }
}
