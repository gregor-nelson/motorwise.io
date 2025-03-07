// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   GovUKContainer,
//   GovUKMainWrapper,
//   GovUKGridRow,
//   GovUKGridColumnTwoThirds,
//   GovUKHeadingXL,
//   GovUKHeadingM,
//   GovUKHeadingS,
//   GovUKBody,
//   DvsaVRM,
// } from '../../theme';
// import motData from './motData.json';
// import {
//   Card,
//   CardContent,
//   Grid,
//   Typography,
//   List,
//   ListItem,
//   ListItemText,
//   Box,
//   LinearProgress,
//   Skeleton,
//   Tooltip,
// } from '@mui/material';
// import { Build, Warning, Info, BuildOutlined, Star } from '@mui/icons-material';

// // Reusable AdvisoryCard Component (no collapse functionality)
// const AdvisoryCard = ({ title, borderColor, icon: Icon, children }) => (
//   <Card
//     sx={{
//       minHeight: 200,
//       boxShadow: 1,
//       borderLeft: `4px solid ${borderColor}`,
//       transition: 'box-shadow 0.3s ease',
//       '&:hover': { boxShadow: 3 },
//     }}
//   >
//     <CardContent>
//       <Box display="flex" alignItems="center" gap={1}>
//         {Icon && <Icon sx={{ color: borderColor }} />}
//         <GovUKHeadingM>{title}</GovUKHeadingM>
//       </Box>
//       {children}
//     </CardContent>
//   </Card>
// );

// const MOTAdvisoryBreakdown = () => {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     setData(motData); // Simulate async data fetch if needed
//   }, []);

//   const healthScore = useMemo(() => {
//     return data ? parseInt(data.sections.recommendation.score.split('/')[0], 10) * 10 : 0;
//   }, [data]);

//   if (!data) {
//     return (
//       <GovUKContainer sx={{ p: 3 }}>
//         <Skeleton variant="text" width="60%" height={60} />
//         <Skeleton variant="rectangular" height={150} sx={{ mb: 2 }} />
//         <Skeleton variant="rectangular" height={200} />
//       </GovUKContainer>
//     );
//   }

//   const { vehicle, sections } = data;

//   return (
//     <GovUKContainer
//       sx={{
//         minHeight: '100vh',
//         display: 'flex',
//         flexDirection: 'column',
//         maxWidth: '100%',
//         width: '100%',
//         marginRight: 0,
//         marginLeft: 0,
//         padding: '0 15px',
//       }}
//     >
//       <GovUKMainWrapper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
//         <GovUKGridRow sx={{ flexGrow: 1, margin: 0 }}>
//           <GovUKGridColumnTwoThirds
//             sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', padding: 0 }}
//           >
//             {/* Header Section */}
//             <GovUKHeadingXL motStatus="PASS">MOT Advisory Report</GovUKHeadingXL>
//             <GovUKBody>
//               {vehicle.make} {vehicle.model} ({vehicle.year})
//             </GovUKBody>

//             {/* Sticky Vehicle Summary Card */}
//             <Card
//               sx={{
//                 mb: 4,
//                 boxShadow: 1,
//                 position: 'sticky',
//                 top: 0,
//                 zIndex: 1,
//                 backgroundColor: '#fff',
//               }}
//             >
//               <CardContent>
//                 <GovUKHeadingM>Vehicle Overview</GovUKHeadingM>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} sm={4}>
//                     <Typography variant="body1">
//                       <strong>Reg:</strong> <DvsaVRM>{vehicle.registration}</DvsaVRM>
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={12} sm={4}>
//                     <Typography variant="body1">
//                       <strong>Test Date:</strong> {vehicle.motTestDate}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={12} sm={4}>
//                     <Typography variant="body1">
//                       <strong>Mileage:</strong> {vehicle.mileage}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={12}>
//                     <Typography variant="body2" color="textSecondary">
//                       Vehicle Health: {healthScore}%
//                     </Typography>
//                     <Tooltip title={`${healthScore}% Vehicle Health`}>
//                       <LinearProgress
//                         variant="determinate"
//                         value={healthScore}
//                         sx={{
//                           mt: 1,
//                           height: 8,
//                           borderRadius: 4,
//                           backgroundColor: '#e0e0e0',
//                           '& .MuiLinearProgress-bar': {
//                             background:
//                               healthScore > 70
//                                 ? 'linear-gradient(90deg, #00703c, #66bb6a)'
//                                 : healthScore > 40
//                                 ? 'linear-gradient(90deg, #f47738, #ffca28)'
//                                 : 'linear-gradient(90deg, #d4351c, #ef5350)',
//                           },
//                         }}
//                       />
//                     </Tooltip>
//                   </Grid>
//                 </Grid>
//               </CardContent>
//             </Card>

//             {/* Grid of Cards */}
//             <Grid container spacing={3} sx={{ flexGrow: 1 }}>
//               {/* Technical Explanation Card */}
//               <Grid item xs={12} md={6}>
//                 <AdvisoryCard
//                   title="Technical Issues"
//                   borderColor={sections.technical.severity === 'Critical' ? '#d4351c' : '#f47738'}
//                   icon={Build}
//                 >
//                   <GovUKHeadingS>Component</GovUKHeadingS>
//                   <GovUKBody>{sections.technical.componentAffected}</GovUKBody>
//                   <GovUKHeadingS>Condition</GovUKHeadingS>
//                   <List dense>
//                     {sections.technical.condition.map((item, index) => (
//                       <ListItem key={index}>
//                         <ListItemText primary={item} />
//                       </ListItem>
//                     ))}
//                   </List>
//                   <GovUKHeadingS>Severity</GovUKHeadingS>
//                   <GovUKBody>{sections.technical.severity}</GovUKBody>
//                 </AdvisoryCard>
//               </Grid>

//               {/* TSB Card */}
//               <Grid item xs={12} md={6}>
//                 <AdvisoryCard
//                   title="Service Bulletin (TSB)"
//                   borderColor="#f47738"
//                   icon={Warning}
//                 >
//                   <GovUKBody>
//                     <strong>ID:</strong> {sections.tsb.id} | <strong>Date:</strong> {sections.tsb.date}
//                   </GovUKBody>
//                   <Box sx={{ p: 1, my: 1, backgroundColor: '#f3f2f1' }}>
//                     <Typography variant="body2">{sections.tsb.description}</Typography>
//                   </Box>
//                   <Typography variant="subtitle2">Repair Steps</Typography>
//                   <List dense>
//                     {sections.tsb.repairRecommendation.map((item, index) => (
//                       <ListItem key={index}>
//                         <ListItemText primary={item} />
//                       </ListItem>
//                     ))}
//                   </List>
//                 </AdvisoryCard>
//               </Grid>

//               {/* Implications Card */}
//               <Grid item xs={12} md={6}>
//                 <AdvisoryCard
//                   title="Buyer Implications"
//                   borderColor="#ffdd00"
//                   icon={Info}
//                 >
//                   <GovUKHeadingS>Current State</GovUKHeadingS>
//                   <GovUKBody>{sections.implications.currentState}</GovUKBody>
//                   <GovUKHeadingS>Future Risk</GovUKHeadingS>
//                   <GovUKBody>{sections.implications.futureRisk}</GovUKBody>
//                   <GovUKHeadingS>Cost Estimate</GovUKHeadingS>
//                   <List dense>
//                     {sections.implications.costEstimate.map((item, index) => (
//                       <ListItem key={index}>
//                         <ListItemText primary={item} />
//                       </ListItem>
//                     ))}
//                   </List>
//                 </AdvisoryCard>
//               </Grid>

//               {/* Practical Advice Card */}
//               <Grid item xs={12} md={6}>
//                 <AdvisoryCard
//                   title="Practical Advice"
//                   borderColor="#00703c"
//                   icon={BuildOutlined}
//                 >
//                   <Grid container spacing={2}>
//                     <Grid item xs={12} sm={6}>
//                       <GovUKHeadingS>Tips</GovUKHeadingS>
//                       <List dense>
//                         {sections.advice.inspectionTips.map((item, index) => (
//                           <ListItem key={index}>
//                             <ListItemText primary={item} />
//                           </ListItem>
//                         ))}
//                       </List>
//                     </Grid>
//                     <Grid item xs={12} sm={6}>
//                       <GovUKHeadingS>Repairs</GovUKHeadingS>
//                       <List dense>
//                         {sections.advice.repairOptions.map((item, index) => (
//                           <ListItem key={index}>
//                             <ListItemText primary={item} />
//                           </ListItem>
//                         ))}
//                       </List>
//                     </Grid>
//                   </Grid>
//                 </AdvisoryCard>
//               </Grid>

//               {/* Recommendation Card */}
//               <Grid item xs={12} md={6}>
//                 <AdvisoryCard
//                   title="Recommendation"
//                   borderColor={healthScore > 50 ? '#00703c' : '#d4351c'}
//                   icon={Star}
//                 >
//                   <GovUKBody>
//                     <strong>Score:</strong> {sections.recommendation.score} |{' '}
//                     <strong>Verdict:</strong> {sections.recommendation.verdict}
//                   </GovUKBody>
//                   <List dense>
//                     {sections.recommendation.prosCons.map((item, index) => (
//                       <ListItem key={index}>
//                         <ListItemText primary={item} />
//                       </ListItem>
//                     ))}
//                   </List>
//                 </AdvisoryCard>
//               </Grid>
//             </Grid>
//           </GovUKGridColumnTwoThirds>
//         </GovUKGridRow>
//       </GovUKMainWrapper>
//     </GovUKContainer>
//   );
// };

// export default MOTAdvisoryBreakdown;