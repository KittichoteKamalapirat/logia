import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function Container({ children }: Props) {
  return (
    <div className="flex-col px-4 py-1 h-full min-h-screen mt-10 md:max-w-6xl mx-auto">
      {children}
    </div>
  );
}
