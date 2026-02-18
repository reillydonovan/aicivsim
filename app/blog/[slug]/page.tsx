import { getAllPosts, getPostBySlug } from "@/lib/blog";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import NavBar from "../../components/NavBar";

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.meta.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return { title: `${post.meta.title} | Blog`, description: post.meta.description };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const dateStr = post.meta.date
    ? new Date(post.meta.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container">
          <div className="header-content">
            <p className="eyebrow">Blog</p>
            <h1>AI Civilization Simulator</h1>
          </div>
        </div>
      </header>
      <NavBar />

      <main className="container" style={{ width: "min(1100px, 92vw)", paddingTop: "3rem", paddingBottom: "3rem" }}>
        <div className="post-body">
          <div className="post-return">
            <Link href="/blog">&larr; All posts</Link>
          </div>
          <img src={`/images/blog/${params.slug.replace(/^\d{4}-\d{2}-\d{2}-/, "")}.webp`} alt="" className="w-full h-48 object-cover rounded-xl mb-6 opacity-60" />
          <div className="post-header">
            {post.meta.tags[0] && <span className="post-tag">{post.meta.tags[0]}</span>}
            <h1>{post.meta.title}</h1>
            <p className="post-meta">{dateStr}</p>
            {post.meta.description && <p className="post-description">{post.meta.description}</p>}
          </div>
          <div className="post-content" dangerouslySetInnerHTML={{ __html: post.html }} />
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          &copy; 2026 Clawcode Research &middot; <Link href="/">Home</Link> &middot; <Link href="/blog">Blog</Link> &middot; <Link href="/research">Research Paper</Link>
        </div>
      </footer>
    </div>
  );
}
