import { styled } from '@mui/material/styles';

// Local font styles (detached from legacy theme)
const localFontStyles = `
  font-family: "Jost", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-weight: 400;
  line-height: 1.5;
`;

// Styled components for DataTabs
export const SectionContainer = styled('div')`
  ${localFontStyles}
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const SectionContent = styled('div')`
  padding-bottom: 20px;
`;