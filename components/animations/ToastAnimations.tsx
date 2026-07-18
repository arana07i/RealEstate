"use client";

import { motion } from "framer-motion";

export function ToastSuccess({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.3, type: "spring" }}
      className="pointer-events-auto flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-3 shadow-lg dark:bg-emerald-900/30"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500"
      >
        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>
      <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{message}</span>
    </motion.div>
  );
}

export function ToastError({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.3, type: "spring" }}
      className="pointer-events-auto flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3 shadow-lg dark:bg-red-900/30"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500"
      >
        <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.div>
      <span className="text-sm font-medium text-red-800 dark:text-red-200">{message}</span>
    </motion.div>
  );
}