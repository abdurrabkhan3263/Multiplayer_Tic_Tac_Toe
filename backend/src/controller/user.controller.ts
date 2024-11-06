import expess from "express";
import { ResponseHandler } from "../utils/ResponseHandler";
import redis from "../db/client";
import { AsyncHandler } from "../utils/AsyncHanlder";
import { ApiError } from "../utils/ErrorHandler";
import { v4 as uuid } from "uuid";

export default class UserController {
  // Get user by id

  public getUser = AsyncHandler(async function (
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

  public createUser = AsyncHandler(async function (
    req: expess.Request,
    res: expess.Response
  ) {
    let { userName = "", userId = "" } = req.body;

    if (!userId) {
      userId = uuid();
    }

    if (!userName.trim()) {
      throw new ApiError({ status: 400, message: "Name is required" });
    }

    const user = await redis.set(
      `user:${userId}`,
      JSON.stringify({ userName, tic_tac_toe_high_score: 0 })
    );

    if (user !== "OK") {
      throw new ApiError({ status: 400, message: "Failed to create user" });
    }

    return res.status(200).json(
      new ResponseHandler({
        statusCode: 200,
        message: "User created successfully",
        data: {
          userId,
          userName,
          tic_tac_toe_high_score: 0,
        },
      })
    );
  });

  public updateUser = AsyncHandler(async function (
    req: expess.Request,
    res: expess.Response
  ) {
    const { userId } = req.params;
    const { userName = "" } = req.body;

    if (!userId) {
      throw new ApiError({ status: 400, message: "User id is required" });
    } else if (!userName.trim()) {
      throw new ApiError({ status: 400, message: "Name is required" });
    }

    try {
      const user = await redis.get(`user:${userId}`);

      if (!user) {
        throw new ApiError({ status: 404, message: "User not found" });
      }

      const updatedUserData = {
        ...JSON.parse(user),
        userName,
      };

      console.log("Updated user data:- ", updatedUserData);

      const updateUser = await redis.set(
        `user:${userId}`,
        JSON.stringify(updatedUserData)
      );

      if (updateUser !== "OK") {
        throw new ApiError({ status: 400, message: "Failed to update user" });
      }

      return res.status(200).json(
        new ResponseHandler({
          statusCode: 200,
          message: "User updated successfully",
          data: {
            userId,
            userName,
          },
        })
      );
    } catch (error) {
      throw new ApiError({
        status: 400,
        message:
          error instanceof Error ? error?.message : "Failed to update user",
      });
    }
  });

  public deleteUser = AsyncHandler(async function (_, res: expess.Response) {
    const allUser = await redis.keys("user:*");

    if (!allUser.length) {
      throw new ApiError({ status: 404, message: "User not found" });
    }

    const deleteAllUser = await redis.del(allUser);

    console.log(deleteAllUser);

    return res.status(200).json(
      new ResponseHandler({
        statusCode: 200,
        message: "User deleted successfully",
      })
    );
  });
}
