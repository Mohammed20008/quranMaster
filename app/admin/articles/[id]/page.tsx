'use client';

import React from 'react'; // Explicitly import React
import ArticleEditor from '../editor/article-editor';
import { useParams } from 'next/navigation';

export default function EditArticlePage() {
    const params = useParams();
    // Ensure id is a string
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    
    return <ArticleEditor articleId={id} />;
}
