import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion, type MotionProps } from "motion/react";

type PressableProps = MotionProps &
  React.HTMLAttributes<HTMLDivElement> & {
    asChild?: boolean;
  };

const MotionSlot = motion(Slot);

const Pressable = React.forwardRef<HTMLDivElement, PressableProps>(
  (
    { asChild = false, whileHover, whileTap, transition, ...props },
    ref,
  ) => {
    const Comp = asChild ? MotionSlot : motion.div;

    return (
      <Comp
        ref={ref}
        whileHover={whileHover ?? { scale: 1.02 }}
        whileTap={whileTap ?? { scale: 0.98 }}
        transition={
          transition ?? { type: "spring", stiffness: 380, damping: 24 }
        }
        {...props}
      />
    );
  },
);
Pressable.displayName = "Pressable";

export { Pressable };
