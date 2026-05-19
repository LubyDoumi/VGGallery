import { VGGlobals } from "./VGGlobals";

export class VGForum {
  private threadIDs: number[] = [];
  private threadLinks = new Map<number, string>();

  /////

  public get ThreadIDs(): number[] {
    return this.threadIDs;
  }

  public get ThreadLinks(): Map<number, string> {
    return this.threadLinks;
  }

  /////

  constructor() {
    this.SearchThreadsLink();
  }

  /////

  private SearchThreadsLink(): void {
    const threads = document.querySelectorAll("li.threadbit");

    for (const thread of threads) {
      const link = thread.querySelector<HTMLLinkElement>(
        'h3 > a[id^="thread_title"]',
      );
      const threadForum =
        thread.querySelector<HTMLLinkElement>(".threadpostedin > p > a") ??
        null;
      const isValidForum =
        threadForum === null ||
        VGGlobals.IsPhotosForum(new URL(threadForum.href));

      if (link !== null && isValidForum) {
        const threadID = parseInt(link.id.substring("thread_title_".length));

        this.threadIDs.push(threadID);
        this.threadLinks.set(threadID, link.href);
      }
    }
  }
}
