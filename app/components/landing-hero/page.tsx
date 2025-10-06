'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@heroui/react'
import { ChevronRight } from 'lucide-react'
import BackgroundPaths from '@/components/kokonutui/background-paths'


interface LandingHero2Props {
  darkMode?: boolean
}

const LandingHero = ({ darkMode = true }: LandingHero2Props) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.6
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-6 transition-colors duration-300 relative ${
        darkMode ? 'bg-black text-white' : 'bg-white text-gray-900'
      }`}
    >
      <BackgroundPaths />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-4xl mx-auto relative z-10"
      >
        {/* Announcement Badge */}
        <motion.div variants={badgeVariants} className="mb-12">
          <motion.div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
              darkMode
                ? 'bg-black/20 border border-white/10 hover:bg-black/30'
                : 'bg-white/20 border border-black/10 hover:bg-white/30'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className={`w-2 h-2 rounded-full ${
                darkMode ? 'bg-white' : 'bg-gray-900'
              }`}
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              onClick={() => (window.location.href = '/login-signup')}
            />
            <span
              className={`text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              ⚡ The first AI vibe story-telling tool.
            </span>
            <ChevronRight
              className={`w-4 h-4 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            />
          </motion.div>
        </motion.div>

        {/* Main Heading */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1
            className="bg-white p-4 rounded-lg bg-opacity-50
 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
          >
            <motion.span
              className="block tracking-wide "
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Don&apos;t just chat with AI
            </motion.span>
            <motion.span
              className="block tracking-wide bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent p-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Tell a story
            </motion.span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div variants={itemVariants} className="mb-12">
          <p
            className={`text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Design and interact with scenarios that you create.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.div
            variants={buttonVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className={`px-8 py-4 text-lg font-semibold transition-all duration-300 rounded-lg min-w-[140px] backdrop-blur-md ${
                darkMode
                  ? 'bg-white/90 text-black hover:bg-white/95 border border-white/20'
                  : 'bg-black/90 text-white hover:bg-black/95 border border-black/20'
              }`}
              onPress={() => (window.location.href = '/login-signup')}
            >
              Start building
            </Button>
          </motion.div>

          {/* <motion.div variants={buttonVariants}>
            <Button
              size="lg"
              variant="bordered"
              className="px-8 py-4 text-lg font-semibold border-gray-600 text-white hover:border-gray-400 hover:bg-gray-800/20 transition-all duration-300 rounded-lg min-w-[140px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              endContent={<ChevronRight className="w-4 h-4" />}
            >
              Learn more
            </Button>
          </motion.div> */}
        </motion.div>

        {/* Floating Elements for Visual Interest */}
        <motion.div
          className={`absolute top-1/4 left-1/4 w-2 h-2 rounded-full ${
            darkMode ? 'bg-white/20' : 'bg-gray-900/20'
          }`}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className={`absolute top-1/3 right-1/4 w-1 h-1 rounded-full ${
            darkMode ? 'bg-white/30' : 'bg-gray-900/30'
          }`}
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
        />
        <motion.div
          className={`absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full ${
            darkMode ? 'bg-white/25' : 'bg-gray-900/25'
          }`}
          animate={{
            y: [0, -10, 0],
            opacity: [0.25, 0.5, 0.25]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2
          }}
        />
      </motion.div>
    </div>
  )
}

export default LandingHero