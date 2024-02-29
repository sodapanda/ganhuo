import React from "react";
import { Welcome } from "../components/Welcome/Welcome";
import { ColorSchemeToggle } from "../components/ColorSchemeToggle/ColorSchemeToggle";
import { DatePicker, DatesProvider } from '@mantine/dates';

export default function HomePage() {
  return (
    <>
      <Welcome />
      <ColorSchemeToggle />
      <DatesProvider settings={{ consistentWeeks: true }}>
        <DatePicker />
      </DatesProvider>
    </>
  );
}
