import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { HeadingWithTooltip } from '../../styles/tooltip';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import bulletinsApi from './api/BulletinsApiClient';

import {
  BulletinsContainer,
  MainLayout,
  Sidebar,
  ContentArea,
  CategoryContainer,
  CategoryTitle,
  CategoryList,
  CategoryItem,
  CategoryCount,
  SearchContainer,
  SearchInput,
  GovButton,
  BackButton,
  ActionButton,
  BulletinsList,
  BulletinItem,
  BulletinTitle,
  BulletinDescription,
  MetadataContainer,
  MetadataItem,
  BulletinPanel,
  BulletinDetailPanel,
  WarningPanel,
  DetailList,
  OrderedList,
  SubSectionHeading,
  StyledFooterNote,
  CleanContainer,
  CleanHeadingM,
  CleanHeadingS,
  CleanBody,
  CleanBodyS,
  CleanLoadingSpinner,
  InsightsContainer,
  InsightBody,
  InsightTable,
  ValueHighlight,
  FactorList,
  FactorItem,
  InsightNote,
  EnhancedLoadingContainer,
  StyledEmptyStateContainer as EmptyStateContainer
} from './styles/BulletinStyles';


const extractVehicleYear = (vehicleData) => {
  if (!vehicleData) return null;
  
  // First check if we already have a year field
  if (vehicleData.year && typeof vehicleData.year === 'number') {
    return vehicleData.year;
  }
  
  // Try different date fields that might contain year information
  const dateFields = [
    'manufactureDate',
    'yearOfManufacture',
    'registrationDate',
    'firstRegisteredDate',
    'firstRegistrationDate'
  ];
  
  for (const field of dateFields) {
    if (vehicleData[field]) {
      // If it's a string, try to extract a 4-digit year
      if (typeof vehicleData[field] === 'string') {
        const yearMatch = /(\d{4})/.exec(vehicleData[field]);
        if (yearMatch) {
          return parseInt(yearMatch[1], 10);
        }
      }
      
      // If it's a number in a reasonable year range
      if (typeof vehicleData[field] === 'number' && 
          vehicleData[field] > 1900 && 
          vehicleData[field] < 2100) {
        return vehicleData[field];
      }
    }
  }
  
  return null;
};

// Styled icon components using CSS custom properties
const StyledWarningIcon = () => (
  <WarningIcon fontSize="small" sx={{ color: 'var(--negative)', marginRight: 'var(--space-sm)' }} />
);

const StyledInfoIcon = ({ color = 'var(--primary)' }) => (
  <InfoIcon fontSize="small" sx={{ color, marginRight: 'var(--space-sm)' }} />
);

/**
 * MatchWarning Component - Extracted for reusability
 */
const MatchWarning = ({ matchConfidence, metadata, vehicleMake, vehicleModel }) => {
  if (matchConfidence !== 'fuzzy' || !metadata?.matched_to) return null;
  
  return (
    <WarningPanel>
      <StyledWarningIcon />
      <div>
        <CleanHeadingS>Approximate Match</CleanHeadingS>
        <CleanBodyS>
          We don't have exact data for your <strong>{vehicleMake} {vehicleModel}</strong>. 
          The bulletins shown are based on <strong>{metadata.matched_to.make} {metadata.matched_to.model}</strong>, 
          which is the closest match to your vehicle.
        </CleanBodyS>
      </div>
    </WarningPanel>
  );
};

/**
 * Loading State Component - Extracted for reusability
 */
const LoadingState = ({ vehicleMake, vehicleModel }) => (
  <CleanContainer>
    <EnhancedLoadingContainer>
      <CleanLoadingSpinner />
      <InsightBody>Loading technical bulletins...</InsightBody>
      <CleanBodyS style={{ color: 'var(--gray-500)' }}>
        Please wait while we search for bulletins for {vehicleMake} {vehicleModel}
      </CleanBodyS>
    </EnhancedLoadingContainer>
  </CleanContainer>
);

/**
 * Error State Component - Extracted for reusability
 */
const ErrorState = ({ error, onRetry }) => (
  <CleanContainer>
    <EmptyStateContainer>
      <WarningIcon sx={{ fontSize: 40, color: 'var(--negative)', marginBottom: 'var(--space-md)' }} />
      <InsightBody>
        <ValueHighlight color="var(--negative)">Error Loading Bulletins:</ValueHighlight> {error}
      </InsightBody>
      <GovButton onClick={onRetry}>
        Try again
      </GovButton>
    </EmptyStateContainer>
  </CleanContainer>
);

/**
 * Empty State Component - Extracted for reusability
 */
const EmptyState = ({ vehicleMake, vehicleModel }) => (
  <CleanContainer>
    <EmptyStateContainer>
      <InfoIcon sx={{ fontSize: 40, color: 'var(--primary)', marginBottom: 'var(--space-md)' }} />
      <InsightBody>
        No technical bulletins found for {vehicleMake} {vehicleModel}
      </InsightBody>
    </EmptyStateContainer>
  </CleanContainer>
);

/**
 * BulletinDetail Component - Extracted for cleaner code organization
 */
const BulletinDetail = ({ 
  bulletin, 
  onBack, 
  matchConfidence, 
  metadata, 
  vehicleMake, 
  vehicleModel, 
  error 
}) => (
  <BulletinsContainer>
    <InsightsContainer>
      <BackButton onClick={onBack}>
        ← Back to all bulletins
      </BackButton>

      <BulletinPanel>
        <HeadingWithTooltip 
          tooltip="Technical bulletin with detailed information about vehicle issues and fixes"
          iconColor="var(--primary)"
        >
          <CleanHeadingM>{bulletin.title}</CleanHeadingM>
        </HeadingWithTooltip>
        
        <MatchWarning 
          matchConfidence={matchConfidence} 
          metadata={metadata} 
          vehicleMake={vehicleMake} 
          vehicleModel={vehicleModel} 
        />
        
        {error && (
          <InsightNote sx={{ backgroundColor: 'var(--negative-light)', borderColor: 'var(--negative)' }}>
            <StyledWarningIcon />
            <CleanBody>{error}</CleanBody>
          </InsightNote>
        )}

        {bulletin.affected_vehicles && bulletin.affected_vehicles.length > 0 && (
          <BulletinDetailPanel color="var(--primary)">
            <CleanHeadingS>Affected Vehicles</CleanHeadingS>
            <DetailList>
              {bulletin.affected_vehicles.map((vehicle, idx) => (
                <li key={idx}>
                  <CleanBody>{vehicle}</CleanBody>
                </li>
              ))}
            </DetailList>
          </BulletinDetailPanel>
        )}
        
        {bulletin.problems && bulletin.problems.length > 0 && (
          <BulletinDetailPanel color="var(--negative)">
            <CleanHeadingS>Problems</CleanHeadingS>
            <FactorList>
              {bulletin.problems.map((problem, idx) => (
                <FactorItem key={idx} iconColor="var(--negative)">
                  <StyledWarningIcon />
                  <span>{problem}</span>
                </FactorItem>
              ))}
            </FactorList>
          </BulletinDetailPanel>
        )}
        
        {bulletin.causes && bulletin.causes.length > 0 && (
          <BulletinDetailPanel color="var(--warning)">
            <CleanHeadingS>Causes</CleanHeadingS>
            <FactorList>
              {bulletin.causes.map((cause, idx) => (
                <FactorItem key={idx} iconColor="var(--warning)">
                  <StyledInfoIcon color="var(--warning)" />
                  <span>{cause}</span>
                </FactorItem>
              ))}
            </FactorList>
          </BulletinDetailPanel>
        )}
        
        {bulletin.remedy && (
          <BulletinDetailPanel color="var(--positive)">
            <CleanHeadingS>Remedy</CleanHeadingS>
            
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
                    <li key={idx}>
                      <CleanBody>{step}</CleanBody>
                    </li>
                  ))}
                </OrderedList>
              </div>
            )}
          </BulletinDetailPanel>
        )}
        
        {bulletin.notes && bulletin.notes.length > 0 && (
          <BulletinDetailPanel color="var(--primary-dark)">
            <CleanHeadingS>Notes</CleanHeadingS>
            <FactorList>
              {bulletin.notes.map((note, idx) => (
                <FactorItem key={idx} iconColor="var(--primary)">
                  <StyledInfoIcon />
                  <span>{note}</span>
                </FactorItem>
              ))}
            </FactorList>
          </BulletinDetailPanel>
        )}
        
        <StyledFooterNote>
          <StyledInfoIcon />
          This technical bulletin is provided based on manufacturer information. 
          Consult with a qualified technician before attempting any repairs.
        </StyledFooterNote>
      </BulletinPanel>
    </InsightsContainer>
  </BulletinsContainer>
);

/**
 * SearchAndFilters Component - Extracted for cleaner code organization
 */
const SearchAndFilters = ({ 
  searchTerm, 
  onSearchChange, 
  onClearFilters, 
  showClearFilters, 
  filteredCount, 
  selectedCategory 
}) => (
  <SearchContainer>
    <CleanBodyS>
      {filteredCount} bulletins 
      {selectedCategory ? ` in category "${selectedCategory}"` : ""} 
      {searchTerm ? ` matching "${searchTerm}"` : ""}
    </CleanBodyS>
    
    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
      {showClearFilters && (
        <GovButton 
          onClick={onClearFilters}
          className="govuk-button--secondary"
        >
          Clear Filters
        </GovButton>
      )}
      
      <SearchInput
        placeholder="Search bulletins..."
        value={searchTerm}
        onChange={onSearchChange}
        aria-label="search bulletins"
      />
    </div>
  </SearchContainer>
);

/**
 * Categories Component - Extracted for cleaner code organization
 */
const CategoriesSidebar = ({ 
  categories, 
  selectedCategory, 
  onCategorySelect, 
  onShowAllCategories 
}) => (
  <Sidebar>
    <CategoryContainer>
      <CategoryTitle>Filter by category</CategoryTitle>
      
      <CategoryList>
        <CategoryItem 
          isActive={selectedCategory === null}
          onClick={onShowAllCategories}
        >
          All Categories
        </CategoryItem>
        
        {categories && Object.keys(categories).map(category => (
          <CategoryItem
            key={category}
            isActive={selectedCategory === category}
            onClick={() => onCategorySelect(category)}
          >
            {category} 
            <CategoryCount>({categories[category].length})</CategoryCount>
          </CategoryItem>
        ))}
      </CategoryList>
    </CategoryContainer>
  </Sidebar>
);

/**
 * BulletinList Component - Extracted for cleaner code organization
 */
const BulletinListView = ({ bulletins, onViewDetails }) => (
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
              <StyledInfoIcon />
              {bulletin.affected_vehicles.length} affected {bulletin.affected_vehicles.length === 1 ? 'model' : 'models'}
            </MetadataItem>
          )}
          
          {bulletin.remedy && bulletin.remedy.parts && bulletin.remedy.parts.length > 0 && (
            <MetadataItem>
              <StyledInfoIcon />
              {bulletin.remedy.parts.length} {bulletin.remedy.parts.length === 1 ? 'part' : 'parts'} required
            </MetadataItem>
          )}
        </MetadataContainer>
        
        <ActionButton onClick={() => onViewDetails(bulletin.id)}>
          View details
        </ActionButton>
      </BulletinItem>
    ))}
  </BulletinsList>
);

/**
 * NoResults Component - Extracted for cleaner code organization
 */
const NoResults = ({ onClearFilters }) => (
  <EmptyStateContainer>
    <InfoIcon sx={{ fontSize: 40, color: 'var(--primary)', marginBottom: 'var(--space-md)' }} />
    <InsightBody>
      No bulletins match your search criteria
    </InsightBody>
    <GovButton onClick={onClearFilters}>
      Clear Filters
    </GovButton>
  </EmptyStateContainer>
);

/**
 * Main BulletinsComponent
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
  const [bulletins, setBulletins] = useState(null);
  const [allBulletins, setAllBulletins] = useState(null);
  const [loading, setLoading] = useState(initialLoading || true);
  const [error, setError] = useState(initialError);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [matchConfidence, setMatchConfidence] = useState('none');
  const abortControllerRef = useRef(null);

  // Set custom API base URL if provided
  useEffect(() => {
    if (apiBaseUrl !== '/api/v1') {
      bulletinsApi.baseUrl = apiBaseUrl;
    }
  }, [apiBaseUrl]);

  // Reset error when category or bulletin selection changes
  useEffect(() => {
    setError(null);
  }, [selectedCategory, selectedBulletin]);

  // Determine vehicle properties based on either vehicleData object or individual props
  const vehicleMake = vehicleData?.make || make;
  const vehicleModel = vehicleData?.model || vehicleData?.vehicleModel || model;
  const vehicleYear = vehicleData ? extractVehicleYear(vehicleData) : year;
  const vehicleEngineCode = vehicleData?.engineCode || vehicleData?.engine_code || engineCode;

  // Load bulletins when vehicle information changes
  useEffect(() => {
    if (!vehicleMake || !vehicleModel) {
      return; // Don't attempt to load without at least make and model
    }
    
    setLoading(true);
    setError(null);
    setSelectedCategory(null);
    setSelectedBulletin(null);
    setSearchTerm('');
    setMatchConfidence('none');

    // Cancel any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // Choose appropriate loading method based on what data we have
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

  // Load category - client-side filtering as primary approach
  const loadCategory = useCallback((category) => {
    setSelectedCategory(category);
    setSelectedBulletin(null);
    setSearchTerm('');
    setError(null);
    
    // If "All Categories" is selected, restore all bulletins
    if (!category) {
      if (allBulletins) {
        setBulletins(allBulletins);
      }
      return;
    }

    // Check if we have the necessary data
    if (!allBulletins || !allBulletins.categories || !allBulletins.categories[category]) {
      // Fall back to API call if category data isn't available
      fetchCategoryFromAPI(category);
      return;
    }

    // Client-side filtering
    setLoading(true);
    
    try {
      // Get all titles from this category
      const categoryItems = allBulletins.categories[category];
      const categoryTitles = categoryItems.map(item => item.title);
      
      // Filter bulletins that match by title or by problem
      const filteredBulletins = {
        ...allBulletins,
        bulletins: allBulletins.bulletins.filter(bulletin => {
          // Direct title match
          if (bulletin.title && categoryTitles.includes(bulletin.title)) {
            return true;
          }
          
          // Problem match (fallback)
          if (bulletin.problems && Array.isArray(bulletin.problems)) {
            return bulletin.problems.some(problem => categoryTitles.includes(problem));
          }
          
          return false;
        })
      };
      
      if (filteredBulletins.bulletins.length === 0) {
        setError(`No bulletins found in category "${category}"`);
        setBulletins(allBulletins);
      } else {
        setBulletins(filteredBulletins);
      }
      
      setLoading(false);
    } catch (err) {
      // On error, fall back to API
      fetchCategoryFromAPI(category);
    }
  }, [allBulletins]);

  // Fetch category from API
  const fetchCategoryFromAPI = useCallback(async (category) => {
    setLoading(true);
    
    try {
      let data;
      
      if (vehicleData) {
        data = await bulletinsApi.lookupBulletins(vehicleData, category);
      } else {
        data = await bulletinsApi.getBulletins(
          vehicleMake, 
          vehicleModel, 
          vehicleEngineCode, 
          vehicleYear, 
          category
        );
      }
      
      if (data && data.bulletins) {
        if (data.bulletins.length === 0) {
          setError(`No bulletins found in category "${category}"`);
          if (allBulletins) {
            setBulletins(allBulletins);
          }
        } else {
          setBulletins(data);
        }
      } else {
        setError('No bulletins found for this category');
        
        if (allBulletins) {
          setBulletins(allBulletins);
        }
      }
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch bulletins for this category');
      setLoading(false);
      
      if (allBulletins) {
        setBulletins(allBulletins);
      }
    }
  }, [vehicleData, vehicleMake, vehicleModel, vehicleEngineCode, vehicleYear, allBulletins]);

  // Load specific bulletin
  const loadBulletin = useCallback((bulletinId) => {
    if (!bulletinId) return;
    setSelectedBulletin(bulletinId);
    setError(null);
  }, []);

  // Search within bulletins - memoized to prevent unnecessary recalculations
  const filteredBulletinsList = useMemo(() => {
    if (!bulletins?.bulletins) {
      return [];
    }
    
    if (!searchTerm) {
      return bulletins.bulletins;
    }

    const searchTermLower = searchTerm.toLowerCase();
    return bulletins.bulletins.filter(bulletin =>
      bulletin.title.toLowerCase().includes(searchTermLower) ||
      (bulletin.problems &&
        bulletin.problems.some(p => p.toLowerCase().includes(searchTermLower)))
    );
  }, [bulletins, searchTerm]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSelectedCategory(null);
    setSelectedBulletin(null);
    setSearchTerm('');
    if (allBulletins) {
      setBulletins(allBulletins);
    }
  }, [allBulletins]);

  // Handler for retrying when an error occurs
  const handleRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => window.location.reload(), 500);
  }, []);

  // Handler for returning from bulletin detail view
  const handleBackFromDetail = useCallback(() => {
    setSelectedBulletin(null);
    if (selectedCategory || searchTerm) {
      // Filtering is already applied, no need to change bulletins
    } 
    // If we're showing a single bulletin because we called the API with bulletin_id,
    // restore all bulletins
    else if (bulletins?.bulletins.length === 1 && allBulletins && allBulletins.bulletins.length > 1) {
      setBulletins(allBulletins);
    }
  }, [selectedCategory, searchTerm, bulletins, allBulletins]);

  // Handler for search input changes
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // Loading state
  if (loading) {
    return <LoadingState vehicleMake={vehicleMake} vehicleModel={vehicleModel} />;
  }

  // Error state with no bulletins
  if (error && (!bulletins || !bulletins.bulletins || bulletins.bulletins.length === 0)) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  // No data state
  if (!bulletins || !bulletins.bulletins || bulletins.bulletins.length === 0) {
    return <EmptyState vehicleMake={vehicleMake} vehicleModel={vehicleModel} />;
  }

  const vehicleInfo = bulletins.metadata || bulletins.vehicle_info || {};

  // Find the current bulletin if in detail view
  const currentBulletin = selectedBulletin 
    ? bulletins.bulletins.find(b => b.id === selectedBulletin) || 
      allBulletins?.bulletins.find(b => b.id === selectedBulletin)
    : null;

  // Render bulletin detail view
  if (selectedBulletin && currentBulletin) {
    return (
      <BulletinDetail 
        bulletin={currentBulletin}
        onBack={handleBackFromDetail}
        matchConfidence={matchConfidence}
        metadata={bulletins.metadata}
        vehicleMake={vehicleMake}
        vehicleModel={vehicleModel}
        error={error}
      />
    );
  }

  // Render bulletins list view
  return (
    <BulletinsContainer>
      <InsightsContainer>
        <BulletinPanel>
          <HeadingWithTooltip 
            tooltip="Technical bulletins for your vehicle, based on manufacturer data"
            iconColor="var(--primary)"
          >
            <CleanHeadingM>Technical Bulletins for {vehicleMake} {vehicleModel}</CleanHeadingM>
          </HeadingWithTooltip>
          
          <InsightBody>
            {vehicleInfo.engine_info && `Engine: ${vehicleInfo.engine_info}. `}
            {vehicleYear && `Year: ${vehicleYear}. `}
            Found {bulletins.bulletins.length} technical bulletins that may apply to your vehicle.
          </InsightBody>
          
          <MatchWarning 
            matchConfidence={matchConfidence} 
            metadata={bulletins.metadata} 
            vehicleMake={vehicleMake} 
            vehicleModel={vehicleModel} 
          />
          
          {error && (
            <InsightNote sx={{ backgroundColor: 'var(--negative-light)', borderColor: 'var(--negative)', marginBottom: 'var(--space-lg)' }}>
              <StyledWarningIcon />
              <CleanBody>{error}</CleanBody>
            </InsightNote>
          )}
          
          <SearchAndFilters 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onClearFilters={resetFilters}
            showClearFilters={searchTerm || selectedCategory}
            filteredCount={filteredBulletinsList.length}
            selectedCategory={selectedCategory}
          />
          
          <MainLayout>
            {/* Categories sidebar */}
            <CategoriesSidebar 
              categories={allBulletins?.categories}
              selectedCategory={selectedCategory}
              onCategorySelect={loadCategory}
              onShowAllCategories={resetFilters}
            />
            
            {/* Bulletins content */}
            <ContentArea>
              {filteredBulletinsList.length === 0 ? (
                <NoResults onClearFilters={resetFilters} />
              ) : (
                <BulletinListView 
                  bulletins={filteredBulletinsList}
                  onViewDetails={loadBulletin}
                />
              )}
            </ContentArea>
          </MainLayout>
        </BulletinPanel>
      </InsightsContainer>
    </BulletinsContainer>
  );
};

export default React.memo(BulletinsComponent);