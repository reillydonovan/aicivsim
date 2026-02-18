import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const postsDir = path.join(process.cwd(), "content", "posts");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  icon?: string;
  iconBg?: string;
  [key: string]: unknown;
}

export interface Post {
  meta: PostMeta;
  content: string;
  html: string;
}

function markdownToHtml(md: string): string {
  const result = remark().use(html, { sanitize: false }).processSync(md);
  return String(result);
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDir)) return [];
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
    const { data, content } = matter(raw);
    const slug = file.replace(/\.mdx$/, "");
    return {
      meta: {
        slug,
        title: (data.title as string) || slug,
        description: (data.description as string) || "",
        date: (data.date as string) || "",
        tags: (data.tags as string[]) || [],
        icon: data.icon as string | undefined,
        iconBg: data.iconBg as string | undefined,
        ...data,
      },
      content,
      html: markdownToHtml(content),
    };
  });
  return posts.sort((a, b) => (a.meta.date > b.meta.date ? -1 : 1));
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(postsDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    meta: {
      slug,
      title: (data.title as string) || slug,
      description: (data.description as string) || "",
      date: (data.date as string) || "",
      tags: (data.tags as string[]) || [],
      icon: data.icon as string | undefined,
      iconBg: data.iconBg as string | undefined,
      ...data,
    },
    content,
    html: markdownToHtml(content),
  };
}
