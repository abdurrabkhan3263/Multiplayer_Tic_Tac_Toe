import React from "react";
import { useParams } from "react-router-dom";

function Play() {
  const { roomId } = useParams();

  return (
    <div className="home_menu">
      <div
        className="home_menu_card flex flex-col"
        style={{ backgroundImage: "url(/bg_menu.jpg)" }}
      ></div>
    </div>
  );
}

export default Play;
