import { FC, HTMLAttributes } from "react";
import { motion } from "motion/react";

const OnHover: FC<HTMLAttributes<HTMLDivElement> & { scale?: number }> = (props) => {
  return (
    <motion.div
      {...(props as any)}
      initial={{ scale: 1 }}
      animate={{ scale: 1 }}
      transition={{ ease: "easeInOut", duration: 0.5 }}
      whileHover={{ scale: props.scale || 1.1 }}
    />
  );
};
export default OnHover;
