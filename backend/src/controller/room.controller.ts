import ResponseHandler from "../utils/ResponseHandler";
import redis from "../db/client";
import { CreateRoom } from "../types";
import express from "express";
import { AsyncHandler } from "../utils/AsyncHanlder";
import { ApiError } from "../utils/ErrorHandler";

export default class RoomController {
  // Create a room

  public createRoom = AsyncHandler(async function (
    req: express.Request,
    res: express.Response
  ) {
    const { name, password, userId } = req.body as CreateRoom;

    if (!name.trim() || !password.trim()) {
      throw new ApiError({
        status: 400,
        message: "Name and password is required",
      });
    }

    const roomKey = `rooms:${userId}`;
    const pushIntoRoom = await redis.lPush(
      roomKey,
      JSON.stringify({ name, password })
    );

    if (pushIntoRoom) {
      await redis.expire(roomKey, 60 * 10); //  10 minutes
    }

    if (!pushIntoRoom) {
      throw new ApiError({
        status: 400,
        message: "Failed to create room",
      });
    }

    return res.status(200).json(
      new ResponseHandler({
        statusCode: 200,
        message: "Room created successfully",
      })
    );
  });

  //   Get all rooms

  public getAllRooms = AsyncHandler(async function (
    req: express.Request,
    res: express.Response
  ) {
    const rooms = await redis.KEYS("rooms:*");

    if (!rooms) {
      return res.status(400).json(
        new ResponseHandler({
          statusCode: 400,
          message: "Failed to get rooms",
        })
      );
    }

    return res.status(200).json(
      new ResponseHandler({
        statusCode: 200,
        data: rooms,
        message: "Rooms fetched successfully",
      })
    );
  });

  //   Get room by name

  public getRoomByName = AsyncHandler(async function (
    req: express.Request,
    res: express.Response
  ) {
    const { userId } = req.params;
    const roomKey = `rooms:${userId}`;

    const room = await redis.lRange(roomKey, 0, -1);

    if (!room) {
      return res.status(400).json(
        new ResponseHandler({
          statusCode: 400,
          message: "Failed to get room",
        })
      );
    }

    return res.status(200).json(
      new ResponseHandler({
        statusCode: 200,
        data: room,
        message: "Room fetched successfully",
      })
    );
  });
}
