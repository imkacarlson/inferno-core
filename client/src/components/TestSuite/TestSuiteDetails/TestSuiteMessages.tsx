import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { Alert, Box, Card, Collapse, Typography, ListItem, styled } from '@mui/material';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Message, ViewType } from 'models/testSuiteModels';
import useStyles from './styles';
import ReactMarkdown from 'react-markdown';

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { expand, ...other } = props;
  return <IconButton disableRipple {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  padding: 0,
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

interface TestSuiteMessageProps {
  message: Message;
  view: ViewType;
  testSuiteId?: string;
}

const TestSuiteMessage: FC<TestSuiteMessageProps> = ({ message, testSuiteId, view }) => {
  const styles = useStyles();
  const history = useHistory();
  const [expanded, setExpanded] = React.useState<boolean>(false);

  const handleExpandClick = () => {
    if (view === 'config') {
      setExpanded(!expanded);
    } else {
      history.push(`${history.location.pathname}#${testSuiteId || ''}/config`);
    }
  };

  return (
    <>
      <Box className={styles.alertCursor}>
        <Alert
          severity={message.type}
          variant={view === 'config' ? 'standard' : 'filled'}
          onClick={handleExpandClick}
          className={styles.alert}
        >
          <Box sx={{ display: 'flex' }}>
            <Box className={styles.alertMessage}>{message.message}</Box>
            {view === 'config' && (
              <ExpandMore
                expand={expanded}
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
              >
                <ExpandMoreIcon />
              </ExpandMore>
            )}
          </Box>
        </Alert>
      </Box>
      <Collapse in={expanded} unmountOnExit sx={{ mb: '8px' }}>
        <Card variant="outlined">
          <ListItem>
            <ReactMarkdown>{message.message}</ReactMarkdown>
          </ListItem>
        </Card>
      </Collapse>
    </>
  );
};

interface TestSuiteMessagesProps {
  messages: Message[];
  view: ViewType;
  testSuiteId?: string;
}

const TestSuiteMessages: FC<TestSuiteMessagesProps> = ({ messages, view, testSuiteId }) => {
  const errorMessages = messages.filter((message) => message.type === 'error');
  const warningMessages = messages.filter((message) => message.type === 'warning');
  const infoMessages = messages.filter((message) => message.type === 'info');
  const sortedMessages = [...errorMessages, ...warningMessages, ...infoMessages];

  if (sortedMessages.length < 1 && view === 'config') {
    return <Typography variant="body2">No Messages</Typography>;
  } else {
    return (
      <>
        {sortedMessages.map((message, index) => (
          <TestSuiteMessage message={message} view={view} testSuiteId={testSuiteId} key={index} />
        ))}
      </>
    );
  }
};

export default TestSuiteMessages;
