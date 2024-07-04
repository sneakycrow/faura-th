import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  tag?: "button" | "a";
  variant?: ButtonVariant;
  className?: string;
  // Add additional properties and they will be spread onto the element
  [key: string]: any;
}

// Special variants for buttons, such as custom branding
export enum ButtonVariant {
  DEFAULT = "",
  SPOTIFY = "bg-[#1DB954]",
}

// A stylized button/anchor component
// This component doesn't check whether you supply an onClick or href, expect that to be handled by the parent
export const Button = ({
  children,
  tag = "button",
  variant = ButtonVariant.DEFAULT,
  className = "",
  ...rest
}: ButtonProps) => {
  // Construct the classes for the button
  const baseClasses =
    "w-[300px] grow-0 px-4 py-4 rounded-sm text-white font-semibold flex flex-nowrap items-center justify-center space-x-2";
  const variantClasses = variant; // This variable mostly exists for clarity
  const classes = [baseClasses, variantClasses, className].join(" ");
  // Construct the element based on the tag
  // Sometimes we want a link that looks like a button
  // For semantics, we should use an anchor tag
  if (tag === "a") {
    return (
      <a className={classes} {...rest}>
        {children}
      </a>
    );
  }
  // Otherwise, we can use a button tag
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
};
