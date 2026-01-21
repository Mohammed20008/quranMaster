'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './page.module.css';
import { useAuth } from '@/app/context/auth-context';
import { useArticles } from '@/app/context/article-context';

// Decorative Pattern Component
const GeometricPattern = () => (
    <div className={styles.patternBg}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="islamic-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                    <path d="M0 40 L40 0 L80 40 L40 80 Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    <circle cx="40" cy="40" r="8" fill="currentColor" opacity="0.5"/>
                    <rect x="38" y="38" width="4" height="4" transform="rotate(45 40 40)" fill="currentColor"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
        </svg>
        <div className={styles.patternOverlay}></div>
    </div>
);

const Navbar = () => {
    const { isAuthenticated, user, openAuthModal, isAdmin } = useAuth();

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContent}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                        </svg>
                    </div>
                    <div className={styles.logoText}>
                        <span className={styles.brandName}>QuranMaster</span>
                        <span className={styles.brandBadge}>Premium</span>
                    </div>
                </div>
                <div className={styles.navLinks}>
                    <Link href="/quran" className={styles.navLink}>Read Quran</Link>
                    <Link href="/sunnah" className={styles.navLink}>Sunnah</Link>
                    <Link href="/calendar" className={styles.navLink}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}>
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Calendar
                    </Link>
                    <Link href="/learn" className={styles.navLink}>Learn</Link>
                    
                    {isAuthenticated ? (
                         <Link href={isAdmin ? "/admin" : "/dashboard"} className={styles.dashboardBtn}>
                            {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                         </Link>
                    ) : (
                        <button onClick={openAuthModal} className={styles.loginBtn}>
                            Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

const Hero = () => {
    const { isAuthenticated, openAuthModal, isAdmin } = useAuth();

    return (
        <div className={styles.hero}>
            <div className={styles.heroGlow}></div>
            <div className={styles.container}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.badge}
                >
                    <span className={styles.pulse}></span>
                    The Ultimate Islamic Companion
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={styles.heroTitle}
                >
                    Connect with the <br/>
                    <span className={styles.gradientText}>
                        Divine Awareness
                    </span>
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={styles.heroDesc}
                >
                    A masterfully crafted platform for Quran reading, Sunnah studies, and spiritual growth. 
                    Experience the beauty of Islam with modern technology.
                </motion.p>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={styles.heroButtons}
                >
                    <Link href="/quran" className={styles.primaryBtn}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                        </svg>
                        Start Reading
                    </Link>
                    
                    {isAuthenticated ? (
                         <Link href={isAdmin ? "/admin" : "/dashboard"} className={styles.secondaryBtn}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7"/>
                                <rect x="14" y="3" width="7" height="7"/>
                                <rect x="14" y="14" width="7" height="7"/>
                                <rect x="3" y="14" width="7" height="7"/>
                            </svg>
                            {isAdmin ? 'Go to Admin' : 'My Dashboard'}
                        </Link>
                    ) : (
                        <button onClick={openAuthModal} className={styles.secondaryBtn}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                <polyline points="10 17 15 12 10 7"/>
                                <line x1="15" y1="12" x2="3" y2="12"/>
                            </svg>
                            Login to Resume
                        </button>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

const FeatureCard = ({ title, desc, icon, link, delay }: any) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        className={styles.featureCard}
    >
        <Link href={link} className={styles.featureCardLink}>
            <div className={styles.cardDecor}></div>
            <div className={styles.featureIcon}>
                {icon}
            </div>
            
            <h3 className={styles.featureTitle}>{title}</h3>
            <p className={styles.featureDesc}>{desc}</p>
            
            <div className={styles.learnMore}>
                Explore Feature
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </div>
        </Link>
    </motion.div>
);

const Articles = () => {
    // Dynamically load articles from context
    // We import it here or pass it down. Since this is a client component, we can use the hook directly if we import it.
    // However, I need to make sure I import it at the top. 
    // Wait, I cannot add imports with this tool easily in the middle of a file if I don't replace the top.
    // I will replace the component logic.
    
    // NOTE: This assumes useArticles is imported. I need to make sure I added the import in a previous step or I will have to add it now. 
    // I see I only added useAuth import. I need to add useArticles import at the top of the file as well.
    // I will do that in a separate step to be safe, or if I can replace the whole file content that's safer but larger. 
    // I will assume I can update the component here and then update imports.
    // Actually, I can use a simpler approach: define the component to accept articles or just use the hook if I add the import.
    
    // Let's rely on the next step to add the import.
    // For now, I will use window as a fallback or just empty if not available to avoid error, 
    // BUT actually, I'll just change the component to use the context hook, and I'll add the import in the next tool call.

    const { articles } = useArticles();
    const latestArticles = articles.filter(a => a.status === 'published').slice(0, 3);

    return (
        <section className={styles.articles}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Latest Insights</h2>
                <p className={styles.sectionDesc}>
                    Read our latest articles to deepen your understanding of the Quran and Sunnah.
                </p>
            </div>
            <div className={styles.articlesGrid}>
                {latestArticles.map((article, i) => (
                    <motion.div 
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className={styles.articleCard}
                    >
                        <div className={styles.articleImage}>
                            <div className={styles.articleImageOverlay}></div>
                            <span className={styles.articleCategory}>{article.category}</span>
                        </div>
                        <div className={styles.articleContent}>
                            <div className={styles.articleMeta}>
                                <span>{article.author}</span>
                                <span>{article.publishedAt}</span>
                            </div>
                            <h3 className={styles.articleTitle}>{article.title}</h3>
                            <p className={styles.articleExcerpt}>{article.excerpt}</p>
                            <Link href={`/articles/${article.id}`} className={styles.readMoreBtn}>
                                Read Article
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

const Features = () => {
    const features = [
        {
            title: "Advanced Reader",
            desc: "Immersive reading experience with customizable fonts, translations, and tafsir.",
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
            ),
            link: "/quran"
        },
        {
            title: "Sunnah Hadith",
            desc: "Access authentic Hadith collections from Sahih Al-Bukhari, Muslim, and more.",
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
            ),
            link: "/sunnah"
        },
        {
            title: "Learning Hub",
            desc: "Master Tajweed, memorize surahs, and track your progress with interactive tools.",
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
            ),
            link: "/learn"
        },
        {
            title: "Personal Journal",
            desc: "Reflect on your spiritual journey with a dedicated daily journal and activity tracking.",
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
            ),
            link: "/dashboard"
        }
    ];

    return (
        <section className={styles.features}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Everything you need</h2>
                <p className={styles.sectionDesc}>
                    A complete ecosystem designed to help you connect deeper with your faith through beautiful design and powerful features.
                </p>
            </div>
            <div className={styles.featuresGrid}>
                {features.map((f, i) => (
                    <FeatureCard key={i} {...f} delay={i * 0.1} />
                ))}
            </div>
        </section>
    );
};

export default function LandingPage() {
    return (
        <div className={styles.container}>
            <GeometricPattern />
            {/* Pass no props, components use hook internally */}
            <Navbar />
            <main>
                <Hero />
                <Features />
                <Articles />
            </main>
            
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.footerBrand}>
                         <div className={styles.logo}>
                            <div className={styles.logoIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                                </svg>
                            </div>
                            <div className={styles.logoText}>
                                <span className={styles.brandName}>QuranMaster</span>
                            </div>
                        </div>
                        <p>
                            Built with love for the Ummah. Our mission is to make Quran reading and learning accessible and beautiful for everyone.
                        </p>
                    </div>
                    <div className={styles.footerCol}>
                        <h4>Platform</h4>
                        <div className={styles.footerLinks}>
                            <Link href="/quran">Read Quran</Link>
                            <Link href="/sunnah">Sunnah Hadith</Link>
                            <Link href="/learn">Learning Hub</Link>
                            <Link href="/dashboard">Dashboard</Link>
                        </div>
                    </div>
                    <div className={styles.footerCol}>
                        <h4>Support</h4>
                        <div className={styles.footerLinks}>
                            <Link href="#">Help Center</Link>
                            <Link href="#">Privacy Policy</Link>
                            <Link href="#">Terms of Service</Link>
                            <Link href="#">Contact Us</Link>
                        </div>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <p>© 2025 QuranMaster. All rights reserved.</p>
                    <p>Made with ❤️ via Agentic AI</p>
                </div>
            </footer>
        </div>
    );
}
