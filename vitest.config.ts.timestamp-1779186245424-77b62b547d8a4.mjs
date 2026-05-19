// vitest.config.ts
import { defineConfig } from "file:///C:/Users/HP%20ELITEBOOK/Desktop/dev/qrcode-app/node_modules/vitest/dist/config.js";
import vue from "file:///C:/Users/HP%20ELITEBOOK/Desktop/dev/qrcode-app/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { fileURLToPath } from "node:url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/HP%20ELITEBOOK/Desktop/dev/qrcode-app/vitest.config.ts";
var vitest_config_default = defineConfig({
  plugins: [vue()],
  test: {
    environment: "happy-dom",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,vue}"]
    },
    globals: true
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
      "@core": fileURLToPath(new URL("./src/core", __vite_injected_original_import_meta_url)),
      "@modules": fileURLToPath(new URL("./src/modules", __vite_injected_original_import_meta_url)),
      "@shared": fileURLToPath(new URL("./src/shared", __vite_injected_original_import_meta_url))
    }
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEhQIEVMSVRFQk9PS1xcXFxEZXNrdG9wXFxcXGRldlxcXFxxcmNvZGUtYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxIUCBFTElURUJPT0tcXFxcRGVza3RvcFxcXFxkZXZcXFxccXJjb2RlLWFwcFxcXFx2aXRlc3QuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9IUCUyMEVMSVRFQk9PSy9EZXNrdG9wL2Rldi9xcmNvZGUtYXBwL3ZpdGVzdC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlc3QvY29uZmlnJ1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFt2dWUoKV0sXG4gIHRlc3Q6IHtcbiAgICBlbnZpcm9ubWVudDogJ2hhcHB5LWRvbScsXG4gICAgaW5jbHVkZTogWydzcmMvKiovKi57dGVzdCxzcGVjfS57dHMsdHN4fSddLFxuICAgIGNvdmVyYWdlOiB7XG4gICAgICBwcm92aWRlcjogJ3Y4JyxcbiAgICAgIHJlcG9ydGVyOiBbJ3RleHQnLCAnaHRtbCddLFxuICAgICAgaW5jbHVkZTogWydzcmMvKiovKi57dHMsdnVlfSddXG4gICAgfSxcbiAgICBnbG9iYWxzOiB0cnVlXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAnQGNvcmUnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL2NvcmUnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICdAbW9kdWxlcyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvbW9kdWxlcycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgJ0BzaGFyZWQnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL3NoYXJlZCcsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgfVxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3VSxTQUFTLG9CQUFvQjtBQUNyVyxPQUFPLFNBQVM7QUFDaEIsU0FBUyxxQkFBcUI7QUFGK0ssSUFBTSwyQ0FBMkM7QUFJOVAsSUFBTyx3QkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLElBQUksQ0FBQztBQUFBLEVBQ2YsTUFBTTtBQUFBLElBQ0osYUFBYTtBQUFBLElBQ2IsU0FBUyxDQUFDLCtCQUErQjtBQUFBLElBQ3pDLFVBQVU7QUFBQSxNQUNSLFVBQVU7QUFBQSxNQUNWLFVBQVUsQ0FBQyxRQUFRLE1BQU07QUFBQSxNQUN6QixTQUFTLENBQUMsbUJBQW1CO0FBQUEsSUFDL0I7QUFBQSxJQUNBLFNBQVM7QUFBQSxFQUNYO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLE1BQ3BELFNBQVMsY0FBYyxJQUFJLElBQUksY0FBYyx3Q0FBZSxDQUFDO0FBQUEsTUFDN0QsWUFBWSxjQUFjLElBQUksSUFBSSxpQkFBaUIsd0NBQWUsQ0FBQztBQUFBLE1BQ25FLFdBQVcsY0FBYyxJQUFJLElBQUksZ0JBQWdCLHdDQUFlLENBQUM7QUFBQSxJQUNuRTtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
