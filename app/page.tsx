"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { ChevronRight } from "lucide-react";
import LoggedOutHeader from "./components/logged-out-header";
import FAQSection from "./components/faq-section";
import KeyFeaturesSection from "./components/key-features-section";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <LoggedOutHeader />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-6xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-blue-500"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Ask the Right Questions. Protect Their
                Future.
              </span>
            </motion.div>
          </motion.div>

          {/* Main Headline */}
          <motion.div variants={itemVariants} className="mb-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
              <span className="block text-gray-900 dark:text-white mb-2">
                Become the Vigilant Parent Your Child Needs.
              </span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.div variants={itemVariants} className="mb-12">
            <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-600 dark:text-gray-400">
              Dont let the school capture Your Childs Mind
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
                endContent={<ChevronRight className="w-5 h-5" />}
              >
                Start Free Trial
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Problem-Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white"
          >
            Don&apos;t Discover Problems Too Late
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            Too many parents discover problems too late - whether it&apos;s
            inappropriate classroom content, bullying, emotional struggles, or
            academic challenges. Without a systematic approach, critical warning
            signs get missed in the chaos of daily life. Mindful Eye solves this
            by creating a simple weekly rhythm of reflection and action,
            ensuring nothing important slips through the cracks.
          </motion.p>
        </motion.div>
      </section>

      {/* Features Section */}
      <KeyFeaturesSection />

      {/* Why Mindful Eye Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white"
          >
            Why Mindful Eye?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed"
          >
            Unlike generic parenting apps that focus on screen time or grades,
            Mindful Eye is specifically designed for parents who want to take an
            active role in protecting their children&apos;s education and
            values. We provide the structure and accountability that transforms
            good intentions into consistent action.
          </motion.p>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-white"
          >
            Start Protecting Your Family Today
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed"
          >
            Join thousands of parents who are taking control of their
            children&apos;s education and wellbeing.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="px-8 py-6 text-lg font-semibold bg-white text-purple-600 hover:bg-gray-100 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
              endContent={<ChevronRight className="w-5 h-5" />}
            >
              Sign Up for Free Trial
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
