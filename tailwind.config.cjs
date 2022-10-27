// when edit them, have to edit in both this file and tailwind.config.js

const green = "#57B65F";
const blue = "#4E97F3";
const yellow = "#FDAE5B";
const red = "#D2042D";
// white grey and black
const grey0 = "#FFFFFF";
const grey50 = "#F5F0F0";
const grey100 = "#E0E0E0";
const grey200 = "#C2C2C2";
const grey300 = "#8F8F8F";
const grey400 = "#7A7A7A";
const grey500 = "#666666"; // main primary
const grey600 = "#525252";
const grey700 = "#3D3D3D";
const grey800 = "#292929";
const grey850 = "#1F1F1F";
const grey900 = "#121212";

// main
const primaryColor = "#0086ff";

const primaryColor50 = "#ebf5ff";
const primaryColor100 = "#add9ff";
const primaryColor200 = "#85c6ff";
const primaryColor300 = "#5cb3ff";
const primaryColor400 = "#33a0ff";
const primaryColor500 = primaryColor;
const primaryColor600 = "#0078E0";
const primaryColor700 = "#0062B8";
const primaryColor800 = "#004C8F";
const primaryColor850 = "#003555";
const primaryColor900 = "#00213D";

const primaryHoveredColor = "#FEBA72";

const bgColor = grey0;
const primaryTextColor = grey900;
const inactiveGrey = grey200;

// font family
const sansFamily = ["Arial", "sans-serif"];
const serifFamily = ["Arial", "sans-serif"];
const monoFamily = ["Montserrat", "Arial", "sans-serif"];

// font size
const fontSizeXS = "8px";
const fontSizeSM = "10px";
const fontSizeMD = "12px";
const fontSizeLG = "16px";
const fontSizeXL = "20px";
const fontSize2XL = "24px";
const fontSize3XL = "32px";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: sansFamily,
        serif: serifFamily,
        mono: monoFamily,
      },
      fontSize: {
        xs: fontSizeXS,
        sm: fontSizeSM,
        md: fontSizeMD,
        lg: fontSizeLG,
        xl: fontSizeXL,
        "2xl": fontSize2XL,
        "3xl": fontSize3XL,
      },
      colors: {
        grey: {
          "text-primary": primaryTextColor, // text-text-primary
          "bg-color": bgColor, // text-bg-color
          inactive: inactiveGrey,
          0: grey0, // text-grey-0
          50: grey50,
          100: grey100,
          200: grey200,
          300: grey300,
          400: grey400,
          500: grey500,
          600: grey600,
          700: grey700,
          800: grey800,
          850: grey850,
          900: grey900,
        },

        primary: primaryColor,
        primary: {
          50: primaryColor50,
          100: primaryColor100,
          200: primaryColor200,
          300: primaryColor300,
          400: primaryColor400,
          500: primaryColor500,
          600: primaryColor600,
          700: primaryColor700,
          800: primaryColor800,
          850: primaryColor850,
          900: primaryColor900,
          hovered: primaryHoveredColor,
        },

        yellow: yellow,
        action: green,
        red: red,
        green: green,
        blue: blue,
      },
    },
  },
  plugins: [],
};
