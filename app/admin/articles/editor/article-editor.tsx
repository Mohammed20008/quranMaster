'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useArticles } from '@/app/context/article-context';
import { Article } from '@/app/context/article-context';
import styles from '../../admin.module.css'; // Re-use basic styles

interface ArticleEditorProps {
    articleId?: string; // If present, edit mode
}

export default function ArticleEditor({ articleId }: ArticleEditorProps) {
    const router = useRouter();
    const { addArticle, updateArticle, getArticle } = useArticles();
    
    // Form State
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [author, setAuthor] = useState('Admin'); // Default author
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'draft' | 'published'>('published');

    useEffect(() => {
        if (articleId) {
            const article = getArticle(articleId);
            if (article) {
                setTitle(article.title);
                setCategory(article.category);
                setAuthor(article.author);
                setExcerpt(article.excerpt);
                setContent(article.content);
                setStatus(article.status);
            }
        }
    }, [articleId, getArticle]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const articleData = {
            title,
            category,
            author,
            excerpt,
            content,
            status
        };

        if (articleId) {
            updateArticle(articleId, articleData);
            alert('Article updated successfully!');
        } else {
            addArticle(articleData);
            alert('Article created successfully!');
        }
        
        router.push('/admin');
    };

    return (
        <div className={styles.container}>
             <header className={styles.header} style={{position:'static', padding:'2rem', borderBottom:'1px solid var(--border)'}}>
                <div className={styles.headerContent}>
                     <div className={styles.headerLeft}>
                         <button onClick={() => router.back()} className={styles.backBtn} style={{background:'none', border:'none', cursor:'pointer'}}>
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                             </svg>
                         </button>
                         <h1>{articleId ? 'Edit Article' : 'Create New Article'}</h1>
                     </div>
                </div>
             </header>

             <main className={styles.main} style={{maxWidth:'800px', margin:'0 auto', paddingTop:'2rem'}}>
                 <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
                      
                      <div className="form-group">
                          <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Title</label>
                          <input 
                            type="text" 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            style={{width:'100%', padding:'1rem', borderRadius:'0.5rem', border:'1px solid var(--border)', background:'var(--card-bg)', color:'var(--foreground)'}}
                            placeholder="Enter article title"
                          />
                      </div>

                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem'}}>
                           <div className="form-group">
                              <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Category</label>
                              <select 
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                style={{width:'100%', padding:'1rem', borderRadius:'0.5rem', border:'1px solid var(--border)', background:'var(--card-bg)', color:'var(--foreground)'}}
                              >
                                  <option value="General">General</option>
                                  <option value="Sunnah">Sunnah</option>
                                  <option value="Tafsir">Tafsir</option>
                                  <option value="Education">Education</option>
                                  <option value="Spiritual">Spiritual</option>
                              </select>
                           </div>

                            <div className="form-group">
                                <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Status</label>
                                <select 
                                    value={status}
                                    onChange={e => setStatus(e.target.value as any)}
                                    style={{width:'100%', padding:'1rem', borderRadius:'0.5rem', border:'1px solid var(--border)', background:'var(--card-bg)', color:'var(--foreground)'}}
                                >
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                </select>
                           </div>
                      </div>

                       <div className="form-group">
                          <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Author</label>
                          <input 
                            type="text" 
                            value={author}
                            onChange={e => setAuthor(e.target.value)}
                            style={{width:'100%', padding:'1rem', borderRadius:'0.5rem', border:'1px solid var(--border)', background:'var(--card-bg)', color:'var(--foreground)'}}
                          />
                      </div>

                      <div className="form-group">
                          <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Excerpt (Short Summary)</label>
                          <textarea 
                            value={excerpt}
                            onChange={e => setExcerpt(e.target.value)}
                            required
                            rows={3}
                            style={{width:'100%', padding:'1rem', borderRadius:'0.5rem', border:'1px solid var(--border)', background:'var(--card-bg)', color:'var(--foreground)'}}
                            placeholder="Brief description for cards..."
                          />
                      </div>

                      <div className="form-group">
                          <label style={{display:'block', marginBottom:'0.5rem', fontWeight:'bold'}}>Content</label>
                          <textarea 
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            required
                            rows={15}
                            style={{width:'100%', padding:'1rem', borderRadius:'0.5rem', border:'1px solid var(--border)', background:'var(--card-bg)', color:'var(--foreground)', fontFamily:'monospace'}}
                            placeholder="Write your article content here (Markdown supported in future)..."
                          />
                      </div>

                      <div style={{display:'flex', gap:'1rem', marginTop:'1rem', marginBottom:'4rem'}}>
                           <button 
                             type="submit"
                             style={{
                                 flex:1, 
                                 padding:'1rem', 
                                 background:'var(--primary)', 
                                 color:'white', 
                                 border:'none', 
                                 borderRadius:'0.5rem', 
                                 fontWeight:'bold', 
                                 cursor:'pointer',
                                 boxShadow:'0 4px 12px rgba(198, 147, 32, 0.3)'
                             }}
                           >
                               {articleId ? 'Update Article' : 'Publish Article'}
                           </button>
                            <button 
                             type="button"
                             onClick={() => router.back()}
                             style={{
                                 flex:1, 
                                 padding:'1rem', 
                                 background:'transparent', 
                                 color:'var(--foreground)', 
                                 border:'1px solid var(--border)', 
                                 borderRadius:'0.5rem', 
                                 fontWeight:'bold', 
                                 cursor:'pointer'
                             }}
                           >
                               Cancel
                           </button>
                      </div>

                 </form>
             </main>
        </div>
    );
}
