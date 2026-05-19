import { createApp, reactive } from "vue";
import { VGController } from "./VGController";
import VGThreadPanel from "../components/threadPanel/VGThreadPanel.vue";
import { createMemoryHistory, createRouter } from "vue-router";
import VGThreadBindingPanel from "../components/threadBindingPanel/VGThreadBindingPanel.vue";
import VGEmptyPanel from "../components/VGEmptyPanel.vue";
import VGForumBindingPanel from "../components/forumBindingPanel/VGForumBindingPanel.vue";
import { VGForum } from "./VGForum";

export class VGNavigation {
  public static OpenThreadBindingApp(controller: VGController): void {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/",
          redirect: { name: "root" },
        },
        {
          name: "root",
          path: "/gallery",
          component: VGEmptyPanel,
        },
        {
          name: "gallery",
          path: "/gallery/:id",
          component: VGThreadPanel,
        },
      ],
    });

    const app = createApp(VGThreadBindingPanel, {
      onClose: () => {
        app.unmount();
        container.remove();
        router.replace({});
      },
    });

    app.provide("controller", reactive(controller));
    app.use(router).mount(container);
  }

  public static OpenForumBindingApp(
    controller: VGController,
    forum: VGForum,
  ): void {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: "/",
          redirect: { name: "root" },
        },
        {
          name: "root",
          path: "/thread",
          component: VGEmptyPanel,
        },
        {
          name: "thread",
          path: "/thread/:id",
          component: VGThreadPanel,
        },
      ],
    });

    const app = createApp(VGForumBindingPanel, {
      onClose: () => {
        app.unmount();
        container.remove();
        router.replace({});
      },
    });

    app.provide("controller", reactive(controller));
    app.provide("forum", reactive(forum));
    app.use(router).mount(container);
  }
}
