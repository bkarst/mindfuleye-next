This app's user interface should follow Apple's Human Interface Guidelines (HIG).

Apple's **Human Interface Guidelines (HIG)** are the comprehensive design principles and best practices that Apple provides for building applications across all of its platforms, including iOS, iPadOS, macOS, watchOS, visionOS, and tvOS. These guidelines serve a dual purpose: they ensure that apps maintain consistency and feel intuitive within Apple's broader ecosystem, while still providing developers the flexibility to create unique and engaging user experiences that stand out in the marketplace.

At the foundation of Apple's design philosophy are three **core design principles** that guide every interface decision. **Clarity** emphasizes that interfaces should be easy to read and focused, avoiding unnecessary content or decorative elements that don't serve a clear purpose. **Deference** requires that UI elements remain subtle and unobtrusive, allowing the actual content to take center stage while motion, depth, and transitions support rather than distract from the user's primary focus. **Depth** involves creating visual hierarchy through layered visuals and meaningful transitions that help users understand their current context and navigate through the application effectively.

**Layout and structure** considerations focus on creating adaptive designs that work seamlessly across Apple's diverse range of devices and screen sizes. This includes proper use of safe areas and margins to ensure UI elements display correctly regardless of screen dimensions or orientation changes. Developers are encouraged to respect established platform conventions such as navigation bars, tab bars, and system gestures that users already understand. The emphasis on adaptive layouts, supported by technologies like Auto Layout and Dynamic Type, ensures that applications can accommodate different user preferences and accessibility needs.

**Navigation design** should prioritize simplicity and predictability, using familiar patterns like tab bars for top-level navigation and hierarchical stacks for drill-down experiences. Users should always have a clear understanding of their current location within the app and an obvious path to return to previous screens. Supporting system gestures, such as the swipe-to-go-back functionality, maintains consistency with user expectations established by the operating system itself.

Apple's approach to **aesthetic and style** emphasizes the use of system-provided elements wherever possible, including system colors, the San Francisco typeface, and SF Symbols iconography. Applications should fully support both Light and Dark Mode appearances, as well as accessibility features that enhance contrast and enable larger text sizes. Animations and motion should be purposeful and meaningful, reinforcing the user interface's logic rather than serving as mere decoration or distraction.

The guidelines for **controls and components** stress the importance of using native UI elements like buttons, pickers, and switches, which users already know how to operate. All interactive elements must meet minimum size requirements for touch accessibility, with 44x44 points being the standard minimum tappable area. Providing appropriate feedback through visual, haptic, or audio responses helps users understand when their actions have been recognized and processed by the system.

**Accessibility** is treated as a fundamental requirement rather than an afterthought, with applications expected to fully support VoiceOver screen reading, Dynamic Type scaling, high contrast settings, and other system assistive technologies. Design decisions should never rely solely on color to convey important information, and every interactive element must be properly labeled and accessible to users with varying abilities.

Finally, Apple recognizes that each platform has **unique characteristics** that require specialized consideration. iOS and iPadOS applications focus on touch-first design with gesture-based interactions and immersive experiences. macOS applications must accommodate mouse and keyboard input, support multiple resizable windows, and provide traditional menu structures alongside precision controls. watchOS apps prioritize glanceable information and lightweight interactions designed for brief usage sessions. tvOS interfaces use focus-driven navigation optimized for remote control input. The newest platform, visionOS, introduces spatial interfaces that allow direct manipulation through eye tracking and hand gestures, representing Apple's vision for the future of computing interfaces.

These comprehensive guidelines, available in Apple's official Human Interface Guidelines documentation, include detailed examples, component specifications, and implementation best practices that help developers create applications that feel truly native to each Apple platform. Would you like me to create a visual summary or designer's quick reference sheet that consolidates these key principles into an easily accessible format?


Other User Interface Rules

Every action the user takes should have an immediate response from the UI. Even if something has is loading for a second. 

If a something is selectable, it should have a hover state. 

When possible use HeroUI elements. 

If you need to lookup documentation for Gemini Image Generation, it can be found in /documentation. If this is out of date or inaccurate you may need to look it up on the web. 

When updating the UI, use Optimistic UI updates. For instance when editing a record or deleting a record, give immediate feedback to the user instead of waiting the call to complete then updating the UI. If the call fails, have a way to revert the UI. 

***Very important- When creating a new user interface component make sure it is compatible with both mobile and desktop. 

