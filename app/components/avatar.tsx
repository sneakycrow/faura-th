interface AvatarProps {
  src: string;
  size?: number;
  border?: string;
}

export const Avatar = ({
  src,
  size = 64,
  border = "border-4 border-coral",
}: AvatarProps) => {
  const baseClasses = ["rounded-full", "min-h-[32px]", "min-w-[32px]"];
  const classes = [...baseClasses, border].join(" ");
  return (
    <img
      src={src}
      alt="User avatar"
      width={size}
      height={size}
      className={classes}
    />
  );
};
