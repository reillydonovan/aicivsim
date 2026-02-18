import { getAllPosts } from "@/lib/blog";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | AI Civilization Simulator",
  description: "Research notes, build logs, and deep dives from the AI Civilization Simulator project.",
};

const ICON_MAP: Record<string, { icon: string; bg: string }> = {
  climate: { icon: "\u{1F331}", bg: "post-card-icon--emerald" },
  tooling: { icon: "\u{1F6E0}\uFE0F", bg: "post-card-icon--sky" },
  simulation: { icon: "\u{1F52C}", bg: "post-card-icon--violet" },
  governance: { icon: "\u{1F3DB}\uFE0F", bg: "post-card-icon--violet" },
  civilization: { icon: "\u{1F30D}", bg: "post-card-icon--amber" },
  announcement: { icon: "\u{1F4E3}", bg: "post-card-icon--sky" },
  strategy: { icon: "\u2699\uFE0F", bg: "post-card-icon--amber" },
  meta: { icon: "\u{1F4DD}", bg: "post-card-icon--sky" },
  research: { icon: "\u{1F4DC}", bg: "post-card-icon--violet" },
  timeline: { icon: "\u23F3", bg: "post-card-icon--amber" },
  scores: { icon: "\u{1F4CA}", bg: "post-card-icon--emerald" },
};

function getPostIcon(tags: string[]) {
  for (const tag of tags) {
    if (ICON_MAP[tag]) return ICON_MAP[tag];
  }
  return { icon: "\u{1F4DD}", bg: "post-card-icon--sky" };
}

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container">
          <div className="header-content">
            <p className="eyebrow">Blog</p>
            <h1>AI Civilization Simulator</h1>
            <p className="lede">
              Research notes, build logs, and deep dives from six interconnected dashboards modeling
              climate, governance, workforce transition, civilization health, strategy, and 50-year simulation.
            </p>
            <div className="header-links">
              <Link href="/" className="header-link header-link--sky">Home</Link>
              <Link href="/climate" className="header-link header-link--teal">{"\u{1F331}"} ClimateOS</Link>
              <Link href="/simulation" className="header-link header-link--sky">{"\u{1F52C}"} Simulation</Link>
              <Link href="/transition" className="header-link header-link--emerald">{"\u{1F6E0}\uFE0F"} TransitionOS</Link>
              <Link href="/civilization" className="header-link header-link--amber">{"\u{1F30D}"} CivilizationOS</Link>
              <Link href="/governance" className="header-link header-link--violet">{"\u{1F3DB}\uFE0F"} GovernanceOS</Link>
              <Link href="/strategy" className="header-link header-link--amber">{"\u2699\uFE0F"} StrategyOS</Link>
              <Link href="/research" className="header-link header-link--gray">{"\u{1F4DC}"} Research Paper</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container" style={{ width: "min(1100px, 92vw)", paddingTop: "3rem", paddingBottom: "3rem" }}>
        <div className="section-badge">All Posts</div>
        <h2 className="section-title">Published Notes</h2>
        <p className="section-subtitle">Reverse-chronological archive of every published note from the project.</p>

        <div className="posts-grid">
          {posts.map((post) => {
            const { icon, bg } = getPostIcon(post.meta.tags);
            const dateStr = post.meta.date ? new Date(post.meta.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "";
            return (
              <article key={post.meta.slug} className="post-card">
                <div className={`post-card-icon ${bg}`}>{icon}</div>
                {post.meta.tags[0] && <span className="post-card-tag">{post.meta.tags[0]}</span>}
                <h3><Link href={`/blog/${post.meta.slug}`}>{post.meta.title}</Link></h3>
                <p className="post-meta">{dateStr}</p>
                <p className="post-card-description">{post.meta.description}</p>
                <span className="post-card-readmore">Read more &rarr;</span>
                {post.meta.tags.length > 0 && (
                  <div className="post-card-tags">
                    {post.meta.tags.map((t) => <span key={t} className="tag-pill">{t}</span>)}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          &copy; 2026 Clawcode Research &middot; <Link href="/">Home</Link> &middot; <Link href="/research">Research Paper</Link>
        </div>
      </footer>
    </div>
  );
}
