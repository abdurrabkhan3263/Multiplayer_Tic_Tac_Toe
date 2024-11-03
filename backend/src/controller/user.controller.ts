import expess from "express";
import { ResponseHandler } from "../utils/ResponseHandler";
import redis from "../db/client";
import { AsyncHandler } from "../utils/AsyncHanlder";
import { ApiError } from "../utils/ErrorHandler";
import { v4 as uuid } from "uuid";

export class UserController {
  // Get user by id

  static getUser = AsyncHandler(async function (
    req: expess.Request,
    res: expess.Response
  ) {
    const { userId } = req.params;

    if (!userId) {
      throw new ApiError({ status: 400, message: "User id is required" });
    }

    const user = await redis.get(`user:${userId}`);

    if (!user) {
      throw new ApiError({ status: 404, message: "User not found" });
    }

    return res.status(200).json(
      new ResponseHandler({
        statusCode: 200,
        message: "User is found successfully",
        data: JSON.parse(user),
      })
    );
  });

  //   Create user

  static createUser = AsyncHandler(async function (
    req: expess.Request,
    res: expess.Response
  ) {
    const { name } = req.params;
    const userId = uuid();

    if (!name.trim()) {
      throw new ApiError({ status: 400, message: "Name is required" });
    }

    const user = await redis.set(
      `user:${userId}`,
      JSON.stringify({ name, tic_tac_toe_high_score: 0 })
    );

    if (!user) {
      throw new ApiError({ status: 400, message: "Failed to create user" });
    }

    return res.status(200).json(
      new ResponseHandler({
        statusCode: 200,
        message: "User created successfully",
        data: JSON.parse(user),
      })
    );
  });
}
