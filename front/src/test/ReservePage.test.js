import React from 'react';
import { render, screen } from '@testing-library/react';
import ReservePage from '../pages/ReservePage';
import { BrowserRouter } from 'react-router-dom';

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { buildings: [] } })),
}));

beforeEach(() => {
  localStorage.setItem('favorites', JSON.stringify(['Dasan Hall']));
});

test('Make sure your favorite building is displayed at the top', async () => {
  render(
    <BrowserRouter>
      <ReservePage />
    </BrowserRouter>
  );

  const title = await screen.findByText(/Favorite Classrooms/i);
  expect(title).toBeInTheDocument();
});