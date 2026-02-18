import { getAllPosts, getPostBySlug } from "@/lib/blog";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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
      <nav className="site-nav">
        <div className="header-links">
          <Link href="/" className="header-link header-link--gray">Home</Link>
          <Link href="/climate" className="header-link header-link--teal">{"\u{1F331}"} ClimateOS</Link>
          <Link href="/simulation" className="header-link header-link--sky">{"\u{1F52C}"} Simulation</Link>
          <Link href="/transition" className="header-link header-link--sky">{"\u{1F6E0}\uFE0F"} TransitionOS</Link>
          <Link href="/civilization" className="header-link header-link--amber">{"\u{1F30D}"} CivilizationOS</Link>
          <Link href="/governance" className="header-link header-link--violet">{"\u{1F3DB}\uFE0F"} GovernanceOS</Link>
          <Link href="/strategy" className="header-link header-link--amber">{"\u2699\uFE0F"} StrategyOS</Link>
          <Link href="/research" className="header-link header-link--violet">{"\u{1F4DC}"} Research</Link>
          <Link href="/blog" className="header-link header-link--gray active">{"\u{1F4DD}"} Blog</Link>
        </div>
      </nav>

      <main className="container" style={{ width: "min(1100px, 92vw)", paddingTop: "3rem", paddingBottom: "3rem" }}>
        <div className="post-body">
          <div className="post-return">
            <Link href="/blog">&larr; All posts</Link>
          </div>
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
