import { ReactNode } from "react";
import Container from "../containers/Container";
import { Footer } from "../Footer";
import Navbar from "../Navbar";

interface Props {
  children: ReactNode;
  justifyContent?:
    | "justify-start"
    | "justify-end"
    | "justify-center"
    | "justify-between"
    | "justify-around"
    | "justify-evenly";
  alignItems?:
    | ""
    | "items-start"
    | "items-end"
    | "items-center"
    | "items-baseline"
    | "items-stretch";
  extraStyle?: string;
}
const Layout = ({
  children,
  justifyContent = "justify-center",
  alignItems = "",
  extraStyle = "",
}: Props) => {
  return (
    <div className="pt-20 bg-grey-0 text-grey-900 h-min-screen ">
      <Navbar />
      <div
        className={`flex-1 h-full w-full ${justifyContent} ${alignItems} ${extraStyle} `}
      >
        <Container>{children}</Container>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
