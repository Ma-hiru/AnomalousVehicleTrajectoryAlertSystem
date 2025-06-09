import { FC, HTMLAttributes } from "react";
import { motion } from "motion/react";

const OnEnter: FC<HTMLAttributes<HTMLDivElement> & { duration?: number }> = (props) => {
  return (
    <motion.div
      {...(props as any)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: "easeInOut", duration: props.duration || 0.5 }}
    />
  );
};
export default OnEnter;
