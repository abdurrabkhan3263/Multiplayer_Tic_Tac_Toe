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
    const { name = "", password = "", userId = "" } = req.body as CreateRoom;

    if (!name.trim() || !password.trim()) {
      throw new ApiError({
        status: 400,
        message: "Name and password is required",
      });
    }

    if (!userId.trim()) {
      throw new ApiError({
        status: 400,
        message: "User id is required",
      });
    }

    const roomKey = `rooms:${userId}`;
    const pushIntoRoom = await redis.lPush(
      roomKey,
      JSON.stringify({ name, password })
    );

    console.log(pushIntoRoom);

    if (pushIntoRoom) {
      await redis.expire(roomKey, 60 * 10); //  10 minutes
    }

    const getAddedRoom = await redis.lIndex(roomKey, 0);

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
        data: JSON.parse(getAddedRoom || "{}"),
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

    const allRooms = (
      await Promise.all(
        rooms.map(async (room) => {
          const roomData = await redis.lRange(room, 0, -1);
          return roomData.map((data) => JSON.parse(data));
        })
      )
    ).flat();

    return res.status(200).json(
      new ResponseHandler({
        statusCode: 200,
        data: allRooms,
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
        data: room.map((data) => JSON.parse(data)),
        message: "Room fetched successfully",
      })
    );
  });
}
