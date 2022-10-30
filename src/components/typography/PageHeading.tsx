interface Props {
  heading: string;
  fontSize: string;
  fontStyle: string;
  fontColour: string;
  extraClass: string;
}

const PageHeading = ({
  heading,
  fontSize,
  fontStyle,
  fontColour,
  extraClass,
}: Props) => (
  <h1 className={`${fontSize} ${fontStyle} ${fontColour} ${extraClass}`}>
    {heading}
  </h1>
);

PageHeading.defaultProps = {
  heading: "",
  fontSize: "text-2xl",
  fontStyle: "font-TRegular",
  fontColour: "",
  extraClass: "font-bold",
};

export default PageHeading;
