import "./style.css";
import { ImxHost } from "./app/hosts/ImxHost";
import { VGController } from "./app/VGController";
import { PixhostHost } from "./app/hosts/PixhostHost";
import { ViprImHost } from "./app/hosts/ViprImHost";
import { VGForum } from "./app/VGForum";
import { VGGlobals } from "./app/VGGlobals";
import { VGNavigation } from "./app/VGNavigation";

function handleBootstrapError(err: unknown): void {
  console.error("[VGGallery] Bootstrap failed:", err);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    Bootstrap().catch(handleBootstrapError);
  });
} else {
  Bootstrap().catch(handleBootstrapError);
}

async function Bootstrap() {
  const pageURL = new URL(window.location.href);
  const pageType = VGGlobals.GetPageType(pageURL);

  if (!VGGlobals.IsPageValid(pageType)) return;

  const controller = new VGController();

  controller.RegisterHost(new ImxHost(controller));
  controller.RegisterHost(new PixhostHost(controller));
  controller.RegisterHost(new ViprImHost(controller));

  switch (pageType) {
    case "thread":
      VGNavigation.OpenThreadBindingApp(controller);
      break;
    case "forum":
    case "forumWithOptions":
    case "search":
      var forum = new VGForum();

      VGNavigation.OpenForumBindingApp(controller, forum);
      break;
  }
}
