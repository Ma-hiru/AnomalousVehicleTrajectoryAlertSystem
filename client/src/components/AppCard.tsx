import { FC, HTMLAttributes, memo } from "react";
import BasicCard from "@/components/BasicCard.vue";
import { applyPureVueInReact } from "veaury";
import { motion } from "motion/react";

const Card = applyPureVueInReact(BasicCard) as FC<any>;
const AppCard: FC<HTMLAttributes<HTMLDivElement>> = (props) => {
  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }} style={{ overflow: "hidden", borderRadius: "1rem" }}>
        <Card {...props} />
      </motion.div>
    </>
  );
};
export default memo(AppCard);
