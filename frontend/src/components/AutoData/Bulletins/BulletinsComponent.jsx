import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

// Import shared components
import {
  SharedContainer,
  SharedPanel,
  SharedHeader,
  SharedTitle,
  SharedSubtitle,
  SharedTabs,
  SharedTabContent,
  SharedAccordion,
  SharedSearchAndFilters,
  SharedLoadingState,
  SharedErrorState,
  SharedEmptyState,
  SharedMatchWarning,
  SharedNoticePanel,
  SharedButton
} from '../shared/CommonElements';

// Import custom tooltip components
import { HeadingWithTooltip } from '../../../styles/tooltip';

// Import API client
import bulletinsApi from '../api/BulletinsApiClient';

// Keep existing styled components for bulletin-specific UI
import {
  BulletinsList,
  BulletinItem,
  BulletinTitle,
  BulletinDescription,
  MetadataContainer,
  MetadataItem,
  BulletinDetailPanel,
  DetailList,
  OrderedList,
  SubSectionHeading,
  InsightTable,
  ValueHighlight,
  FactorList,
  FactorItem,
  ModalOverlay,
  ModalContent,
  ModalCloseButton
} from './BulletinStyles';

// Helper function to extract vehicle year
const extractVehicleYear = (vehicleData) => {
  if (!vehicleData) return null;
  
  if (vehicleData.year && typeof vehicleData.year === 'number') {
    return vehicleData.year;
  }
  
  const dateFields = [
    'manufactureDate',
    'yearOfManufacture', 
    'registrationDate',
    'firstRegisteredDate',
    'firstRegistrationDate'
  ];
  
  for (const field of dateFields) {
    if (vehicleData[field]) {
      if (typeof vehicleData[field] === 'string') {
        const yearMatch = /(\d{4})/.exec(vehicleData[field]);
        if (yearMatch) {
          return parseInt(yearMatch[1], 10);
        }
      }
      
      if (typeof vehicleData[field] === 'number' && 
          vehicleData[field] > 1900 && 
          vehicleData[field] < 2100) {
        return vehicleData[field];
      }
    }
  }
  
  return null;
};

// Helper function to group bulletins by category
const groupBulletinsByCategory = (bulletins) => {
  if (!bulletins || !Array.isArray(bulletins)) return {};
  
  const categories = {};
  
  bulletins.forEach(bulletin => {
    // Determine category based on bulletin content
    let category = 'General';
    
    if (bulletin.problems && Array.isArray(bulletin.problems)) {
      const problemText = bulletin.problems.join(' ').toLowerCase();
      
      if (problemText.includes('engine') || problemText.includes('motor')) {
        category = 'Engine';
      } else if (problemText.includes('brake') || problemText.includes('stopping')) {
        category = 'Brakes';
      } else if (problemText.includes('transmission') || problemText.includes('gearbox')) {
        category = 'Transmission';
      } else if (problemText.includes('electrical') || problemText.includes('battery') || problemText.includes('light')) {
        category = 'Electrical';
      } else if (problemText.includes('suspension') || problemText.includes('steering')) {
        category = 'Suspension & Steering';
      } else if (problemText.includes('fuel') || problemText.includes('injection')) {
        category = 'Fuel System';
      } else if (problemText.includes('cooling') || problemText.includes('radiator') || problemText.includes('overheat')) {
        category = 'Cooling System';
      } else if (problemText.includes('exhaust') || problemText.includes('emission')) {
        category = 'Exhaust System';
      } else if (problemText.includes('air condition') || problemText.includes('hvac') || problemText.includes('climate')) {
        category = 'Climate Control';
      } else if (problemText.includes('body') || problemText.includes('door') || problemText.includes('window')) {
        category = 'Body & Interior';
      }
    }
    
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(bulletin);
  });
  
  return categories;
};

// Helper function to get category icon
const getCategoryIcon = (category) => {
  const icons = {
    'Engine': 'E',
    'Brakes': 'B', 
    'Transmission': 'T',
    'Electrical': 'EL',
    'Suspension & Steering': 'S',
    'Fuel System': 'F',
    'Cooling System': 'C',
    'Exhaust System': 'EX',
    'Climate Control': 'CC',
    'Body & Interior': 'BI',
    'General': 'G'
  };
  return icons[category] || 'G';
};

// Helper function to get category color
const getCategoryColor = (category) => {
  const colors = {
    'Engine': 'var(--primary)',
    'Brakes': 'var(--negative)',
    'Transmission': 'var(--warning)',
    'Electrical': 'var(--warning)',
    'Suspension & Steering': 'var(--positive)',
    'Fuel System': 'var(--primary)',
    'Cooling System': 'var(--positive)',
    'Exhaust System': 'var(--gray-600)',
    'Climate Control': 'var(--primary)',
    'Body & Interior': 'var(--gray-600)',
    'General': 'var(--gray-600)'
  };
  return colors[category] || 'var(--gray-600)';
};

/**
 * BulletinDetailModal Component - Full Screen Modal for Better UX
 */
const BulletinDetailModal = ({ 
  bulletin, 
  onClose, 
  matchConfidence, 
  metadata, 
  vehicleMake, 
  vehicleModel 
}) => {
  // Handle escape key and click outside to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent>
        <ModalCloseButton onClick={onClose} aria-label="Close modal">
          ×
        </ModalCloseButton>
        
        <SharedContainer>
          <SharedPanel>
            <SharedHeader>
              <HeadingWithTooltip 
                tooltip="Technical bulletin with detailed information about vehicle issues and fixes"
              >
                <SharedTitle>{bulletin.title}</SharedTitle>
              </HeadingWithTooltip>
            </SharedHeader>
            
            <SharedMatchWarning 
              matchConfidence={matchConfidence} 
              metadata={metadata} 
              vehicleMake={vehicleMake} 
              vehicleModel={vehicleModel} 
            />

            {bulletin.affected_vehicles && bulletin.affected_vehicles.length > 0 && (
              <BulletinDetailPanel>
                <h3 style={{ 
                  fontSize: 'var(--text-lg)', 
                  fontWeight: '600', 
                  color: 'var(--gray-900)', 
                  margin: '0 0 var(--space-md) 0' 
                }}>
                  Affected Vehicles
                </h3>
                <DetailList>
                  {bulletin.affected_vehicles.map((vehicle, idx) => (
                    <li key={idx} style={{ marginBottom: 'var(--space-sm)' }}>
                      {vehicle}
                    </li>
                  ))}
                </DetailList>
              </BulletinDetailPanel>
            )}
            
            {bulletin.problems && bulletin.problems.length > 0 && (
              <BulletinDetailPanel>
                <h3 style={{ 
                  fontSize: 'var(--text-lg)', 
                  fontWeight: '600', 
                  color: 'var(--gray-900)', 
                  margin: '0 0 var(--space-md) 0' 
                }}>
                  Problems
                </h3>
                <FactorList>
                  {bulletin.problems.map((problem, idx) => (
                    <FactorItem key={idx} iconColor="var(--negative)">
                      <WarningIcon style={{ color: 'var(--negative)', marginRight: 'var(--space-sm)' }} />
                      <span>{problem}</span>
                    </FactorItem>
                  ))}
                </FactorList>
              </BulletinDetailPanel>
            )}
            
            {bulletin.causes && bulletin.causes.length > 0 && (
              <BulletinDetailPanel>
                <h3 style={{ 
                  fontSize: 'var(--text-lg)', 
                  fontWeight: '600', 
                  color: 'var(--gray-900)', 
                  margin: '0 0 var(--space-md) 0' 
                }}>
                  Causes
                </h3>
                <FactorList>
                  {bulletin.causes.map((cause, idx) => (
                    <FactorItem key={idx} iconColor="var(--warning)">
                      <InfoIcon style={{ color: 'var(--warning)', marginRight: 'var(--space-sm)' }} />
                      <span>{cause}</span>
                    </FactorItem>
                  ))}
                </FactorList>
              </BulletinDetailPanel>
            )}
            
            {bulletin.remedy && (
              <BulletinDetailPanel>
                <h3 style={{ 
                  fontSize: 'var(--text-lg)', 
                  fontWeight: '600', 
                  color: 'var(--gray-900)', 
                  margin: '0 0 var(--space-md) 0' 
                }}>
                  Remedy
                </h3>
                
                {bulletin.remedy.parts && bulletin.remedy.parts.length > 0 && (
                  <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <SubSectionHeading>Parts Required</SubSectionHeading>
                    <InsightTable>
                      <thead>
                        <tr>
                          <th>Part Name</th>
                          <th>Part Number</th>
                          <th>Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulletin.remedy.parts.map((part, idx) => (
                          <tr key={idx}>
                            <td>{part.name}</td>
                            <td>{part.part_number}</td>
                            <td>{part.quantity || 1}</td>
                          </tr>
                        ))}
                      </tbody>
                    </InsightTable>
                  </div>
                )}
                
                {bulletin.remedy.steps && bulletin.remedy.steps.length > 0 && (
                  <div>
                    <SubSectionHeading>Repair Steps</SubSectionHeading>
                    <OrderedList>
                      {bulletin.remedy.steps.map((step, idx) => (
                        <li key={idx} style={{ marginBottom: 'var(--space-md)' }}>
                          {step}
                        </li>
                      ))}
                    </OrderedList>
                  </div>
                )}
              </BulletinDetailPanel>
            )}
            
            {bulletin.notes && bulletin.notes.length > 0 && (
              <BulletinDetailPanel>
                <h3 style={{ 
                  fontSize: 'var(--text-lg)', 
                  fontWeight: '600', 
                  color: 'var(--gray-900)', 
                  margin: '0 0 var(--space-md) 0' 
                }}>
                  Notes
                </h3>
                <FactorList>
                  {bulletin.notes.map((note, idx) => (
                    <FactorItem key={idx} iconColor="var(--primary)">
                      <InfoIcon style={{ color: 'var(--primary)', marginRight: 'var(--space-sm)' }} />
                      <span>{note}</span>
                    </FactorItem>
                  ))}
                </FactorList>
              </BulletinDetailPanel>
            )}
            
            <div style={{ 
              marginTop: 'var(--space-2xl)', 
              paddingTop: 'var(--space-lg)', 
              borderTop: '1px solid var(--gray-200)', 
              fontSize: 'var(--text-sm)', 
              color: 'var(--gray-500)', 
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-sm)'
            }}>
              <InfoIcon style={{ fontSize: 'var(--text-sm)' }} />
              This technical bulletin is provided based on manufacturer information. 
              Consult with a qualified technician before attempting any repairs.
            </div>
          </SharedPanel>
        </SharedContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

/**
 * BulletinList Component - Renders bulletins in grid format
 */
const BulletinListView = ({ bulletins, onViewDetails }) => {
  if (!bulletins || bulletins.length === 0) return null;

  return (
    <BulletinsList>
      {bulletins.map((bulletin, index) => (
        <BulletinItem key={bulletin.id || index}>
          <BulletinTitle>{bulletin.title}</BulletinTitle>
          
          {bulletin.problems && bulletin.problems.length > 0 && (
            <BulletinDescription>
              <ValueHighlight color="var(--negative)">Problem:</ValueHighlight> {bulletin.problems[0]}
              {bulletin.problems.length > 1 && ` and ${bulletin.problems.length - 1} more...`}
            </BulletinDescription>
          )}
          
          <MetadataContainer>
            {bulletin.affected_vehicles && bulletin.affected_vehicles.length > 0 && (
              <MetadataItem>
                <InfoIcon style={{ color: 'var(--primary)', marginRight: 'var(--space-sm)' }} />
                {bulletin.affected_vehicles.length} affected {bulletin.affected_vehicles.length === 1 ? 'model' : 'models'}
              </MetadataItem>
            )}
            
            {bulletin.remedy && bulletin.remedy.parts && bulletin.remedy.parts.length > 0 && (
              <MetadataItem>
                <InfoIcon style={{ color: 'var(--primary)', marginRight: 'var(--space-sm)' }} />
                {bulletin.remedy.parts.length} {bulletin.remedy.parts.length === 1 ? 'part' : 'parts'} required
              </MetadataItem>
            )}
          </MetadataContainer>
          
          <SharedButton onClick={() => onViewDetails(bulletin.id || index)}>
            View details
          </SharedButton>
        </BulletinItem>
      ))}
    </BulletinsList>
  );
};

/**
 * Main BulletinsComponent - Refactored to use unified design pattern
 */
const BulletinsComponent = ({
  vehicleData = null,
  make,
  model,
  engineCode = null,
  year = null,
  apiBaseUrl = '/api/v1',
  loading: initialLoading = false,
  error: initialError = null,
  onDataLoad
}) => {
  // States
  const [tabValue, setTabValue] = useState(0);
  const [bulletins, setBulletins] = useState(null);
  const [allBulletins, setAllBulletins] = useState(null);
  const [loading, setLoading] = useState(initialLoading || true);
  const [error, setError] = useState(initialError);
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [matchConfidence, setMatchConfidence] = useState('none');
  const abortControllerRef = useRef(null);

  // Set custom API base URL if provided
  useEffect(() => {
    if (apiBaseUrl !== '/api/v1') {
      bulletinsApi.baseUrl = apiBaseUrl;
    }
  }, [apiBaseUrl]);

  // Determine vehicle properties based on either vehicleData object or individual props
  const vehicleMake = vehicleData?.make || make;
  const vehicleModel = vehicleData?.model || vehicleData?.vehicleModel || model;
  const vehicleYear = vehicleData ? extractVehicleYear(vehicleData) : year;
  const vehicleEngineCode = vehicleData?.engineCode || vehicleData?.engine_code || engineCode;

  // Handle tab change
  const handleTabChange = useCallback((newTabIndex) => {
    setTabValue(newTabIndex);
  }, []);

  // Handle accordion toggle
  const handleAccordionToggle = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  // Handle search
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // Handle view details
  const handleViewDetails = useCallback((bulletinId) => {
    setSelectedBulletin(bulletinId);
  }, []);

  // Handle close modal
  const handleCloseModal = useCallback(() => {
    setSelectedBulletin(null);
  }, []);

  // Load bulletins when vehicle information changes
  useEffect(() => {
    if (!vehicleMake || !vehicleModel) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSelectedBulletin(null);
    setSearchTerm('');
    setMatchConfidence('none');

    // Cancel any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();

    const loadBulletins = async () => {
      try {
        let data;
        
        if (vehicleData) {
          data = await bulletinsApi.lookupBulletins(vehicleData);
        } else {
          data = await bulletinsApi.getBulletins(vehicleMake, vehicleModel, vehicleEngineCode, vehicleYear);
        }
        
        if (data && data.bulletins) {
          setBulletins(data);
          setAllBulletins(data);
          
          // Determine match confidence from metadata
          if (data.metadata?.matched_to) {
            setMatchConfidence('fuzzy');
          } else {
            setMatchConfidence('exact');
          }
          
          // Call onDataLoad if provided
          if (onDataLoad) {
            onDataLoad(data);
          }
        } else {
          setError('Invalid data format received from server');
        }
        setLoading(false);
      } catch (err) {
        // Don't handle aborted requests as errors
        if (err.name === 'AbortError') {
          return;
        }
        
        setError(err.message || 'Failed to fetch bulletins');
        setLoading(false);
      }
    };
    
    loadBulletins();
    
    // Cleanup function to abort any pending requests when unmounting
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [vehicleMake, vehicleModel, vehicleEngineCode, vehicleYear, vehicleData, onDataLoad]);

  // Group bulletins by category and create tabs
  const tabs = useMemo(() => {
    if (!bulletins?.bulletins) return [];
    
    const categorizedBulletins = groupBulletinsByCategory(bulletins.bulletins);
    
    return Object.entries(categorizedBulletins).map(([category, categoryBulletins]) => ({
      label: category,
      icon: getCategoryIcon(category),
      color: getCategoryColor(category),
      bulletins: categoryBulletins,
      count: categoryBulletins.length
    })).sort((a, b) => b.count - a.count); // Sort by count, highest first
  }, [bulletins]);

  // Filter bulletins based on search term
  const filteredBulletins = useMemo(() => {
    if (!tabs[tabValue] || !searchTerm) {
      return tabs[tabValue]?.bulletins || [];
    }

    const searchTermLower = searchTerm.toLowerCase();
    return tabs[tabValue].bulletins.filter(bulletin =>
      bulletin.title.toLowerCase().includes(searchTermLower) ||
      (bulletin.problems &&
        bulletin.problems.some(p => p.toLowerCase().includes(searchTermLower)))
    );
  }, [tabs, tabValue, searchTerm]);

  // Loading state
  if (loading) {
    return (
      <SharedLoadingState
        title="Loading technical bulletins"
        subtitle="Please wait while we search for bulletins"
        vehicleMake={vehicleMake}
        vehicleModel={vehicleModel}
      />
    );
  }

  // Error state with no bulletins
  if (error && (!bulletins || !bulletins.bulletins || bulletins.bulletins.length === 0)) {
    return (
      <SharedErrorState
        error={error}
        onRetry={handleRetry}
        title="Error Loading Bulletins"
      />
    );
  }

  // No data state
  if (!bulletins || !bulletins.bulletins || bulletins.bulletins.length === 0) {
    return (
      <SharedEmptyState
        title={`No technical bulletins found for ${vehicleMake} ${vehicleModel}`}
        subtitle="This could be because the vehicle is too new, too old, or has no known technical issues."
        icon={InfoIcon}
      />
    );
  }

  const vehicleInfo = bulletins.metadata || bulletins.vehicle_info || {};
  const hasTabs = tabs && tabs.length > 0;

  // Find the current bulletin if in detail view
  const currentBulletin = selectedBulletin !== null
    ? bulletins.bulletins.find((b, index) => (b.id || index) === selectedBulletin)
    : null;

  return (
    <>
      <SharedContainer>
        <SharedPanel>
          <SharedHeader>
            <HeadingWithTooltip 
              tooltip="Technical bulletins for your vehicle, based on manufacturer data"
            >
              <SharedTitle>Technical Bulletins for {vehicleMake} {vehicleModel}</SharedTitle>
            </HeadingWithTooltip>
            <SharedSubtitle>
              {vehicleInfo.engine_info && `Engine: ${vehicleInfo.engine_info}. `}
              {vehicleYear && `Year: ${vehicleYear}. `}
              Found {bulletins.bulletins.length} technical bulletins that may apply to your vehicle.
            </SharedSubtitle>
          </SharedHeader>

          <SharedMatchWarning 
            matchConfidence={matchConfidence} 
            metadata={bulletins.metadata} 
            vehicleMake={vehicleMake} 
            vehicleModel={vehicleModel} 
          />

          {error && (
            <SharedNoticePanel>
              <h3 style={{ color: 'var(--warning)' }}>Notice</h3>
              <p>{error}</p>
            </SharedNoticePanel>
          )}

          {hasTabs ? (
            <>
              <SharedSearchAndFilters
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                placeholder="Search bulletins..."
                onClearFilters={handleClearFilters}
                resultCount={filteredBulletins.length}
              />

              <SharedTabs
                tabs={tabs}
                activeTab={tabValue}
                onTabChange={handleTabChange}
              >
                {tabs.map((tab, tabIndex) => (
                  <SharedTabContent key={`content-${tabIndex}`} active={tabValue === tabIndex}>
                    <div style={{
                      marginBottom: 'var(--space-xl)',
                      paddingBottom: 'var(--space-lg)',
                      borderBottom: `2px solid ${tab.color}`
                    }}>
                      <h3 style={{ 
                        fontSize: 'var(--text-xl)', 
                        fontWeight: '600', 
                        color: 'var(--gray-900)', 
                        margin: '0 0 var(--space-sm) 0' 
                      }}>
                        {tab.label} Issues
                      </h3>
                      <p style={{ 
                        fontSize: 'var(--text-base)', 
                        color: 'var(--gray-600)', 
                        margin: 0 
                      }}>
                        Technical bulletins related to {tab.label.toLowerCase()} problems and solutions
                      </p>
                    </div>

                    {filteredBulletins.length === 0 ? (
                      <SharedNoticePanel>
                        <p>
                          {searchTerm 
                            ? `No bulletins match your search in the ${tab.label} category.`
                            : `No bulletins found in the ${tab.label} category.`
                          }
                        </p>
                      </SharedNoticePanel>
                    ) : (
                      <BulletinListView 
                        bulletins={filteredBulletins}
                        onViewDetails={handleViewDetails}
                      />
                    )}
                  </SharedTabContent>
                ))}
              </SharedTabs>
            </>
          ) : (
            <SharedNoticePanel>
              <p>
                No bulletins could be categorized for this vehicle.
              </p>
            </SharedNoticePanel>
          )}

          <div style={{ 
            marginTop: 'var(--space-2xl)', 
            paddingTop: 'var(--space-lg)', 
            borderTop: '1px solid var(--gray-200)', 
            fontSize: 'var(--text-sm)', 
            color: 'var(--gray-500)', 
            textAlign: 'center' 
          }}>
            Technical bulletins sourced from manufacturer databases.<br />
            Last updated: March 2025
          </div>
        </SharedPanel>
      </SharedContainer>
      
      {/* Render modal if bulletin is selected */}
      {selectedBulletin !== null && currentBulletin && (
        <BulletinDetailModal 
          bulletin={currentBulletin}
          onClose={handleCloseModal}
          matchConfidence={matchConfidence}
          metadata={bulletins.metadata}
          vehicleMake={vehicleMake}
          vehicleModel={vehicleModel}
        />
      )}
    </>
  );
};

export default React.memo(BulletinsComponent);