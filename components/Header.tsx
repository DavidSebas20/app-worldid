"use client";
import CircularIcon from "./CircularIcon";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="relative h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {<h1 className="text-xl font-semibold">CarAudition</h1>}
      <CircularIcon
        imageUrl="/images/logo.png"
        alt="Logo de la aplicación"
        size={40}
        onClick={() => console.log("Logo clicked")}
      />
    </header>
  );
}
