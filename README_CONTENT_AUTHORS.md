# Adding a Blog Post (Non-Technical Guide)

You can add posts in two ways. If the /admin page is not working yet, use Method 2.

---
## Method 1: (When Tina /admin works)
1. Visit /admin in the browser.
2. Click Posts > Create New.
3. Fill Title, Date, optional Cover Image, Excerpt, Tags.
4. Write your content in the Body editor.
5. Save.

---
## Method 2: Manual Markdown File (works now)
1. Go to the folder: content/posts
2. Copy the file: example-post.md and rename (lowercase-with-dashes.md), e.g. `my-first-post.md`.
3. Edit the top frontmatter block between the --- lines:
```
---
title: "My First Post"
date: "2025-08-20T12:00:00.000Z"
excerpt: "Short summary sentence."
coverImage: "/example-cover.jpg"   # or another image placed in /public
tags:
  - general
---
```
4. Write your article below the frontmatter using Markdown.
5. Save the file.
6. (If using Git) Commit + push so the site updates.

### Tips
- Date must be in quotes and ISO format (YYYY-MM-DDTHH:MM:SS.sssZ) or plain date.
- Tags is a list. Put each on its own line starting with a hyphen.
- To add a cover image: put an image file (e.g. hero.jpg) inside the `public/` folder and set `coverImage: "/hero.jpg"`.

### Basic Markdown Cheatsheet
- Heading: `# Big Title`, `## Section`
- Bold: `**bold**`, Italic: `*italic*`
- List: `- item one`\n  `- item two`
- Code block:
```
```js
console.log("hi")
```
```

## Troubleshooting
| Problem | Fix |
|---------|-----|
| Post not showing | Check filename ends with .md and is inside content/posts |
| Wrong URL | URL is /posts/<filename-without-.md> |
| Image 404 | Ensure the image is inside public/ and path starts with / |
| /admin 404 | Run dev server with Tina: `npm run dev` (still being configured) |

---
This guide lives in README_CONTENT_AUTHORS.md.
