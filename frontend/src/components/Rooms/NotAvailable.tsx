import React from "react";

function NotAvailable() {
  return (
    <>
      <img
        src="/icons/not-available.svg"
        alt="Not Available"
        className="mx-auto w-20"
      />
      <div className="p-2 text-center text-sm font-semibold">
        No room available
      </div>
    </>
  );
}

export default NotAvailable;
