'use client';

import { useArticles } from '@/app/context/article-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from '../../admin.module.css';

export default function ArticlesListPage() {
  const { articles, deleteArticle } = useArticles();
  const router = useRouter();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <button onClick={() => router.back()} className={styles.backBtn} style={{background: 'none', border:'none', cursor:'pointer'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1>All Articles</h1>
          </div>
          <div className={styles.headerRight}>
            <Link href="/admin/articles/new" className={styles.newArticleBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              New Article
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.articlesList} style={{marginTop: '2rem'}}>
          {articles.length === 0 ? (
            <p>No articles found. Create one!</p>
          ) : (
            articles.map((article) => (
                <div key={article.id} className={styles.articleCard} style={{marginBottom: '1rem', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.5rem'}}>
                  <div className={styles.articleInfo}>
                    <h3 style={{marginBottom:'0.5rem'}}>{article.title}</h3>
                    <div className={styles.articleMeta} style={{display:'flex', gap:'1rem', color:'var(--foreground-secondary)', fontSize:'0.9rem'}}>
                      <span className={styles.articleCategory} style={{background:'var(--secondary)', padding:'0.2rem 0.5rem', borderRadius:'0.5rem'}}>{article.category}</span>
                      <span>{article.author}</span>
                      <span>{article.publishedAt}</span>
                      <span style={{color: article.status === 'published' ? '#10b981' : '#f59e0b', fontWeight:'bold'}}>{article.status}</span>
                    </div>
                  </div>
                  <div className={styles.articleActions} style={{display:'flex', gap:'0.5rem'}}>
                    <Link href={`/admin/articles/${article.id}`} className={styles.editBtn} style={{display:'flex', alignItems:'center', justifyContent:'center', width:'2rem', height:'2rem', borderRadius:'0.5rem', border:'1px solid var(--border)', color:'inherit'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </Link>
                    <button 
                        onClick={() => {
                            if(confirm('Delete article?')) deleteArticle(article.id)
                        }}
                        className={styles.editBtn}
                        style={{display:'flex', alignItems:'center', justifyContent:'center', width:'2rem', height:'2rem', borderRadius:'0.5rem', border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.1)', color:'#ef4444', cursor:'pointer'}}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
