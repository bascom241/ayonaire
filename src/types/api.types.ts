import { Request , Response} from "express";
import { AnyAaaaRecord } from "node:dns";

export interface TypedRequestBody<T> extends Request {
    body:T 
}

export interface TypedResponseBody<T> extends Response {
    body: T
}
export type TypedAllRequest<P = {}, B = {}, Q = {}> =
  Request<P, any, B, Q>;