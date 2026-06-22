"use client";

import { motion } from "framer-motion";

function Bone({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, delay }}
      className={`rounded bg-surface-2 ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div>
      <Bone className="mb-2 h-8 w-40" />
      <Bone className="mb-8 h-4 w-56" delay={0.1} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="rounded-lg border border-hairline bg-surface-1 p-5"
          >
            <Bone className="mb-3 h-4 w-24" delay={i * 0.05} />
            <Bone className="h-8 w-16" delay={i * 0.05 + 0.1} />
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="mt-8 rounded-lg border border-hairline bg-surface-1 p-6"
      >
        <Bone className="mb-4 h-5 w-40" />
        <div className="grid grid-cols-5 gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Bone className="mb-2 h-3 w-16" delay={0.5 + i * 0.05} />
              <Bone className="h-4 w-12" delay={0.6 + i * 0.05} />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
