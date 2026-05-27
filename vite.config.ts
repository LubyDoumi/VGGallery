import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import monkey, { cdn } from "vite-plugin-monkey";
import path from "path";
import fs from "fs";

/**
 * Copy the output file into the Userscripts folder.
 */
function copyOutputFile(dest: string) {
  return {
    name: "copy-output-file",
    closeBundle() {
      const stat = fs.statSync(dest, { throwIfNoEntry: false });

      if (stat?.isDirectory()) {
        console.error(
          `COPY_DEST must be a file path, not a directory: ${dest}`,
        );
        return;
      }

      const outputFile = path.resolve(__dirname, "dist", "vggallery.user.js");
      fs.copyFileSync(outputFile, dest);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    build: {
      minify: "oxc",
    },
    plugins: [
      vue(),
      monkey({
        entry: "src/main.ts",
        userscript: {
          icon: "https://viper.to/favicon.ico",
          namespace: "to.viper.girls",
          match: [
            "https://vipergirls.to/*",
            "https://viper.to/*",
            "https://planetviper.club/*",
            "https://viperbb.rocks/*",
            "https://viperkats.eu/*",
            "https://viperohilia.art/*",
            "https://viperproxy.org/*",
            "https://vipervault.link/*",
          ],
          "run-at": "document-start",
          require: [
            // fix JSZip not working on Tampermonkey
            "data:application/javascript,%3BglobalThis.setImmediate%3DsetTimeout%3B",
          ],
        },
        build: {
          externalGlobals: {
            vue: cdn.jsdelivr("Vue", "dist/vue.global.prod.js"),
            jszip: cdn.jsdelivr("JSZip", "dist/jszip.min.js"),
            "vue-virtual-scroller": cdn.jsdelivr(
              "VueVirtualScroller",
              "dist/vue-virtual-scroller.min.js",
            ),
          },
        },
      }),

      ...(env.COPY_DEST ? [copyOutputFile(env.COPY_DEST)] : []),
    ],
  };
});
