import { motion } from 'framer-motion';

/**
 * PageTransition — wraps a page with enter/exit fade+slide.
 * Used inside AnimatePresence in App.tsx.
 */
const pageVariants = {
    initial: { opacity: 0, y: 20 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, transition: { duration: 0 } },
};

const PageTransition = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
    >
        {children}
    </motion.div>
);

export default PageTransition;
