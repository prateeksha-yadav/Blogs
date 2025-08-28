import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDir = path.join(process.cwd(), 'content', 'posts')

export function readAllPosts() {
  if (!fs.existsSync(postsDir)) return []
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'))
  return files.map((file) => {
    const full = path.join(postsDir, file)
    const raw = fs.readFileSync(full, 'utf8')
    const { data, content } = matter(raw)
    // Normalize date to an ISO string if present
    let date: string | null = null
    if (data.date) {
      if (data.date instanceof Date) date = data.date.toISOString()
      else date = String(data.date)
    }
    return {
      _sys: { filename: file.replace(/\.md$/, '') },
      title: data.title || null,
      date,
      excerpt: data.excerpt || null,
      coverImage: data.coverImage || null,
      tags: data.tags || [],
      body: content,
    }
  })
}
