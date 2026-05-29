import type { History } from 'history';
import type { AxiosInstance, AxiosError } from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

import type {
  UserAuth,
  Offer,
  Comment,
  CommentAuth,
  FavoriteAuth,
  UserRegister,
  NewOffer,
} from '../types/types';
import { ApiRoute, AppRoute, HttpCode } from '../const';
import { Token } from '../utils';
import {
  adaptComment,
  adaptNewOfferToApi,
  adaptOffer,
  adaptOfferPreview,
  adaptOfferToApiPatch,
  adaptRegisterPayload,
} from '../adapters';

type Extra = {
  api: AxiosInstance;
  history: History;
}

type LoginResponse = {
  email: string;
  token: string;
};

type BackendUser = {
  email: string;
};

type BackendComment = {
  id: string;
  text: string;
  rating: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatarPath: string;
    type: 'ordinary' | 'pro';
  };
};

type BackendOfferPreview = {
  id: string;
  title: string;
  postDate: string;
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: Offer['type'];
  price: number;
  commentsCount: number;
  previewUrl: string;
  city: {
    name: Offer['city']['name'];
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
};

type BackendOffer = BackendOfferPreview & {
  description: string;
  roomsCount: number;
  guestsCount: number;
  conveniences: string[];
  images: string[];
  author: {
    id: string;
    name: string;
    email: string;
    avatarPath: string;
    type: 'ordinary' | 'pro';
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

export const Action = {
  FETCH_OFFERS: 'offers/fetch',
  FETCH_OFFER: 'offer/fetch',
  POST_OFFER: 'offer/post-offer',
  EDIT_OFFER: 'offer/edit-offer',
  DELETE_OFFER: 'offer/delete-offer',
  FETCH_FAVORITE_OFFERS: 'offers/fetch-favorite',
  FETCH_PREMIUM_OFFERS: 'offers/fetch-premium',
  FETCH_COMMENTS: 'offer/fetch-comments',
  POST_COMMENT: 'offer/post-comment',
  POST_FAVORITE: 'offer/post-favorite',
  LOGIN_USER: 'user/login',
  LOGOUT_USER: 'user/logout',
  FETCH_USER_STATUS: 'user/fetch-status',
  REGISTER_USER: 'user/register'
};

export const fetchOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<BackendOfferPreview[]>(ApiRoute.Offers);

    return data.map(adaptOfferPreview);
  });

export const fetchFavoriteOffers = createAsyncThunk<Offer[], undefined, { extra: Extra }>(
  Action.FETCH_FAVORITE_OFFERS,
  async (_, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<BackendOfferPreview[]>(ApiRoute.Favorite);

    return data.map(adaptOfferPreview);
  });

export const fetchOffer = createAsyncThunk<Offer, Offer['id'], { extra: Extra }>(
  Action.FETCH_OFFER,
  async (id, { extra }) => {
    const { api, history } = extra;

    try {
      const { data } = await api.get<BackendOffer>(`${ApiRoute.Offers}/${id}`);

      return adaptOffer(data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NotFound) {
        history.push(AppRoute.NotFound);
      }

      return Promise.reject(error);
    }
  });

export const postOffer = createAsyncThunk<void, NewOffer, { extra: Extra }>(
  Action.POST_OFFER,
  async (newOffer, { extra, dispatch }) => {
    const { api, history } = extra;
    const { data } = await api.post<BackendOffer>(ApiRoute.Offers, adaptNewOfferToApi(newOffer));
    await dispatch(fetchOffers());
    history.push(`${AppRoute.Property}/${data.id}`);
  });

export const editOffer = createAsyncThunk<void, Offer, { extra: Extra }>(
  Action.EDIT_OFFER,
  async (offer, { extra, dispatch }) => {
    const { api, history } = extra;
    const { data } = await api.patch<BackendOffer>(`${ApiRoute.Offers}/${offer.id}`, adaptOfferToApiPatch(offer));
    await dispatch(fetchOffers());
    await dispatch(fetchFavoriteOffers());
    history.push(`${AppRoute.Property}/${data.id}`);
  });

export const deleteOffer = createAsyncThunk<void, string, { extra: Extra }>(
  Action.DELETE_OFFER,
  async (id, { extra, dispatch }) => {
    const { api, history } = extra;
    await api.delete(`${ApiRoute.Offers}/${id}`);
    await dispatch(fetchOffers());
    await dispatch(fetchFavoriteOffers());
    history.push(AppRoute.Root);
  });

export const fetchPremiumOffers = createAsyncThunk<Offer[], string, { extra: Extra }>(
  Action.FETCH_PREMIUM_OFFERS,
  async (cityName, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<BackendOfferPreview[]>(`${ApiRoute.Premium}/${cityName}`);

    return data.map(adaptOfferPreview);
  });

export const fetchComments = createAsyncThunk<Comment[], Offer['id'], { extra: Extra }>(
  Action.FETCH_COMMENTS,
  async (id, { extra }) => {
    const { api } = extra;
    const { data } = await api.get<BackendComment[]>(`${ApiRoute.Comments}/${id}/comments`);

    return data.map(adaptComment);
  });

export const fetchUserStatus = createAsyncThunk<UserAuth['email'], undefined, { extra: Extra }>(
  Action.FETCH_USER_STATUS,
  async (_, { extra }) => {
    const { api } = extra;

    if (!Token.get()) {
      return Promise.reject(new Error('No auth token'));
    }

    try {
      const { data } = await api.get<BackendUser>(ApiRoute.Login);

      return data.email;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        Token.drop();
      }

      return Promise.reject(error);
    }
  });

export const loginUser = createAsyncThunk<UserAuth['email'], UserAuth, { extra: Extra }>(
  Action.LOGIN_USER,
  async ({ email, password }, { extra, dispatch }) => {
    const { api, history } = extra;
    const { data } = await api.post<LoginResponse>(ApiRoute.Login, { email, password });

    Token.save(data.token);
    await dispatch(fetchOffers());
    await dispatch(fetchFavoriteOffers());
    history.push(AppRoute.Root);

    return data.email;
  });

export const logoutUser = createAsyncThunk<void, undefined, { extra: Extra }>(
  Action.LOGOUT_USER,
  async (_, { extra, dispatch }) => {
    const { history } = extra;

    Token.drop();
    await dispatch(fetchOffers());
    history.push(AppRoute.Login);
  });

export const registerUser = createAsyncThunk<void, UserRegister, { extra: Extra }>(
  Action.REGISTER_USER,
  async (payload, { extra }) => {
    const { api, history } = extra;

    if (payload.avatar) {
      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('email', payload.email);
      formData.append('password', payload.password);
      formData.append('type', payload.isPro ? 'pro' : 'ordinary');
      formData.append('avatar', payload.avatar);

      await api.post(ApiRoute.Register, formData);
    } else {
      await api.post(ApiRoute.Register, adaptRegisterPayload(payload));
    }

    history.push(AppRoute.Login);
  });

export const postComment = createAsyncThunk<Comment[], CommentAuth, { extra: Extra }>(
  Action.POST_COMMENT,
  async ({ id, comment, rating }, { extra }) => {
    const { api } = extra;
    await api.post<BackendComment>(`${ApiRoute.Comments}/${id}/comments`, { text: comment, rating });
    const { data } = await api.get<BackendComment[]>(`${ApiRoute.Comments}/${id}/comments`);

    return data.map(adaptComment);
  });

export const postFavorite = createAsyncThunk<Offer, FavoriteAuth, { extra: Extra }>(
  Action.POST_FAVORITE,
  async ({ id, status }, { extra }) => {
    const { api, history } = extra;

    try {
      const response = status === 1
        ? await api.post<BackendOffer>(`${ApiRoute.Favorite}/${id}`)
        : await api.delete<BackendOffer>(`${ApiRoute.Favorite}/${id}`);

      return adaptOffer(response.data);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === HttpCode.NoAuth) {
        history.push(AppRoute.Login);
      }

      return Promise.reject(error);
    }
  });