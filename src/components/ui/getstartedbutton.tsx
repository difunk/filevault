"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./button";

export function GetStartedButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      variant="primary"
      size="lg"
      type="submit"
      disabled={pending}
      className="text-base font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
    >
      {pending ? "Loading..." : "Get Started"}
    </Button>
  );
}
