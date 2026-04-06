import { City, CityName } from '../types/index.js';

export const Cities: Record<CityName, City> = {
  [CityName.Moscow]: {
    name: CityName.Moscow,
    latitude: 55.7558,
    longitude: 37.6176
  },
  [CityName.SaintPetersburg]: {
    name: CityName.SaintPetersburg,
    latitude: 59.9343,
    longitude: 30.3351
  },
  [CityName.Kazan]: {
    name: CityName.Kazan,
    latitude: 55.7887,
    longitude: 49.1221
  },
  [CityName.Sochi]: {
    name: CityName.Sochi,
    latitude: 43.5855,
    longitude: 39.7231
  },
  [CityName.Yekaterinburg]: {
    name: CityName.Yekaterinburg,
    latitude: 56.8389,
    longitude: 60.6057
  },
  [CityName.NizhnyNovgorod]: {
    name: CityName.NizhnyNovgorod,
    latitude: 56.2965,
    longitude: 43.9361
  }
};
