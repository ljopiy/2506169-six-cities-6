import { Request } from 'express';
import { RequestBody, RequestParams } from '../../../libs/rest/index.js';

export type GetCommentsRequest = Request<RequestParams, RequestBody>;
