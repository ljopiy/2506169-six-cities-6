import { ParamsDictionary } from 'express-serve-static-core';

export type ParamOfferCity = {
  city: string;
} | ParamsDictionary;
