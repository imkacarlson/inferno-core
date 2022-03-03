import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  TextField,
} from '@mui/material';
import { OAuthCredentials, RunnableType, TestInput } from 'models/testSuiteModels';
import React, { FC, useEffect } from 'react';
import InputRadioGroup from './InputsRadioGroup';
import ReactMarkdown from 'react-markdown';
import InputTextArea from './InputTextArea';
import InputTextField from './InputTextField';
import InputOAuthCredentials from './InputOAuthCredentials';

export interface InputsModalProps {
  runnableType: RunnableType;
  runnableId: string;
  title: string;
  inputInstructions?: string;
  inputs: TestInput[];
  modalVisible: boolean;
  hideModal: () => void;
  createTestRun: (runnableType: RunnableType, runnableId: string, inputs: TestInput[]) => void;
}

function runnableTypeReadable(runnableType: RunnableType) {
  switch (runnableType) {
    case RunnableType.TestSuite:
      return 'test suite';
    case RunnableType.TestGroup:
      return 'test group';
    case RunnableType.Test:
      return 'test';
  }
}

const InputsModal: FC<InputsModalProps> = ({
  runnableType,
  runnableId,
  title,
  inputInstructions,
  inputs,
  modalVisible,
  hideModal,
  createTestRun,
}) => {
  const [inputsMap, setInputsMap] = React.useState<Map<string, unknown>>(new Map());
  const missingRequiredInput = inputs.some((input: TestInput) => {
    let oAuthMissingRequiredInput = false;
    try {
      // if input has OAuth, check if required values are filled
      const oAuthJSON = JSON.parse(inputsMap.get(input.name) as string) as OAuthCredentials;
      const accessTokenIsEmpty = oAuthJSON.access_token === '';
      const refreshIsEmpty =
        oAuthJSON.refresh_token !== '' &&
        (oAuthJSON.token_url === '' || oAuthJSON.client_id === '');
      oAuthMissingRequiredInput = (accessTokenIsEmpty && !input.optional) || refreshIsEmpty;
    } catch (e) {
      // if JSON.parse fails, then assume field is not OAuth and move on
    }
    if (input.type === 'radio') return false; // radio inputs will always be required and have a default value
    return (!input.optional && !inputsMap.get(input.name)) || oAuthMissingRequiredInput;
  });
  const [disable, setDisable] = React.useState<boolean>(false);
  const [input, setInput] = React.useState<string>(title);

  function submitClicked(): void {
    const inputs_with_values: TestInput[] = [];
    inputsMap.forEach((input_value, input_name) => {
      inputs_with_values.push({ name: input_name, value: input_value, type: 'text' });
    });
    createTestRun(runnableType, runnableId, inputs_with_values);
    hideModal();
  }

  useEffect(() => {
    inputsMap.clear();
    inputs.forEach((requirement: TestInput) => {
      inputsMap.set(requirement.name, requirement.value || (requirement.default as string) || '');
    });
    setInputsMap(new Map(inputsMap));
  }, [inputs]);

  const instructions =
    inputInstructions ||
    `Please fill out required fields in order to run the ${runnableTypeReadable(runnableType)}.`;

  const inputFields = inputs.map((requirement: TestInput, index: number) => {
    switch (requirement.type) {
      case 'oauth_credentials':
        return (
          <InputOAuthCredentials
            requirement={requirement}
            index={index}
            inputsMap={inputsMap}
            setInputsMap={setInputsMap}
            key={`input-${index}`}
          />
        );
      case 'textarea':
        return (
          <InputTextArea
            requirement={requirement}
            index={index}
            inputsMap={inputsMap}
            setInputsMap={setInputsMap}
            key={`input-${index}`}
          />
        );
      case 'radio':
        return (
          <InputRadioGroup
            requirement={requirement}
            index={index}
            inputsMap={inputsMap}
            setInputsMap={setInputsMap}
            key={`input-${index}`}
          />
        );
      default:
        return (
          <InputTextField
            requirement={requirement}
            index={index}
            inputsMap={inputsMap}
            setInputsMap={setInputsMap}
            key={`input-${index}`}
          />
        );
    }
  });

  return (
    <Dialog open={modalVisible} onClose={hideModal} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <ReactMarkdown>{instructions}</ReactMarkdown>
        </DialogContentText>
        <List>{inputFields}</List>
        <TextField
          value={input}
          multiline
          rows={10}
          onChange={(e) => {
            console.log(disable);
            setDisable(!disable);
            setInput(e.target.value);
            console.log(disable);
          }}
        ></TextField>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={hideModal} data-testid="cancel-button">
          Cancel
        </Button>
        <Button
          onClick={submitClicked}
          // disabled={missingRequiredInput}
          disabled={disable}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InputsModal;
