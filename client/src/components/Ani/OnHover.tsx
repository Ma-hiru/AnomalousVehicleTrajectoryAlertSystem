import { FC, HTMLAttributes } from "react";
import { motion } from "motion/react";

const OnHover: FC<
  HTMLAttributes<HTMLDivElement> & { scale?: number; defaultScale?: number; duration?: number }
> = (props) => {
  return (
    <motion.div
      {...(props as any)}
      initial={{ scale: props.defaultScale || 1 }}
      animate={{ scale: props.defaultScale || 1 }}
      transition={{ ease: "easeInOut", duration: props.duration || 0.5 }}
      whileHover={{ scale: props.scale || 1.1 }}
    />
  );
};
export default OnHover;
