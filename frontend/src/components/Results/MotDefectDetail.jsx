import React, { useEffect } from 'react';
import {
  SectionTitle,
  SubTitle,
  BodyText,
  SmallText,
  Link,
  DefectList,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  InsetText,
  SectionBreak,
  DetailContent,
  BreadcrumbPath,
  DefectContent,
  DefectSection,
  CategoryTag,
} from './ResultsStyles';

// Alert component for errors
import Alert from '@mui/material/Alert';

// Determine if we're in development or production
const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';

// Configure API URL based on environment
const MOT_MANUAL_API_URL = isDevelopment 
                    ? 'http://localhost:8002/api/v1'  // Development - direct to API port
                    : '/manual-api/v1';              // Production - use relative URL for Nginx proxy

// Cache for storing MOT manual data
const manualCache = {};



// DefectItem styling for list items
const DefectItem = {
  marginBottom: 'var(--space-md)',
  paddingLeft: '0',
  listStyleType: 'none',
};


// Helper function to handle inline text formatting (bold, italic, links, etc.)
const formatInlineStyles = (text) => {
  if (!text) return '';
  
  // Create a working copy to apply transformations
  let formattedText = text;
  let result = [];
  let lastIndex = 0;
  
  try {
    // Process links [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch;
    while ((linkMatch = linkRegex.exec(formattedText)) !== null) {
      // Add text before this match
      if (linkMatch.index > lastIndex) {
        // Process any other formatting in the text before the link
        const preText = formattedText.substring(lastIndex, linkMatch.index);
        result.push(processInlineText(preText));
      }
      
      // Add the link
      const linkText = linkMatch[1];
      const linkUrl = linkMatch[2];
      result.push(
        <GovUKLink href={linkUrl} key={`link-${linkMatch.index}`}>
          {processInlineText(linkText)}
        </GovUKLink>
      );
      
      lastIndex = linkMatch.index + linkMatch[0].length;
    }
    
    // Add any remaining text after the last link
    if (lastIndex < formattedText.length) {
      const remainingText = formattedText.substring(lastIndex);
      result.push(processInlineText(remainingText));
    }
    
    // If no links were found, process the entire text for other formatting
    if (result.length === 0) {
      result.push(processInlineText(formattedText));
    }
    
    return (result.length === 1 && typeof result[0] === 'string') ? result[0] : <>{result}</>;
  } catch (error) {
    console.error('Error in formatInlineStyles:', error);
    return text;
  }
};

// Helper to process inline text formatting (bold, italic, code)
const processInlineText = (text) => {
  if (!text) return '';
  
  let result = [];
  let currentText = text;
  let hasFormatting = false;
  
  try {
    // Process bold text with **text**
    const boldRegex = /\*\*([^*]+)\*\*/g;
    currentText = currentText.replace(boldRegex, (match, content) => {
      hasFormatting = true;
      result.push(<strong key={`bold-${result.length}`} style={{
        fontWeight: 700,
        fontFamily: '"GDS Transport", arial, sans-serif',
      }}>{content}</strong>);
      return `###BOLD_PLACEHOLDER_${result.length - 1}###`;
    });
    
    // Process italic text with *text*
    const italicRegex = /\*([^*]+)\*/g;
    currentText = currentText.replace(italicRegex, (match, content) => {
      hasFormatting = true;
      result.push(<em key={`italic-${result.length}`} style={{
        fontStyle: 'italic',
        fontFamily: '"GDS Transport", arial, sans-serif',
      }}>{content}</em>);
      return `###ITALIC_PLACEHOLDER_${result.length - 1}###`;
    });
    
    // Process inline code with `code`
    const codeRegex = /`([^`]+)`/g;
    currentText = currentText.replace(codeRegex, (match, content) => {
      hasFormatting = true;
      result.push(
        <code key={`code-${result.length}`} style={{ 
          backgroundColor: COLORS.LIGHT_GREY,
          padding: '2px 4px',
          borderRadius: '0',
          fontFamily: '"GDS Transport", arial, sans-serif',
          fontSize: '1rem',
          color: COLORS.BLACK
        }}>
          {content}
        </code>
      );
      return `###CODE_PLACEHOLDER_${result.length - 1}###`;
    });
    
    // If we found formatting, rebuild the text with the formatted elements
    if (hasFormatting) {
      const parts = [];
      let lastIndex = 0;
      
      // Function to extract placeholder number
      const getPlaceholderIndex = (placeholder) => {
        const match = placeholder.match(/###(?:BOLD|ITALIC|CODE)_PLACEHOLDER_(\d+)###/);
        return match ? parseInt(match[1]) : -1;
      };
      
      // Find all placeholders
      const placeholderRegex = /###(?:BOLD|ITALIC|CODE)_PLACEHOLDER_\d+###/g;
      let match;
      
      while ((match = placeholderRegex.exec(currentText)) !== null) {
        // Add text before this placeholder
        if (match.index > lastIndex) {
          parts.push(currentText.substring(lastIndex, match.index));
        }
        
        // Add the formatted element
        const index = getPlaceholderIndex(match[0]);
        if (index >= 0 && index < result.length) {
          parts.push(result[index]);
        }
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add any remaining text
      if (lastIndex < currentText.length) {
        parts.push(currentText.substring(lastIndex));
      }
      
      return (parts.length === 1 && typeof parts[0] === 'string') ? parts[0] : <>{parts}</>;
    }
    
    // No formatting found, return the original text
    return currentText;
  } catch (error) {
    console.error('Error in processInlineText:', error);
    return text;
  }
};

// Enhanced text formatting function with better markdown-like syntax support
const formatText = (text) => {
  if (!text) return null;
  
  try {
    // Split text into paragraphs (separated by one or more blank lines)
    const paragraphs = text.split(/\n\n+/);
    
    return (
      <div>
        {paragraphs.map((paragraph, index) => {
          // Trim paragraph while preserving internal line breaks
          const trimmedParagraph = paragraph.trim();
          
          try {
            // 1. Process headings (# to ####) - improved heading detection
            if (/^#{1,4}\s/.test(trimmedParagraph)) {
              const headingMatch = trimmedParagraph.match(/^(#{1,4})\s+(.*)/);
              if (headingMatch) {
                const level = headingMatch[1].length;
                const headingText = headingMatch[2].trim();
                
                // Apply formatting to heading text (bold, italic, etc.)
                const formattedHeadingText = formatInlineStyles(headingText);
                
                switch (level) {
                  case 1:
                    return <SectionTitle key={index}>{formattedHeadingText}</SectionTitle>;
                  case 2:
                    return <SubTitle key={index}>{formattedHeadingText}</SubTitle>;
                  case 3:
                    return <SubTitle key={index}>{formattedHeadingText}</SubTitle>;
                  case 4:
                    return (
                      <SmallText 
                        key={index} 
                        style={{ 
                          fontWeight: '600', 
                          marginBottom: 'var(--space-sm)', 
                          marginTop: 'var(--space-md)',
                          display: 'block'
                        }}
                      >
                        {formattedHeadingText}
                      </SmallText>
                    );
                  default:
                    return <SubTitle key={index}>{formattedHeadingText}</SubTitle>;
                }
              }
            }
            
            // 2. Process code blocks
            if (trimmedParagraph.startsWith('```') && trimmedParagraph.endsWith('```')) {
              const codeContent = trimmedParagraph.substring(3, trimmedParagraph.length - 3).trim();
              
              // Extract language if specified
              let language = '';
              let code = codeContent;
              
              const firstLineBreak = codeContent.indexOf('\n');
              if (firstLineBreak > 0) {
                language = codeContent.substring(0, firstLineBreak).trim();
                code = codeContent.substring(firstLineBreak + 1).trim();
              }
              
              return (
                <div key={index}>
                  <InsetText>
                    {language && (
                      <SmallText style={{
                        color: 'var(--gray-500)',
                        marginBottom: 'var(--space-sm)'
                      }}>
                        {language}
                      </SmallText>
                    )}
                    <pre style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-sm)',
                      margin: 0,
                      overflowX: 'auto',
                      background: 'var(--gray-100)',
                      padding: 'var(--space-md)',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      <code>{code}</code>
                    </pre>
                  </InsetText>
                </div>
              );
            }
            
            // 3. Process blockquotes/inset text
            if (/^\s*>\s/.test(trimmedParagraph)) {
              const content = trimmedParagraph
                .split('\n')
                .map(line => line.replace(/^\s*>\s/, '').trim())
                .join('\n');
              
              // Process line breaks and inline formatting inside blockquote
              const blockquoteLines = content.split('\n');
              const formattedBlockquote = blockquoteLines.map((line, i) => {
                const formattedLine = formatInlineStyles(line);
                return i === 0 ? formattedLine : <React.Fragment key={i}><br />{formattedLine}</React.Fragment>;
              });
              
              return <GovUKInsetText key={index}>{formattedBlockquote}</GovUKInsetText>;
            }
            
            // 4. Process special case: text ending with colon directly followed by a numbered list
            // E.g., "If wheel play detectors are not available, do the following:1. Jack the front..."
            const colonNumberedListCheck = /^(.*?:\s*)(\d+\.\s+.*)$/.exec(trimmedParagraph);
            if (colonNumberedListCheck) {
              const introText = colonNumberedListCheck[1].trim();
              // Extract the list part and add a newline character for proper parsing
              const remainingText = colonNumberedListCheck[2].trim();
              
              // Join with a newline for processing
              const combinedText = introText + '\n' + remainingText;
              
              // Split it for processing
              const combinedLines = combinedText.split('\n');
              
              // Find all numbered items in the text
              const numberedItems = [];
              let currentItem = '';
              let currentItemNumber = null;
              
              // Helper function to capitalize the first letter of a string
              const capitalizeFirstLetter = (string) => {
                if (!string) return '';
                return string.charAt(0).toUpperCase() + string.slice(1);
              };
              
              // Regex to detect a numbered item start
              const numberItemRegex = /^(\d+)\.\s+(.*)/;
              
              for (let i = 1; i < combinedLines.length; i++) { // Start from 1 to skip intro
                const line = combinedLines[i];
                const numberMatch = line.match(numberItemRegex);
                
                if (numberMatch) {
                  // If we already have a current item, save it before starting a new one
                  if (currentItemNumber !== null) {
                    numberedItems.push({
                      number: currentItemNumber,
                      text: currentItem
                    });
                  }
                  
                  // Start a new item
                  currentItemNumber = numberMatch[1];
                  currentItem = capitalizeFirstLetter(numberMatch[2].trim());
                } else if (currentItemNumber !== null) {
                  // Continuation of the current item - add with proper spacing
                  currentItem += ' ' + line.trim();
                }
              }
              
              // Add the last item if there is one
              if (currentItemNumber !== null) {
                numberedItems.push({
                  number: currentItemNumber,
                  text: currentItem
                });
              }
              
              // Apply inline formatting to intro text and list items
              const formattedIntroText = formatInlineStyles(introText);
              
              return (
                <React.Fragment key={index}>
                  <GovUKBody>{formattedIntroText}</GovUKBody>
                  <GovUKList as="ol" style={{
                    paddingLeft: '20px',
                    marginTop: '10px',
                    listStyleType: 'decimal'
                  }}>
                    {numberedItems.map((item, i) => (
                      <li key={i} style={{ 
                        marginBottom: '5px',
                        paddingLeft: '5px'
                      }}>
                        {formatInlineStyles(item.text)}
                      </li>
                    ))}
                  </GovUKList>
                </React.Fragment>
              );
            }
            
            // 5. Process unordered lists (prioritize "-" format as requested)
            if (/^\s*[-*•]\s/.test(trimmedParagraph)) {
              const lines = trimmedParagraph.split('\n');
              const listItems = [];
              let currentItem = '';
              
              // Helper function to capitalize the first letter of a string
              const capitalizeFirstLetter = (string) => {
                if (!string) return '';
                return string.charAt(0).toUpperCase() + string.slice(1);
              };
              
              lines.forEach((line, i) => {
                // Look for any bullet point style but prioritize "-"
                const listItemMatch = line.match(/^\s*[-*•]\s+(.*)/);
                if (listItemMatch) {
                  // If we have a current item being built, push it before starting new one
                  if (currentItem.length > 0) {
                    listItems.push(currentItem);
                    currentItem = '';
                  }
                  // Capitalize the first letter of each list item
                  currentItem = capitalizeFirstLetter(listItemMatch[1].trim());
                } else if (currentItem.length > 0 && line.trim()) {
                  // This is a continuation of the previous item (non-empty line without a bullet prefix)
                  currentItem += ' ' + line.trim();
                }
              });
              
              // Add the last item if there is one
              if (currentItem.length > 0) {
                listItems.push(currentItem);
              }
              
              if (listItems.length > 0) {
                return (
                  <GovUKList key={index} style={{
                    paddingLeft: '20px',
                    listStyleType: 'disc',
                    marginTop: '0',
                    marginBottom: '15px',
                    
                    '@media (min-width: 40.0625em)': {
                      marginBottom: '20px'
                    }
                  }}>
                    {listItems.map((item, i) => (
                      <li key={i} style={{ marginBottom: '5px' }}>{formatInlineStyles(item)}</li>
                    ))}
                  </GovUKList>
                );
              }
            }
            
            // 6. Check for special content patterns like "Manual section:" (specific to MOT detail)
            if (/^\*\*Manual section:\*\*/i.test(trimmedParagraph)) {
              // Extract the path from the manual section line
              const pathString = trimmedParagraph.replace(/^\*\*Manual section:\*\*/i, '').trim();
              return (
                <BreadcrumbPath key={index}>
                  <GovUKBodyS>
                    <strong>Manual section:</strong> 
                    {pathString.split('›').map((p, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span>›</span>}
                        {p.trim()}
                      </React.Fragment>
                    ))}
                  </GovUKBodyS>
                </BreadcrumbPath>
              );
            }
            
            // 7. Process status tags like "Advisory - Monitor"
            if (/^(Dangerous|Major|Minor|Advisory)\s+-\s+/i.test(trimmedParagraph)) {
              const match = trimmedParagraph.match(/^(Dangerous|Major|Minor|Advisory)\s+-\s+(.*)/i);
              if (match) {
                const category = match[1];
                const description = match[2];
                return (
                  <div key={index}>
                    <CategoryTag category={category.toLowerCase()}>
                      {category} - {description}
                    </CategoryTag>
                  </div>
                );
              }
            }
            
            // 8. Handle special case: paragraph with a list attached (often after a colon)
            // E.g., "Wear is excessive if play is more than: * 2mm for..."
            const lines = trimmedParagraph.split('\n');
            
            // Check if this paragraph contains bullet points after a line ending with a colon
            const colonIndex = lines.findIndex(line => line.trim().endsWith(':'));
            const hasBulletPoints = lines.some(line => /^\s*[-*•]\s/.test(line));
            
            if (colonIndex !== -1 && hasBulletPoints) {
              // Extract the intro text (before the bullets)
              const introText = lines.slice(0, colonIndex + 1).join(' ');
              
              // Helper function to capitalize the first letter of a string
              const capitalizeFirstLetter = (string) => {
                if (!string) return '';
                return string.charAt(0).toUpperCase() + string.slice(1);
              };
              
              // Extract the bullet points and format them
              const bulletPoints = lines.slice(colonIndex + 1)
                .filter(line => /^\s*[-*•]\s/.test(line))
                .map(line => capitalizeFirstLetter(line.replace(/^\s*[-*•]\s+/, '').trim()));
              
              return (
                <React.Fragment key={index}>
                  <GovUKBody>{formatInlineStyles(introText)}</GovUKBody>
                  <GovUKList style={{
                    paddingLeft: '20px',
                    listStyleType: 'disc',
                    marginTop: '10px',
                    marginBottom: '15px',
                    
                    '@media (min-width: 40.0625em)': {
                      marginBottom: '20px'
                    }
                  }}>
                    {bulletPoints.map((item, i) => (
                      <li key={i} style={{ marginBottom: '5px' }}>{formatInlineStyles(item)}</li>
                    ))}
                  </GovUKList>
                </React.Fragment>
              );
            }
            
            // 9. Process regular paragraphs with line breaks
            // Apply inline formatting to lines
            const formattedLines = lines.map((line, i) => {
              const formattedLine = formatInlineStyles(line);
              return i === 0 ? formattedLine : <React.Fragment key={i}><br />{formattedLine}</React.Fragment>;
            });
            
            return <GovUKBody key={index}>{formattedLines}</GovUKBody>;
          } catch (innerError) {
            console.error('Error formatting paragraph:', innerError);
            return <GovUKBody key={index}>{trimmedParagraph}</GovUKBody>;
          }
        })}
      </div>
    );
  } catch (error) {
    console.error('Error in formatText:', error);
    return <GovUKBody>{text || ''}</GovUKBody>;
  }
};




const MotDefectDetail = ({ defectId, defectText, defectCategory, expanded, toggleExpanded }) => {
  const [defectDetail, setDefectDetail] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Configure the stale time in milliseconds (1 hour)
  const CACHE_STALE_TIME = 60 * 60 * 1000;

  // Helper to check if cached data is still valid
  const isCacheValid = (cachedTime) => {
    return (Date.now() - cachedTime) < CACHE_STALE_TIME;
  };

  // Extract defect ID from text if not provided explicitly
  const extractDefectId = (text) => {
    // Look for patterns like (1.2.3) or just 1.2.3
    const match = /\(?(\d+(?:\.\d+){1,2})\)?/.exec(text);
    return match ? match[1] : null;
  };

  // Get the defect ID to use - either from props or extracted from text
  const getDefectIdToUse = () => {
    if (defectId) return defectId;
    return extractDefectId(defectText);
  };

  // Fetch defect details
  useEffect(() => {
    const fetchDefectDetail = async () => {
      const idToUse = getDefectIdToUse();
      if (!idToUse) {
        return;
      }

      const cacheKey = `defect_${idToUse}`;
      const cachedData = manualCache[cacheKey];
      
      if (cachedData && isCacheValid(cachedData.timestamp)) {
        setDefectDetail(cachedData.data);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        if (isDevelopment) {
          console.log(`Fetching MOT manual data from: ${MOT_MANUAL_API_URL}/manual/defect/${idToUse}`);
        }
        
        const response = await fetch(
          `${MOT_MANUAL_API_URL}/manual/defect/${idToUse}`, 
          {
            headers: {
              'Accept': 'application/json',
            },
            credentials: isDevelopment ? 'include' : 'same-origin',
            mode: isDevelopment ? 'cors' : 'same-origin'
          }
        );
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.detail || 'Failed to fetch defect details');
        }
        
        manualCache[cacheKey] = {
          data: data,
          timestamp: Date.now()
        };
        
        setDefectDetail(data);
      } catch (err) {
        console.error('API error:', err);
        setError(err.message || 'An error occurred while fetching defect details');
      } finally {
        setLoading(false);
      }
    };

    if (expanded) {
      fetchDefectDetail();
    }
  }, [defectId, defectText, expanded]);

  // Format defect category for display
  const formatCategory = (category) => {
    if (!category) return '';
    
    switch(category.toLowerCase()) {
      case 'dangerous':
        return 'Dangerous - Do not drive until repaired';
      case 'major':
        return 'Major - Repair immediately';
      case 'minor':
        return 'Minor - Monitor and repair if necessary';
      case 'advisory':
        return 'Advisory - Monitor';
      default:
        return category;
    }
  };

  // Render the path breadcrumb
  const renderPath = (path) => {
    if (!path || path.length === 0) return null;
    
    return (
      <BreadcrumbPath>
        <SmallText>
          <strong>Manual section:</strong> 
          {path.map((p, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span>›</span>}
              {p.title}
            </React.Fragment>
          ))}
        </SmallText>
      </BreadcrumbPath>
    );
  };

  // Render a single item detail (for direct item matches)
  const renderItemDetail = (item) => {
    if (!item) return null;
    
    return (
      <>
        {item.description && (
          <DefectSection>
            <SubTitle>Description</SubTitle>
            {formatText(item.description)}
          </DefectSection>
        )}
      </>
    );
  };

  // If no defect ID could be found or extracted
  const idToUse = getDefectIdToUse();
  if (!idToUse) {
    return null;
  }

  return (
    <>
      {expanded && (
        <DetailContent>
          {loading && (
            <LoadingContainer>
              <LoadingSpinner />
              <LoadingText>Loading content from MOT manual...</LoadingText>
            </LoadingContainer>
          )}
          
          {error && (
            <InsetText style={{ margin: 'var(--space-lg)', borderLeftColor: 'var(--negative)' }}>
              <BodyText>{error}</BodyText>
            </InsetText>
          )}
          
          {!loading && !error && defectDetail && (
            <>
              {/* Render the path */}
              {renderPath(defectDetail.path)}
              
              <DefectContent>
                {/* Show the ID and title */}
                {defectDetail.data && defectDetail.data.title && (
                  <SectionTitle>
                    {defectDetail.id}: {defectDetail.data.title}
                  </SectionTitle>
                )}
                
                {/* Show category if available */}
                {defectCategory && (
                  <CategoryTag category={defectCategory}>
                    {formatCategory(defectCategory)}
                  </CategoryTag>
                )}
                
                <GovUKSectionBreak className="govuk-section-break--m govuk-section-break--visible" />
                
                {/* Handle different types of data */}
                {defectDetail.type === 'item' && renderItemDetail(defectDetail.data)}
                
                {defectDetail.type === 'subsection' && defectDetail.data && (
                  <>
                    {defectDetail.data.description && (
                      <DefectSection>
                        <GovUKHeadingS>Description</GovUKHeadingS>
                        {formatText(defectDetail.data.description)}
                      </DefectSection>
                    )}
                    
                    {defectDetail.data.items && defectDetail.data.items.length > 0 && (
                      <DefectSection>
                        <GovUKHeadingS>Items in this subsection</GovUKHeadingS>
                        <GovUKList>
                          {defectDetail.data.items.map((item, index) => (
                            <li key={index}>
                              <strong>{item.id}:</strong> {item.title}
                            </li>
                          ))}
                        </GovUKList>
                      </DefectSection>
                    )}
                  </>
                )}
                
                {defectDetail.type === 'section' && defectDetail.data && (
                  <>
                    {defectDetail.data.description && (
                      <DefectSection>
                        <GovUKHeadingS>Description</GovUKHeadingS>
                        {formatText(defectDetail.data.description)}
                      </DefectSection>
                    )}
                    
                    {defectDetail.data.subsections && defectDetail.data.subsections.length > 0 && (
                      <DefectSection>
                        <GovUKHeadingS>Subsections</GovUKHeadingS>
                        <GovUKList>
                          {defectDetail.data.subsections.map((subsection, index) => (
                            <li key={index}>
                              <strong>{subsection.id}:</strong> {subsection.title}
                            </li>
                          ))}
                        </GovUKList>
                      </DefectSection>
                    )}
                  </>
                )}
              </DefectContent>
            </>
          )}
          
          {/* Handle multiple matches case */}
          {!loading && !error && defectDetail && defectDetail.matches && (
            <DefectContent>
              <GovUKHeadingS>Multiple entries found</GovUKHeadingS>
              <GovUKBody>Please select a specific entry below:</GovUKBody>
              <GovUKList>
                {defectDetail.matches.map((match, index) => (
                  <DefectItem key={index}>
                    <GovUKHeadingS>{match.id}: {match.title}</GovUKHeadingS>
                    {match.data.description && (
                      <GovUKBodyS>
                        {match.data.description.substring(0, 150) + 
                          (match.data.description.length > 150 ? '...' : '')}
                      </GovUKBodyS>
                    )}
                    <GovUKLink href={`#defect-${match.id}`}>
                      View full details
                    </GovUKLink>
                  </DefectItem>
                ))}
              </GovUKList>
            </DefectContent>
          )}
        </DetailContent>
      )}
    </>
  );
};

export default MotDefectDetail;