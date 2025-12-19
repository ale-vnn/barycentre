// Application state management

export const state = {
  participants: [],
  bars: [],
  map: null,
  markers: {
    participants: [],
    bars: []
  },
  routeLayer: null,
  transportMode: 'driving',
  establishmentTypes: ['bar', 'pub'],
  displayLimit: 5
};

export function getState() {
  return state;
}
