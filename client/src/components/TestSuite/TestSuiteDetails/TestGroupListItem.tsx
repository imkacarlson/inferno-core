import React, { FC } from 'react';
import useStyles from './styles';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import InputOutputsList from './TestListItem/InputOutputsList';
import { Request, RunnableType, Test, TestGroup, ViewType } from 'models/testSuiteModels';
import ResultIcon from './ResultIcon';
import TestRunButton from '../TestRunButton/TestRunButton';
import TestListItem from './TestListItem/TestListItem';
import ReactMarkdown from 'react-markdown';
import theme from '../../../styles/theme';

interface TestGroupListItemProps {
  testGroup: TestGroup;
  runTests?: (runnableType: RunnableType, runnableId: string) => void;
  updateRequest?: (requestId: string, resultId: string, request: Request) => void;
  testRunInProgress: boolean;
  view: ViewType;
}

const TestGroupListItem: FC<TestGroupListItemProps> = ({
  testGroup,
  runTests,
  updateRequest,
  testRunInProgress,
  view,
}) => {
  const styles = useStyles();
  const openCondition =
    testGroup.result?.result === 'fail' ||
    testGroup.result?.result === 'error' ||
    view === 'report';

  const renderGroupListItems = (): JSX.Element[] => {
    return testGroup.test_groups.map((tg: TestGroup) => (
      <TestGroupListItem
        key={`li-${tg.id}`}
        testGroup={tg}
        runTests={runTests}
        updateRequest={updateRequest}
        testRunInProgress={testRunInProgress}
        view={view}
      />
    ));
  };

  const renderTestListItems = (): JSX.Element[] => {
    return testGroup.tests.map((test: Test) => (
      <TestListItem
        key={`li-${test.id}`}
        test={test}
        runTests={runTests}
        updateRequest={updateRequest}
        testRunInProgress={testRunInProgress}
        view={view}
      />
    ));
  };

  const nestedDescriptionPanel = (
    <Box className={styles.nestedDescriptionContainer}>
      <Accordion
        disableGutters
        key={`${testGroup.id}-description`}
        className={styles.accordion}
        TransitionProps={{ unmountOnExit: true }}
      >
        <AccordionSummary
          aria-controls={`${testGroup.title}-description-panel`}
          expandIcon={<ExpandMoreIcon sx={{ padding: '0 5px' }} />}
        >
          <ListItem className={styles.testGroupCardList}>
            <ListItemText
              primary={
                <Typography className={styles.nestedDescriptionHeader}>
                  About {testGroup.short_title || testGroup.title}
                </Typography>
              }
            />
          </ListItem>
        </AccordionSummary>
        <Divider />
        <AccordionDetails
          id={`${testGroup.title}-description-panel`}
          className={styles.accordionDetailContainer}
        >
          <ReactMarkdown className={`${styles.accordionDetail} ${styles.nestedDescription}`}>
            {testGroup.description as string}
          </ReactMarkdown>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  const expandedGroupListItem = (
    <Accordion
      disableGutters
      className={styles.accordion}
      sx={view === 'report' ? { pointerEvents: 'none' } : {}}
      defaultExpanded={openCondition}
      TransitionProps={{ unmountOnExit: true }}
    >
      <AccordionSummary
        aria-controls={`${testGroup.title}-panel`}
        expandIcon={view === 'run' && <ExpandMoreIcon />}
      >
        <ListItem className={styles.testGroupCardList}>
          <Box className={styles.testIcon}>{<ResultIcon result={testGroup.result} />}</Box>
          <ListItemText
            primary={
              <>
                {testGroup.short_id && (
                  <Typography className={styles.shortId}>{testGroup.short_id}</Typography>
                )}
                {testGroup.title}
              </>
            }
            secondary={testGroup.result?.result_message}
          />
          {view === 'run' && runTests && (
            <TestRunButton
              runnable={testGroup}
              runnableType={RunnableType.TestGroup}
              runTests={runTests}
              testRunInProgress={testRunInProgress}
            />
          )}
        </ListItem>
      </AccordionSummary>
      <Divider />
      {view === 'report' && testGroup.run_as_group && testGroup.user_runnable && testGroup.result && (
        <Box>
          <InputOutputsList headerName="Input" inputOutputs={testGroup.result?.inputs || []} />
        </Box>
      )}
      <AccordionDetails id={`${testGroup.title}-panel`} className={styles.accordionDetailContainer}>
        {testGroup.description && view == 'run' && nestedDescriptionPanel}
        <List className={styles.accordionDetail}>
          {'test_groups' in testGroup && renderGroupListItems()}
          {'tests' in testGroup && renderTestListItems()}
        </List>
      </AccordionDetails>
    </Accordion>
  );

  const navigableGroupListItem = (
    <>
      <ListItem>
        <Box className={styles.testIcon}>
          {testGroup.run_as_group ? (
            <ResultIcon result={testGroup.result} />
          ) : (
            <FolderIcon sx={{ color: theme.palette.common.grayLight }} />
          )}
        </Box>
        <ListItemText
          primary={
            <>
              {testGroup.short_id && (
                <Typography className={styles.shortId}>{testGroup.short_id}</Typography>
              )}
              <Link color="inherit" href={`${location.pathname}#${testGroup.id}`} underline="hover">
                {testGroup.title}
              </Link>
            </>
          }
          secondary={testGroup.result?.result_message}
        />
      </ListItem>
      <Divider />
    </>
  );

  return (
    <>{testGroup.expanded || view === 'report' ? expandedGroupListItem : navigableGroupListItem}</>
  );
};

export default TestGroupListItem;
