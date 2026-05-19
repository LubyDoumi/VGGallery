export type VGPageType =
  | "thread"
  | "forum"
  | "forumWithOptions"
  | "search"
  | "other";

interface VGPageTypeValidator {
  IsPageValid(): boolean;
}

class ThreadPageTypeValidator implements VGPageTypeValidator {
  public IsPageValid(): boolean {
    const breadcrumbLink =
      document.querySelector<HTMLLinkElement>(
        "div.body_wrapper > div#breadcrumb li.navbit:nth-last-child(2) > a",
      ) ??
      document.querySelector<HTMLLinkElement>(
        "ul.breadcrumb li.navbit:nth-last-child(1) a",
      );

    if (breadcrumbLink) {
      var forumURL = new URL(breadcrumbLink.href);
      return VGGlobals.IsPhotosForum(forumURL);
    }

    return false;
  }
}

class ForumPageTypeValidator implements VGPageTypeValidator {
  public IsPageValid(): boolean {
    const forumTitleLink = document.querySelector<HTMLLinkElement>(
      "div.body_wrapper > div#pagetitle span.forumtitle > a",
    );

    const forumURL = new URL(forumTitleLink?.href ?? window.location.href);
    return VGGlobals.IsPhotosForum(forumURL);
  }
}

class SearchPageTypeValidator implements VGPageTypeValidator {
  public IsPageValid(): boolean {
    return true;
  }
}

export class VGGlobals {
  private static photoForums: string[] = [
    "372",
    "268",
    "306",
    "277",
    "303",
    "237",
    "307",
    "240",
    "304",
    "238",
    "305",
    "239",
    "302",
    "236",
    "243",
    "308",
    "389",
    "385",
    "275",
    "247",
  ];

  private static pageValidators = new Map<VGPageType, VGPageTypeValidator>([
    ["thread", new ThreadPageTypeValidator()],
    ["forum", new ForumPageTypeValidator()],
    ["forumWithOptions", new ForumPageTypeValidator()],
    ["search", new SearchPageTypeValidator()],
  ]);

  /////

  public static IsPhotosForum(url: URL): boolean {
    for (const validForum of this.photoForums) {
      if (url.pathname.startsWith(`/forums/${validForum}`)) return true;
    }

    return false;
  }

  public static GetPageType(url: URL): VGPageType {
    const locationPath = url.pathname;

    if (locationPath.startsWith("/threads/")) return "thread";
    if (locationPath.startsWith("/forums/")) return "forum";
    if (locationPath.startsWith("/forumdisplay.php")) return "forumWithOptions";
    if (locationPath.startsWith("/search.php")) return "search";

    return "other";
  }

  public static IsPageValid(pageType: VGPageType): boolean {
    const validator = this.pageValidators.get(pageType);

    return validator?.IsPageValid() ?? false;
  }
}
