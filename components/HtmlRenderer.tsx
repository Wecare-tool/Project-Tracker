import React, { useState, useEffect } from 'react';
import { DATAVERSE_BASE_URL } from '../constants';

interface HtmlRendererProps {
  htmlString: string;
  accessToken: string;
}

const HtmlRenderer: React.FC<HtmlRendererProps> = ({ htmlString, accessToken }) => {
  const [processedHtml, setProcessedHtml] = useState(htmlString);

  useEffect(() => {
    let isMounted = true;
    const objectUrlsCreated: string[] = [];

    const processHtml = async (html: string) => {
      if (!html || !accessToken) {
        if (isMounted) setProcessedHtml(html);
        return;
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const images = doc.querySelectorAll('img');

      if (images.length === 0) {
        if (isMounted) setProcessedHtml(html);
        return;
      }
      
      const origin = new URL(DATAVERSE_BASE_URL).origin;

      const imagePromises = Array.from(images).map(async (img) => {
        const src = img.getAttribute('src');
        // Only process relative Dataverse URLs, not data URIs or external URLs
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
          try {
            const fullUrl = new URL(src, origin).href;
            const response = await fetch(fullUrl, { headers: { 'Authorization': `Bearer ${accessToken}` } });
            if (response.ok) {
              const blob = await response.blob();
              const objectUrl = URL.createObjectURL(blob);
              objectUrlsCreated.push(objectUrl); // Store for cleanup
              img.setAttribute('src', objectUrl);
            }
          } catch (e) {
            console.error("Error fetching image for rendering:", e);
          }
        }
      });

      await Promise.all(imagePromises);
      if (isMounted) {
        setProcessedHtml(doc.body.innerHTML);
      }
    };
    
    processHtml(htmlString);

    return () => {
      isMounted = false;
      // When the component unmounts or the effect re-runs, revoke the URLs created in this run.
      objectUrlsCreated.forEach(url => URL.revokeObjectURL(url));
    };
  }, [htmlString, accessToken]);
  
  if (!htmlString) {
    return null;
  }

  return (
    <div
      className="ck-content" // This class is styled in index.html
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
};

export default HtmlRenderer;
