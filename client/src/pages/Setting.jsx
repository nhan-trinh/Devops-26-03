import React from "react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Loader from "../components/fun/Car";
import Loader2 from "../components/fun/Truck";

const Setting = () => {
  return (
    <>
      <LanguageSwitcher />
      <div className="flex mb-1">
        <Loader2 />
      </div>
      <div
        className="flex items-center justify-center 
      "
      >
        <Loader />
      </div>
    </>
  );
};

export default Setting;
