import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestGroup, Test, RunnableType } from 'models/testSuiteModels';
import TestSuiteTree, { TestSuiteTreeProps } from '../TestSuiteTree';

const setSelectedRunnableMock = jest.fn();
const runTestsMock = jest.fn();

const test1: Test = {
  id: 'test1',
  title: 'FHIR server makes SMART configuration available from well-known endpoint',
  inputs: [],
  outputs: [],
};
const test2: Test = {
  id: 'test2',
  title: 'Well-known configuration contains required fields',
  inputs: [],
  outputs: [],
};
const test3: Test = {
  id: 'test3',
  title: 'Client registration endpoint secured by transport layer security',
  inputs: [],
  outputs: [],
};
const test4: Test = {
  id: 'test4',
  title: 'Client registration endpoint accepts POST messages',
  inputs: [],
  outputs: [],
};

const testList1 = [test1, test2];
const testList2 = [test3, test4];

const sequence1: TestGroup = {
  tests: testList1,
  test_groups: [],
  title: 'SMART on FHIR Discovery',
  id: 'group0',
  inputs: [{ name: 'test input' }],
  outputs: [],
};

const sequence2: TestGroup = {
  tests: testList2,
  test_groups: [],
  title: 'Dynamic Registration',
  id: 'group1',
  inputs: [{ name: 'second input' }],
  outputs: [],
};

const nestedGroup: TestGroup = {
  tests: [],
  test_groups: [],
  title: 'nested group',
  id: 'group2',
  inputs: [],
  outputs: [],
};

const parentGroup: TestGroup = {
  tests: [],
  test_groups: [nestedGroup],
  title: 'i have a nested group',
  id: 'group3',
  inputs: [],
  outputs: [],
};

const testSuiteTreeProps: TestSuiteTreeProps = {
  title: 'DemonstrationSuite',
  id: 'example suite',
  test_groups: [sequence1, sequence2, parentGroup],
  setSelectedRunnable: setSelectedRunnableMock,
  runTests: runTestsMock,
  selectedRunnable: 'example suite',
};

test('Test tree renders', () => {
  render(<TestSuiteTree {...testSuiteTreeProps}></TestSuiteTree>);
  const treeTitle = screen.getByText(testSuiteTreeProps.title);
  expect(treeTitle).toBeVisible();
  const sequence1Title = screen.getByText(sequence1.title);
  expect(sequence1Title).toBeVisible();
  const sequence2Title = screen.getByText(sequence2.title);
  expect(sequence2Title).toBeVisible();
  const parentGroupTitle = screen.getByText(parentGroup.title);
  expect(parentGroupTitle).toBeVisible();
  const nestedGroupTitle = screen.getByText(nestedGroup.title);
  expect(nestedGroupTitle).toBeVisible();
});

test('Individual tests are not shown by default', () => {
  render(<TestSuiteTree {...testSuiteTreeProps}></TestSuiteTree>);
  sequence1.tests.forEach((test) => {
    const testTitle = screen.queryByText(test.title);
    expect(testTitle).toBeNull();
  });
});

test('Calls setSelectedRunnable when tree item is clicked', () => {
  render(<TestSuiteTree {...testSuiteTreeProps}></TestSuiteTree>);
  const testSuiteLabel = screen.getByTestId(`tiLabel-${testSuiteTreeProps.id}`);
  fireEvent.click(testSuiteLabel);
  expect(setSelectedRunnableMock).toHaveBeenCalled();
});

test('Calls runTests when run button is clicked', () => {
  render(<TestSuiteTree {...testSuiteTreeProps}></TestSuiteTree>);
  const suiteRunButton = screen.getByTestId(`runButton-${testSuiteTreeProps.id}`);
  fireEvent.click(suiteRunButton);
  expect(runTestsMock).toHaveBeenCalledWith(RunnableType.TestSuite, testSuiteTreeProps.id);

  const groupRunButton = screen.getByTestId(`runButton-${sequence1.id}`);
  fireEvent.click(groupRunButton);
  expect(runTestsMock).toHaveBeenCalledWith(RunnableType.TestGroup, sequence1.id);
});