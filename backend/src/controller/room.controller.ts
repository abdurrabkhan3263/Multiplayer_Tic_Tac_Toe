import ResponseHandler from "../utils/ResponseHandler";
import redis from "../db/client";
import { CreateRoom } from "../types";
import express from "express";
import { AsyncHandler } from "../utils/AsyncHanlder";
import { ApiError } from "../utils/ErrorHandler";
import { v4 as uuidv4 } from "uuid";
import { ROOM_EXPIRES } from "../lib/consts";

export default class RoomController {
  // Create a room

  public createRoom = AsyncHandler(async function (
    req: express.Request,
    res: express.Response
  ) {
    const { name = "", password = "", userId = "" } = req.body as CreateRoom;
    const roomId = uuidv4();

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

    const createHash = await redis.hSet(`room:${roomId}`, {
      name,
      password,
      activeUsers: "",
      creator: userId,
    });

    if (!createHash) {
      throw new ApiError({
        status: 400,
        message: "Failed to create room",
      });
    }

    const roomKey = `rooms:${userId}`;
    const pushIntoRoom = await redis.lPush(roomKey, `room:${roomId}`);

    if (pushIntoRoom) {
      await redis.expire(roomKey, ROOM_EXPIRES);
      await redis.expire(`room:${roomId}`, ROOM_EXPIRES);
    }

    if (!pushIntoRoom) {
      throw new ApiError({
        status: 400,
        message: "Failed to create room",
      });
    }

    const getAddedRoom = await redis.hGetAll(`room:${roomId}`);

    return res.status(200).json(
      new ResponseHandler({
        statusCode: 200,
        message: "Room created successfully",
        data: getAddedRoom,
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
          const roomList = await redis.lRange(room, 0, -1);
          return await Promise.all(
            roomList.map(async (roomId) => await redis.hGetAll(roomId))
          );
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

  public getUserRooms = AsyncHandler(async function (
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

  //   Get room by id

  public getRoomById = AsyncHandler(async function (
    req: express.Request,
    res: express.Response
  ) {
    const { roomId } = req.params;

    const room = await redis.hGetAll(`room:${roomId}`);

    if (Object.keys(room).length === 0 || !room) {
      return res.status(404).json(
        new ResponseHandler({
          statusCode: 404,
          message: "Room not found",
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
