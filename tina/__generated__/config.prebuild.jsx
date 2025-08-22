// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var config_default = defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: { mediaRoot: "", publicFolder: "public" }
  },
  schema: {
    collections: [
      {
        name: "post",
        label: "Posts",
        path: "content/posts",
        ui: {
          filename: {
            slugify: (values) => `${values?.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`
          }
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true
          },
          {
            type: "datetime",
            name: "date",
            label: "Published Date",
            required: true,
            ui: { dateFormat: "YYYY-MM-DD", timeFormat: "HH:mm" }
          },
          {
            type: "image",
            name: "coverImage",
            label: "Cover Image"
          },
          {
            type: "string",
            name: "excerpt",
            label: "Excerpt",
            ui: { component: "textarea" }
          },
          {
            type: "string",
            name: "tags",
            list: true,
            label: "Tags"
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true
          }
        ]
      },
      {
        name: "settings",
        label: "Site Settings",
        path: "content/settings",
        ui: {
          allowedActions: { create: false, delete: false }
        },
        fields: [
          {
            type: "object",
            name: "postsLayout",
            label: "Posts Layout",
            description: "Control the posts grid on the listing page",
            fields: [
              { type: "number", name: "columns", label: "Columns", required: true },
              { type: "number", name: "rows", label: "Rows (visible sets of posts)", required: true }
            ]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
