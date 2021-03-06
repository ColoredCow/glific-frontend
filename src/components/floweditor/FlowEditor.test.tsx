import React from 'react';
import { mount } from 'enzyme';
import { FlowEditor } from './FlowEditor';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { wait } from '@testing-library/react';
import { getAutomationNameQuery } from '../../mocks/Automation';

const mocks = [getAutomationNameQuery];
const wrapper = mount(
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <FlowEditor match={{ params: { uuid: 'b050c652-65b5-4ccf-b62b-1e8b3f328676' } }} />
    </MemoryRouter>
  </MockedProvider>
);

test('it should display the flowEditor', () => {
  expect(wrapper.find('#flow').exists()).toBe(true);
});

test('it should have a done button that redirects to automation page', async () => {
  await wait();
  expect(wrapper.find('[data-testid="button"]').exists()).toBe(true);
});

test('it should display name of the automation', async () => {
  await wait();
  expect(wrapper.find('[data-testid="automationName"]').text()).toBe('help workflow');
});

test('it should have a help button that redirects to help page', () => {
  expect(wrapper.find('[data-testid="helpButton"]').exists()).toBe(true);
  wrapper.unmount();
});
