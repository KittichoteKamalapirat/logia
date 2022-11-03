import { IoMdClose } from "react-icons/io";

import { render, screen } from "@testing-library/react";
import IconButton from "../IconButton";

describe("IconButton", () => {
  test("renders component", () => {
    render(
      <IconButton label="test" onClick={() => undefined} icon={<IoMdClose />} />
    );

    const button = screen.getByLabelText("test");
    const icon = screen.getByLabelText("close");
    expect(button).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
  });
});
