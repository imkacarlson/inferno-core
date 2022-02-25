import React, { FC, useEffect } from 'react';
import useStyles from './styles';
import {
  Box,
  Container,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  Tooltip,
  Badge,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { RunnableType, Test, Request } from 'models/testSuiteModels';
import TabPanel from './TabPanel';
import MessagesList from './MessagesList';
import RequestsList from './RequestsList';
import ResultIcon from '../ResultIcon';
import PublicIcon from '@mui/icons-material/Public';
import MailIcon from '@mui/icons-material/Mail';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactMarkdown from 'react-markdown';
import TestRunButton from '../../TestRunButton/TestRunButton';

interface TestListItemProps {
  test: Test;
  runTests?: (runnableType: RunnableType, runnableId: string) => void;
  updateRequest?: (requestId: string, resultId: string, request: Request) => void;
  testRunInProgress: boolean;
  view: 'report' | 'run';
}

const TestListItem: FC<TestListItemProps> = ({
  test,
  runTests,
  updateRequest,
  testRunInProgress,
  view,
}) => {
  const styles = useStyles();
  const openCondition =
    (test.result?.result === 'fail' || test.result?.result === 'error') && view !== 'report';
  const [open, setOpen] = React.useState(openCondition);
  const [panelIndex, setPanelIndex] = React.useState(0);

  useEffect(() => {
    if (openCondition) setOpen(true);
  }, [test.result]);

  const resultIcon = test.result && (
    <Box className={styles.testIcon}>
      <ResultIcon result={test.result} />
    </Box>
  );

  const testLabel = (
    <>
      {test.short_id && <Typography className={styles.shortId}>{test.short_id}</Typography>}
      {test.optional && <Typography className={styles.optionalLabel}>Optional</Typography>}
      <Typography className={styles.labelText}>{test.title}</Typography>
    </>
  );

  const testText = (
    <ListItemText
      primary={testLabel}
      secondary={
        test.result?.result_message && (
          <ReactMarkdown className={styles.resultMessageMarkdown}>
            {test.result.result_message}
          </ReactMarkdown>
        )
      }
    />
  );

  const messagesBadge = view === 'run' &&
    test.result?.messages &&
    test.result.messages.length > 0 && (
      <IconButton
        aria-label="open messages"
        className={styles.badgeIcon}
        onClick={(e) => {
          e.stopPropagation();
          setPanelIndex(0);
          setOpen(true);
        }}
      >
        <Badge badgeContent={test.result.messages.length} classes={{ badge: styles.testBadge }}>
          <Tooltip title={`${test.result.messages.length} message(s)`}>
            <MailIcon color="secondary" />
          </Tooltip>
        </Badge>
      </IconButton>
    );

  const requestsBadge = test.result?.requests && test.result.requests.length > 0 && (
    <IconButton
      disabled={view === 'report'}
      aria-label="open requests"
      className={styles.badgeIcon}
      onClick={(e) => {
        e.stopPropagation();
        setPanelIndex(1);
        setOpen(true);
      }}
    >
      <Badge badgeContent={test.result.requests.length} classes={{ badge: styles.testBadge }}>
        <Tooltip title={`${test.result.requests.length} request(s)`}>
          <PublicIcon color="secondary" />
        </Tooltip>
      </Badge>
    </IconButton>
  );

  const testRunButton = view === 'run' && runTests && (
    <Box onClick={(e) => e.stopPropagation()}>
      <TestRunButton
        runnable={test}
        runnableType={RunnableType.Test}
        runTests={runTests}
        testRunInProgress={testRunInProgress}
      />
    </Box>
  );

  const testDescription = (
    <ReactMarkdown>
      {test.description && test.description.length > 0 ? test.description : 'No description'}
    </ReactMarkdown>
  );

  return (
    <>
      <Accordion
        disableGutters
        className={styles.accordion}
        sx={view === 'report' ? { 'pointer-events': 'none' } : {}}
        expanded={open}
        TransitionProps={{ unmountOnExit: true }}
        onClick={() => setOpen(!open)}
      >
        <AccordionSummary
          aria-controls={`${test.title}-header`}
          id={`${test.title}-header`}
          expandIcon={view === 'run' && <ExpandMoreIcon />}
        >
          <ListItem className={styles.testCardList}>
            {resultIcon}
            {testText}
            {messagesBadge}
            {requestsBadge}
            {testRunButton}
          </ListItem>
        </AccordionSummary>
        <Divider />
        <AccordionDetails
          className={styles.accordionDetailContainer}
          onClick={(e) => e.stopPropagation()}
        >
          <Tabs
            value={panelIndex}
            className={styles.tabs}
            onChange={(e, newIndex) => {
              setPanelIndex(newIndex);
            }}
            variant="fullWidth"
          >
            <Tab label="Messages" />
            <Tab label="HTTP Requests" />
            <Tab label="About" />
          </Tabs>
          <Divider />
          <TabPanel currentPanelIndex={panelIndex} index={0}>
            <MessagesList messages={test.result?.messages || []} />
          </TabPanel>
          <TabPanel currentPanelIndex={panelIndex} index={1}>
            {updateRequest && (
              <RequestsList
                requests={test.result?.requests || []}
                resultId={test.result?.id || ''}
                updateRequest={updateRequest}
              />
            )}
          </TabPanel>
          <TabPanel currentPanelIndex={panelIndex} index={2}>
            <Container>
              <Typography variant="subtitle2">{testDescription}</Typography>
            </Container>
            <Divider />
          </TabPanel>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default TestListItem;
