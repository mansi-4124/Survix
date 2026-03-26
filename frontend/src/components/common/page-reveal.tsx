import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion, type MotionProps, type Transition } from "motion/react";

type PageRevealProps = MotionProps &
  React.HTMLAttributes<HTMLDivElement> & {
    asChild?: boolean;
    once?: boolean;
    revealKey?: string | number;
  };

const MotionSlot = motion(Slot);
const defaultInitial = { opacity: 0, y: 16 };
const defaultAnimate = { opacity: 1, y: 0 };
const defaultTransition: Transition = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1],
};

const PageReveal = React.forwardRef<HTMLDivElement, PageRevealProps>(
  (
    {
      asChild = false,
      once = true,
      revealKey,
      initial,
      animate,
      transition,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? MotionSlot : motion.div;
    const hasMounted = React.useRef(false);
    const lastKeyRef = React.useRef<typeof revealKey>(revealKey);
    const isFirstRender = !hasMounted.current;
    const isNewKey =
      revealKey !== undefined && lastKeyRef.current !== revealKey;
    const shouldAnimate = isFirstRender || isNewKey;

    if (shouldAnimate && once) {
      hasMounted.current = true;
    }
    if (isNewKey) {
      lastKeyRef.current = revealKey;
    }

    const resolvedInitial = shouldAnimate ? initial ?? defaultInitial : false;
    const resolvedTransition: Transition = shouldAnimate
      ? transition ?? defaultTransition
      : { duration: 0 };

    return (
      <Comp
        ref={ref}
        initial={resolvedInitial}
        animate={animate ?? defaultAnimate}
        transition={resolvedTransition}
        {...props}
      />
    );
  },
);
PageReveal.displayName = "PageReveal";

export { PageReveal };
