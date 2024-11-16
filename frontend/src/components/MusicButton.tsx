import React from "react";
import { Button } from "./ui/button";

function MusicButton() {
  return (
    <Button variant={"roundedBtn"} size={"roundedBtn"}>
      <img src="/icons/sound-on.svg" alt="sound-on" />
    </Button>
  );
}

export default MusicButton;
