import HappyBounty from "../../assets/images/happy-bounty-logo.png";
import Themes from "./Themes";
import Connect from "../Connect";
import SignUp from "../SignUp";
import { useAccount } from "wagmi";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiBookOpen,
  FiChevronDown,
  FiFileText,
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

function NavBar() {
  const { dark, setDark } = useTheme();
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [resourcesHovered, setResourcesHovered] = useState(false);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Smoothly scroll to the top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Redirect when connected
  useEffect(() => {
    if (pathname !== "/") return;

    const timer = setTimeout(() => {
      if (address && isConnected) {
        navigate("/dashboard");
        console.log(`Connected account: ${address}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [address, isConnected, pathname, navigate]);

  // Handle logo click
  const handleLogoClick = (event) => {
    if (pathname === "/" || pathname === "/dashboard") {
      event.preventDefault();
      scrollToTop();
    }
  };

  // Detect mobile screen
  const isMobile = () => window.innerWidth < 768;

  // Handle Resources click
  const handleResourcesClick = () => {
    setIsOpen((prev) => !prev);
  };

  // Close dropdown after navigating
  const handleResourceNavigation = () => {
    setIsOpen(false);
    setResourcesHovered(false);
  };

  // Detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Desktop Resources expansion
  const resourcesExpanded = resourcesHovered || isOpen || scrolled;

  return (
    <div
      className={`
        fixed left-0 top-0 z-50 w-full
        transition-all duration-500 ease-out
        ${
          scrolled
            ? "px-4 pt-3 sm:px-6 md:px-8"
            : "px-3 pt-3 sm:px-4 md:px-6 lg:px-8"
        }
      `}
    >
      <nav
        className={`
          relative mx-auto flex
          items-center justify-between
          overflow-visible
          border
          transition-all duration-500 ease-out

          ${
            scrolled
              ? `
                h-[62px]
                max-w-[1180px]
                rounded-full
                px-4
                shadow-[0_12px_40px_rgba(0,0,0,0.10)]
                backdrop-blur-xl
                sm:px-5 md:px-6

                ${
                  dark
                    ? "border-white/[0.08] bg-[#121212]/95 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
                    : "border-black/[0.08] bg-[#F3F5F3]/95"
                }
              `
              : `
                h-[74px]
                max-w-[1500px]
                rounded-[22px]
                border-transparent
                bg-transparent
                px-3
                shadow-none
                sm:px-5 md:px-6
              `
          }
        `}
      >
        {/* GREEN TOP ACCENT */}
        <div
          className={`
            pointer-events-none absolute
            left-1/2 top-0
            h-[2px]
            -translate-x-1/2
            rounded-full
            bg-gradient-to-r
            from-transparent
            via-[#00D6A0]
            to-transparent
            transition-all duration-500
            ${scrolled ? "w-28 opacity-100" : "w-40 opacity-90"}
          `}
        />

        {/* SUBTLE GREEN INNER GLOW */}
        <div
          className={`
            pointer-events-none absolute inset-0
            transition-all duration-500
            ${
              scrolled
                ? `
                  rounded-full
                  bg-gradient-to-b
                  from-[#00D6A0]/[0.035]
                  via-transparent
                  to-transparent
                  opacity-100
                `
                : "rounded-[22px] bg-transparent opacity-0"
            }
          `}
        />

        {/* LOGO */}
        <div className="relative z-10 flex h-full items-center">
          {pathname !== "/dashboard" && pathname !== "/" ? (
            <Link
              to="/dashboard"
              onClick={handleLogoClick}
              className="group flex h-full items-center"
              aria-label="Go to dashboard"
            >
              <img
                className={`
                  w-auto object-contain
                  transition-all duration-500
                  group-hover:scale-[1.04]
                  ${scrolled ? "h-[35px]" : "h-[50px] sm:h-[40px] md:h-[60px]"}
                `}
                src={HappyBounty}
                alt="Happy Bounty"
              />
            </Link>
          ) : (
            <button
              type="button"
              onClick={scrollToTop}
              className="group flex h-full items-center"
              aria-label="Back to top"
            >
              <img
                className={`
                  h-1 w-auto object-contain
                  transition-all duration-500
                  group-hover:scale-[1.04]
                  ${scrolled ? "h-[35px]" : "h-[50px] sm:h-[40px] md:h-[60px]"}
                `}
                src={HappyBounty}
                alt="Happy Bounty"
              />
            </button>
          )}
        </div>

        {/* RIGHT SECTION */}
        <div
          className={`
            relative z-20 flex items-center
            gap-1.5 font-bold
            transition-colors duration-300
            sm:gap-2 md:gap-4
            ${dark ? "text-white" : "text-[#111111]"}
          `}
        >
          {/* RESOURCES */}
          <div
            className="relative"
            onMouseEnter={() => {
              if (!isMobile()) {
                setResourcesHovered(true);
                setIsOpen(true);
              }
            }}
            onMouseLeave={() => {
              if (!isMobile()) {
                setResourcesHovered(false);
                setIsOpen(false);
              }
            }}
          >
            <button
              type="button"
              onClick={handleResourcesClick}
              aria-label="Resources"
              aria-expanded={isOpen}
              className={`
                group flex h-10 items-center
                justify-center
                overflow-hidden
                rounded-full
                border
                text-[13px] font-bold
                transition-all duration-300 ease-out

                ${
                  isOpen
                    ? dark
                      ? "border-[#00D6A0]/40 bg-[#00D6A0]/10 text-white"
                      : "border-[#00D6A0]/30 bg-[#00D6A0]/[0.08] text-[#111111]"
                    : dark
                      ? "border-white/[0.10] bg-[#1a1a1a]/70 text-white hover:border-[#00D6A0]/30 hover:bg-[#00D6A0]/10"
                      : "border-black/[0.06] bg-white/[0.55] text-[#222222] hover:border-[#00D6A0]/25 hover:bg-[#00D6A0]/[0.055]"
                }

                md:px-0

                ${
                  resourcesExpanded
                    ? "md:w-[126px] md:gap-2"
                    : "md:w-10 md:gap-0"
                }

                max-md:w-10
                max-md:gap-0
                max-md:px-0
              `}
            >
              <span
                className={`
                  whitespace-nowrap
                  transition-all duration-300 ease-out
                  ${
                    resourcesExpanded
                      ? "md:max-w-[75px] md:opacity-100"
                      : "md:max-w-0 md:opacity-0"
                  }

                  max-md:hidden
                `}
              >
                Resources
              </span>

              <FiBookOpen className="hidden h-4 w-4 max-md:block" />

              <FiChevronDown
                className={`
                  hidden h-4 w-4
                  shrink-0
                  transition-all duration-300
                  md:block

                  ${
                    isOpen
                      ? "rotate-180 text-[#00D6A0]"
                      : dark
                        ? "text-white/40 group-hover:text-[#00D6A0]"
                        : "text-black/40 group-hover:text-[#00D6A0]"
                  }
                `}
              />
            </button>

            {/* RESOURCES DROPDOWN */}
            <div
              className={`
                absolute right-0 top-full mt-2.5
                w-[230px]
                origin-top-right
                overflow-hidden
                rounded-2xl
                border
                shadow-[0_25px_70px_rgba(0,0,0,0.12)]
                backdrop-blur-2xl
                transition-all duration-200

                ${
                  dark
                    ? "border-white/[0.08] bg-[#121212] shadow-[0_25px_70px_rgba(0,0,0,0.45)]"
                    : "border-black/[0.07] bg-white shadow-[0_25px_70px_rgba(0,0,0,0.12)]"
                }

                ${
                  isOpen
                    ? "visible translate-y-0 scale-100 opacity-100"
                    : "invisible -translate-y-2 scale-[0.98] opacity-0"
                }

                max-md:fixed
                max-md:left-1/2
                max-md:right-auto
                max-md:top-[86px]
                max-md:mt-0
                max-md:w-[calc(100vw-2rem)]
                max-md:max-w-[230px]
                max-md:-translate-x-1/2
              `}
            >
              {/* DROPDOWN HEADER */}
              <div
                className={`
                  border-b px-4 py-3.5
                  ${dark ? "border-white/[0.07]" : "border-black/[0.07]"}
                `}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`
                      text-[10px] font-bold
                      uppercase tracking-[0.18em]
                      ${dark ? "text-white/55" : "text-black/55"}
                    `}
                  >
                    Explore
                  </p>

                  <span
                    className="
                      h-1.5 w-1.5 rounded-full
                      bg-[#00D6A0]
                      shadow-[0_0_10px_rgba(0,214,160,0.45)]
                    "
                  />
                </div>
              </div>

              {/* FAQS */}
              <Link
                to="/faqs"
                onClick={handleResourceNavigation}
                className={`
                  group flex items-center justify-between
                  px-4 py-3.5
                  transition-all duration-200
                  ${
                    dark
                      ? "hover:bg-[#00D6A0]/[0.08]"
                      : "hover:bg-[#00D6A0]/[0.06]"
                  }
                `}
              >
                <div>
                  <span
                    className={`
                      block text-sm font-bold
                      transition-colors duration-200
                      ${
                        dark
                          ? "text-white group-hover:text-[#00D6A0]"
                          : "text-[#222222] group-hover:text-[#00A87D]"
                      }
                    `}
                  >
                    FAQs
                  </span>

                  <span
                    className={`
                      mt-0.5 block text-[10px] font-medium
                      ${
                        dark
                          ? "text-white/45 group-hover:text-white/65"
                          : "text-black/45 group-hover:text-black/65"
                      }
                    `}
                  >
                    Frequently asked questions
                  </span>
                </div>

                <FiArrowRight
                  className={`
                    h-4 w-4 transition-all duration-200
                    group-hover:translate-x-1
                    group-hover:text-[#00D6A0]
                    ${dark ? "text-white/25" : "text-black/25"}
                  `}
                />
              </Link>

              {/* DOCUMENTATION */}
              <Link
                to="/docs"
                onClick={handleResourceNavigation}
                className={`
                  group flex items-center justify-between
                  border-t px-4 py-3.5
                  transition-all duration-200
                  ${
                    dark
                      ? "border-white/[0.07] hover:bg-[#00D6A0]/[0.08]"
                      : "border-black/[0.06] hover:bg-[#00D6A0]/[0.06]"
                  }
                `}
              >
                <div>
                  <span
                    className={`
                      block text-sm font-bold
                      transition-colors duration-200
                      ${
                        dark
                          ? "text-white group-hover:text-[#00D6A0]"
                          : "text-[#222222] group-hover:text-[#00A87D]"
                      }
                    `}
                  >
                    Documentation
                  </span>

                  <span
                    className={`
                      mt-0.5 block text-[10px] font-medium
                      ${
                        dark
                          ? "text-white/45 group-hover:text-white/65"
                          : "text-black/45 group-hover:text-black/65"
                      }
                    `}
                  >
                    Guides and platform information
                  </span>
                </div>

                <FiFileText
                  className={`
                    h-4 w-4 transition-all duration-200
                    group-hover:translate-x-1
                    group-hover:text-[#00D6A0]
                    ${dark ? "text-white/25" : "text-black/25"}
                  `}
                />
              </Link>

              {/* WHITE PAPER */}
              <Link
                to="/whitepaper"
                onClick={handleResourceNavigation}
                className={`
                  group flex items-center justify-between
                  border-t px-4 py-3.5
                  transition-all duration-200
                  ${
                    dark
                      ? "border-white/[0.07] hover:bg-[#00D6A0]/[0.08]"
                      : "border-black/[0.06] hover:bg-[#00D6A0]/[0.06]"
                  }
                `}
              >
                <div>
                  <span
                    className={`
                      block text-sm font-bold
                      transition-colors duration-200
                      ${
                        dark
                          ? "text-white group-hover:text-[#00D6A0]"
                          : "text-[#222222] group-hover:text-[#00A87D]"
                      }
                    `}
                  >
                    White Paper
                  </span>

                  <span
                    className={`
                      mt-0.5 block text-[10px] font-medium
                      ${
                        dark
                          ? "text-white/45 group-hover:text-white/65"
                          : "text-black/45 group-hover:text-black/65"
                      }
                    `}
                  >
                    Learn how Happy Bounty works
                  </span>
                </div>

                <FiArrowRight
                  className={`
                    h-4 w-4 transition-all duration-200
                    group-hover:translate-x-1
                    group-hover:text-[#00D6A0]
                    ${dark ? "text-white/25" : "text-black/25"}
                  `}
                />
              </Link>

              {/* CONTACT */}
              <Link
                to="/contact"
                onClick={handleResourceNavigation}
                className={`
                  group flex items-center justify-between
                  border-t px-4 py-3.5
                  transition-all duration-200
                  ${
                    dark
                      ? "border-white/[0.07] hover:bg-[#00D6A0]/[0.08]"
                      : "border-black/[0.06] hover:bg-[#00D6A0]/[0.06]"
                  }
                `}
              >
                <div>
                  <span
                    className={`
                      block text-sm font-bold
                      transition-colors duration-200
                      ${
                        dark
                          ? "text-white group-hover:text-[#00D6A0]"
                          : "text-[#222222] group-hover:text-[#00A87D]"
                      }
                    `}
                  >
                    Contact
                  </span>

                  <span
                    className={`
                      mt-0.5 block text-[10px] font-medium
                      ${
                        dark
                          ? "text-white/45 group-hover:text-white/65"
                          : "text-black/45 group-hover:text-black/65"
                      }
                    `}
                  >
                    Get in touch with the team
                  </span>
                </div>

                <FiArrowRight
                  className={`
                    h-4 w-4 transition-all duration-200
                    group-hover:translate-x-1
                    group-hover:text-[#00D6A0]
                    ${dark ? "text-white/25" : "text-black/25"}
                  `}
                />
              </Link>
            </div>
          </div>

          {/* DIVIDER */}
          <div
            className={`
              mx-1 hidden h-7 w-px
              bg-gradient-to-b
              from-transparent
              to-transparent
              sm:block
              ${dark ? "via-white/[0.18]" : "via-black/[0.15]"}
            `}
          />

          {/* CONNECT / SIGN UP */}
          <div
            className="
              flex shrink-0 items-center
              [&>button]:shrink-0
            "
          >
            {!isConnected && pathname === "/" ? <SignUp /> : <Connect />}
          </div>

          {/* DARK / LIGHT MODE */}
          <div>
            <Themes dark={dark} setDark={setDark} />
          </div>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;
