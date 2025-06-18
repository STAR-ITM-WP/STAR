import React from 'react';
import { render, screen } from '@testing-library/react';
import RoomDetailPage from '../pages/RoomDetailPage';
import { BrowserRouter } from 'react-router-dom';

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({
    data: {
      availability: {
        Mon: {
          'Period 0': { status: 'unavailable', subject: 'Math' },
        },
      },
    },
  })),
}));

test('Unavailable cells are marked with unbookable', async () => {
  render(
    <BrowserRouter>
      <RoomDetailPage />
    </BrowserRouter>
  );

  const cell = await screen.findByText(/📘 Math/i);
  expect(cell).toHaveClass('unavailable');
});