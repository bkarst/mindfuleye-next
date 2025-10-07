"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";

export default function LoggedOutHeader() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Text */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Mindful Eye Logo"
              width={40}
              height={40}
              className="w-10 h-10"
              priority
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white font-herculanum">
              Mindful Eye
            </span>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="light"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
              onPress={() => (window.location.href = "/login-signup?action=login")}
            >
              Login
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:opacity-90 font-medium"
              onPress={() => (window.location.href = "/login-signup?action=signup")}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
