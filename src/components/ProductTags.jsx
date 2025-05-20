import React from 'react';
import { Link } from 'react-router-dom';

const ProductTags = ({ tags }) => {
  // Kiểm tra tag và hiển thị log
  console.log('ProductTags component - received tags:', tags);

  // Normalize tags to ensure consistent format
  const normalizedTags = React.useMemo(() => {
    if (!tags) return [];
    
    try {
      // If already an array, ensure all elements are strings
      if (Array.isArray(tags)) {
        return tags.map(tag => 
          typeof tag === 'string' ? tag.trim() : String(tag).trim()
        ).filter(tag => tag !== '');
      }
      
      // If string, try to parse as JSON or split by comma
      if (typeof tags === 'string') {
        try {
          const parsed = JSON.parse(tags.replace(/\\/g, ''));
          if (Array.isArray(parsed)) {
            return parsed.map(tag => 
              typeof tag === 'string' ? tag.trim() : String(tag).trim()
            ).filter(tag => tag !== '');
          }
        } catch {
          // If parsing fails, split by comma
          return tags
            .replace(/\[|\]/g, '')
            .replace(/\\"/g, '')
            .replace(/"/g, '')
            .split(',')
            .map(s => s.trim())
            .filter(s => s !== '');
        }
      }
      
      // Any other format, convert to string
      return [String(tags).trim()].filter(tag => tag !== '');
    } catch (e) {
      console.error('Error normalizing tags:', e);
      return [];
    }
  }, [tags]);

  // Check if we have any tags after normalization
  const hasTags = normalizedTags.length > 0;

  if (!hasTags) {
    return (
      <div style={{ 
        backgroundColor: '#f3f4f6', 
        padding: '20px', 
        borderRadius: '10px',
        margin: '20px 0',
        border: '2px dashed #e5e7eb',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '10px',
          color: '#4b5563'
        }}>
          Thẻ Tags Sản Phẩm
        </h2>
        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
          Sản phẩm này chưa có tags
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#f0f9ff', 
      padding: '20px', 
      borderRadius: '10px',
      margin: '20px 0',
      border: '2px solid #bae6fd',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ 
        fontSize: '18px', 
        fontWeight: 'bold', 
        marginBottom: '15px',
        color: '#0369a1',
        borderBottom: '2px solid #bae6fd',
        paddingBottom: '8px'
      }}>
        Thẻ Tags Sản Phẩm
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {normalizedTags.map((tag, index) => (
          <Link 
            key={`product-tag-${index}`}
            to={`/products/search?tag=${encodeURIComponent(tag)}`}
            style={{ 
              backgroundColor: '#0ea5e9', 
              color: 'white',
              padding: '8px 16px',
              borderRadius: '9999px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500',
              display: 'inline-block',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0284c7';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#0ea5e9';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductTags; 