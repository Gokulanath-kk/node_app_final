import React from "react";
import DataScience from "../../Asserts/Image/logo/Data Science.svg";
import Digitalmarketing from "../../Asserts/Image/logo/Digital marketing.svg";
import EthicalHacking from "../../Asserts/Image/logo/Ethical Hacking.svg";
import Frame from "../../Asserts/Image/logo/Web Development.svg";
import IOT from "../../Asserts/Image/logo/IOT.svg";
import Machinelearning from "../../Asserts/Image/logo/Machine learning.svg";
import ai from "../../Asserts/Image/logo/AI.svg";
import amazonwebservices from "../../Asserts/Image/logo/AWS.svg";
import android from "../../Asserts/Image/logo/Android app development.svg";
import java from "../../Asserts/Image/logo/full stack java.svg";
import networking from "../../Asserts/Image/logo/Networking.svg";
import php from "../../Asserts/Image/logo/PHP.svg";
import python from "../../Asserts/Image/logo/python.svg";

const logos = [
  DataScience,
  Digitalmarketing,
  EthicalHacking,
  Frame,
  IOT,
  Machinelearning,
  ai,
  amazonwebservices,
  android,
  java,
  networking,
  php,
  python,
];

const HeroStrip = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-t from-pink-300 to-purple-500 py-6">
      {/* Scrolling content */}
      <div className="flex space-x-10 animate-marquee">
        {logos.map((logo, index) => (
          
            <img src={logo} alt="logo"   key={index} className="w-20   object-contain" />
          
        ))}

        {/* Repeat the logos for seamless scrolling */}
        {logos.map((logo, index) => (
         
            <img src={logo} alt="logo" key={`repeat-${index}`} className="w-20 object-contain" />
          
        ))}
      </div>
    </div>
  );
};

export default HeroStrip;
