
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNav } from "../../hooks/useNav";
import { showToast } from "../UI/Toast";
import { useAccount } from "wagmi";

import {
  FiArrowUpRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiLock,
  FiPlus,
  FiZap,
} from "react-icons/fi";

import HappyBountyLogo from "../../assets/images/happy-bounty-logo.png";
import ArcLogo from "../../assets/images/arc.png";
import BotchainLogo from "../../assets/images/bot.png";

import { formatAmount } from "../../utils/format";
import { getNativeToken } from "../../utils/chains.address";
import { supportedChains } from "../../rainbowChains";

const BountyCard = ({
  bounty,
  enrolledBountyIds = [],
  dark = false,
}) => {
  const { handleNavigate } = useNav();
  const { address, isConnected } = useAccount();

  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolledLocal, setIsEnrolledLocal] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const bountyId = bounty._id || bounty.id;

  const enrolledFromServer = enrolledBountyIds.some(
    (id) => String(id) === String(bountyId)
  );

  const isEnrolled = enrolledFromServer || isEnrolledLocal;

  const isCreator =
    Boolean(isConnected && address && bounty.creator) &&
    bounty.creator.toLowerCase() === address?.toLowerCase();

  const muted = dark ? "text-white/65" : "text-[#626B64]";
  const secondary = dark ? "text-white/75" : "text-[#424A43]";

  const innerSurface = dark
    ? "border-white/[0.10] bg-white/[0.035]"
    : "border-black/[0.08] bg-[#F8FAF8]";

  const subtleSurface = dark
    ? "border-white/[0.10] bg-white/[0.04]"
    : "border-black/[0.08] bg-[#F6F8F6]";

  const deriveStatus = () => {
    if (bounty.status) return bounty.status;

    if (bounty.lifecycleStatus === "completed") return "completed";
    if (bounty.lifecycleStatus === "cancelled") return "cancelled";

    const now = new Date();
    const start = bounty.startDate ? new Date(bounty.startDate) : null;
    const deadline = bounty.deadline
      ? new Date(bounty.deadline)
      : null;

    if (start && !Number.isNaN(start.getTime()) && now < start) {
      return "upcoming";
    }

    if (
      deadline &&
      !Number.isNaN(deadline.getTime()) &&
      now <= deadline
    ) {
      return "active";
    }

    if (deadline && !Number.isNaN(deadline.getTime())) {
      return "ended";
    }

    return "active";
  };

  const status = deriveStatus();

  const statusConfig = {
    active: {
      label: "Open",
      icon: FiZap,
      dot: "bg-[#00A87D]",
    },
    upcoming: {
      label: "Upcoming",
      icon: FiClock,
      dot: "bg-amber-500",
    },
    ended: {
      label: "Ended",
      icon: FiLock,
      dot: "bg-slate-400",
    },
    completed: {
      label: "Completed",
      icon: FiCheckCircle,
      dot: "bg-[#00A87D]",
    },
    cancelled: {
      label: "Cancelled",
      icon: FiLock,
      dot: "bg-red-500",
    },
  }[status] || {
    label: "Draft",
    icon: FiClock,
    dot: "bg-slate-400",
  };

  const StatusIcon = statusConfig.icon;

  const getDeadline = () => {
    if (!bounty.deadline) return "No deadline";

    const date = new Date(bounty.deadline);

    if (Number.isNaN(date.getTime())) return "No deadline";

    const sameYear = date.getFullYear() === new Date().getFullYear();

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      ...(sameYear ? {} : { year: "numeric" }),
    });
  };

  const getTimeRemaining = (deadlineValue) => {
    if (!deadlineValue) return null;

    const end = new Date(deadlineValue);

    if (Number.isNaN(end.getTime())) return null;

    const diffMs = end.getTime() - Date.now();

    if (diffMs <= 0) return { past: true };

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    const days = Math.floor(diffMs / day);
    const hours = Math.floor((diffMs % day) / hour);
    const minutes = Math.floor((diffMs % hour) / minute);

    if (days >= 2) {
      return { label: `${days} days left`, urgent: false };
    }

    if (days === 1) {
      return { label: "1 day left", urgent: true };
    }

    if (hours >= 1) {
      return {
        label: `${hours}h ${minutes}m left`,
        urgent: true,
      };
    }

    return {
      label: `${Math.max(1, minutes)}m left`,
      urgent: true,
    };
  };

  const deadline = getDeadline();
  const timeRemaining = getTimeRemaining(bounty.deadline);
  const tags = Array.isArray(bounty.tags) ? bounty.tags : [];

  // Detect the bounty's network using its chain ID.
  const network = supportedChains.find(
    (chain) => chain.id === Number(bounty.network)
  );

  const networkName =
    network?.name ||
    (bounty.network ? `Chain ${bounty.network}` : "");

  // Select the appropriate network logo.
  const normalizedNetworkName = String(networkName).toLowerCase();

  const networkLogo = normalizedNetworkName.includes("arc")
    ? ArcLogo
    : normalizedNetworkName.includes("botchain")
      ? BotchainLogo
      : null;

  const tokenSymbol =
    bounty.token ||
    getNativeToken(bounty.network)?.symbol ||
    "native token";

  const rewardDisplay = `${formatAmount(bounty.reward)} ${tokenSymbol}`;

  const description =
    bounty.description?.trim() || "No description provided.";

  const winnerType =
    bounty.winnerType ||
    bounty.winnerSelection ||
    bounty.selectionType ||
    "";

  const formattedWinnerType = String(winnerType)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim();

  const rawImage =
    bounty.imageUrl ||
    bounty.imageURL ||
    bounty.coverImage ||
    bounty.coverImageUrl ||
    bounty.bannerImage ||
    bounty.bannerUrl ||
    bounty.thumbnailUrl ||
    bounty.thumbnail ||
    bounty.image ||
    bounty.images?.[0] ||
    bounty.media?.url ||
    bounty.metadata?.image ||
    bounty.metadata?.imageUrl ||
    null;

  const bountyImage =
    typeof rawImage === "string"
      ? rawImage
      : rawImage?.url ||
        rawImage?.src ||
        rawImage?.secure_url ||
        null;

  const showImage = Boolean(bountyImage) && !imageFailed;

  const handleEnroll = async (e) => {
    e.preventDefault();

    if (!isConnected || !address) {
      showToast.error("Please connect your wallet first");
      return;
    }

    if (isEnrolling) return;

    setIsEnrolling(true);

    const loadingToast = showToast.loading("Enrolling in bounty...");

    try {
      const response = await axios.post(`${API_URL}/user/enrollment`, {
        bountyId: bounty._id,
        user: address,
      });

      if (response.status === 200 || response.status === 201) {
        setIsEnrolledLocal(true);

        showToast.success("Enrolled! Redirecting...", {
          id: loadingToast,
          duration: 2000,
        });

        handleNavigate(`/bounty/${bountyId}`);
      }
    } catch (error) {
      console.error("Enrollment error:", error);

      showToast.error(
        error.response?.status === 400
          ? "You are already enrolled in this bounty"
          : "Failed to enroll. Please try again.",
        {
          id: loadingToast,
          duration: 3000,
        }
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    handleNavigate(`/bounty/${bountyId}`);
  };

  return (
    <article
      className={`
        group relative flex h-[560px] min-w-0 flex-col
        overflow-hidden rounded-[18px]
        border-0
        outline-none ring-0
        transition-all duration-300 ease-out
        hover:-translate-y-1
        ${
          dark
            ? "bg-[#111713] shadow-[0_8px_28px_rgba(0,0,0,0.18)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.3)]"
            : "bg-white shadow-[0_8px_28px_rgba(15,23,42,0.045)] hover:shadow-[0_20px_45px_rgba(15,23,42,0.09)]"
        }
      `}
    >
      {/* Image banner */}
      <div
        className={`relative h-[120px]  shrink-0 overflow-hidden border-0 outline-none ring-0 shadow-none ${
          dark ? "bg-[#07130F]" : "bg-[#CDEFE0]"
        }`}
      >
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
            dark
              ? "bg-gradient-to-br from-[#07130F] via-[#0B2118] to-[#103B2A]"
              : "bg-gradient-to-br from-[#B5E8D2] via-[#D4F3E4] to-[#8EDBB9]"
          }`}
        />

        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
            dark
              ? "bg-[radial-gradient(ellipse_at_75%_20%,rgba(0,214,160,0.35),transparent_48%),radial-gradient(ellipse_at_20%_100%,rgba(0,168,125,0.28),transparent_50%)]"
              : "bg-[radial-gradient(ellipse_at_75%_20%,rgba(0,143,106,0.24),transparent_48%),radial-gradient(ellipse_at_20%_100%,rgba(0,168,125,0.22),transparent_50%)]"
          }`}
        />

        <div
          aria-hidden="true"
          className={`absolute -right-8 -top-16 h-44 w-44 rounded-full border ${
            dark ? "border-[#00D6A0]/30" : "border-[#008F6A]/30"
          }`}
        />

        <div
          aria-hidden="true"
          className={`absolute -right-1 -top-9 h-32 w-32 rounded-full border ${
            dark ? "border-[#00D6A0]/35" : "border-[#008F6A]/35"
          }`}
        />

        <div
          aria-hidden="true"
          className={`absolute right-8 top-5 h-16 w-16 rotate-12 rounded-2xl border ${
            dark
              ? "border-[#00D6A0]/40 bg-[#00D6A0]/10"
              : "border-[#008F6A]/40 bg-[#00A87D]/15"
          }`}
        />

        {showImage && (
          <img
            src={bountyImage}
            alt={bounty.title ? `${bounty.title} cover` : "Bounty cover"}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 z-[1] h-full w-full border-0 object-cover outline-none ring-0 shadow-none transition-transform duration-500 group-hover:scale-[1.04]"
          />
        )}

        {/* Category and status */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
          <span
            title={bounty.category || "Bounty opportunity"}
            className="max-w-[65%] truncate rounded-lg border border-white/20 bg-black/60 px-2 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white backdrop-blur-md"
          >
            {bounty.category || "Bounty opportunity"}
          </span>

          <span
            className={`
              inline-flex shrink-0 items-center gap-1.5 rounded-full
              border px-2.5 py-1.5 text-[10px] font-bold backdrop-blur-md
              ${
                status === "upcoming"
                  ? "border-amber-300/30 bg-black/75 text-amber-200"
                  : status === "cancelled"
                    ? "border-red-300/30 bg-black/75 text-red-200"
                    : status === "ended"
                      ? "border-white/20 bg-black/75 text-white"
                      : "border-[#00D6A0]/40 bg-[#07130F]/90 text-[#55DDB1]"
              }
            `}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-[2] h-12 bg-gradient-to-t from-black/65 to-transparent" />

        {/* Network logo indicator */}
        {networkName && (
          <div className="absolute bottom-2.5 left-3 z-[3]">
            <div
              title={networkName}
              className="inline-flex items-center gap-2 rounded-lg bg-black/65 px-2.5 py-1.5 text-white shadow-lg backdrop-blur-md"
            >
              {networkLogo ? (
                <img
                  src={networkLogo}
                  alt={`${networkName} logo`}
                  className="h-5 w-5 shrink-0 object-contain"
                />
              ) : (
                <FiLayers size={15} className="shrink-0" />
              )}

              <span className="max-w-[120px] truncate text-[11px] font-bold">
                {networkName}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-transparent via-[#00D6A0] to-transparent opacity-80" />

      {/* Centered Happy Bounty logo watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden"
      >
        <img
          src={HappyBountyLogo}
          alt=""
          draggable="false"
          className={`
            h-64 w-64 max-w-[85%] select-none object-contain
            opacity-[0.055] blur-[0.5px]
            transition-transform duration-500
            group-hover:scale-105
            ${dark ? "brightness-150" : "brightness-95"}
          `}
        />

        <div
          className={`
            absolute h-48 w-48 rounded-full blur-[70px]
            ${
              dark
                ? "bg-[#00D6A0]/[0.035]"
                : "bg-[#00A87D]/[0.045]"
            }
          `}
        />
      </div>

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4">
        {/* Bounty title */}
        <Link
          to={`/bounty/${bountyId}`}
          onClick={handleViewDetails}
          title={bounty.title || "Untitled bounty"}
          className="block shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A87D]"
        >
          <h3
            className={`
              line-clamp-2 h-[44px] overflow-hidden text-[16px]
              font-black leading-[22px] tracking-[-0.025em]
              transition-colors duration-200
              ${
                dark
                  ? "text-white group-hover:text-[#55DDB1]"
                  : "text-[#171A17] group-hover:text-[#008F6A]"
              }
            `}
          >
            {bounty.title || "Untitled bounty"}
          </h3>
        </Link>

        {/* Description */}
        <p
          title={description}
          className={`
            mt-2 h-10 shrink-0 overflow-hidden break-words
            text-[12px] leading-5 line-clamp-2
            ${secondary}
          `}
        >
          {description}
        </p>

        {/* Tags */}
        <div className="mt-2 flex h-[23px] shrink-0 items-start gap-1.5 overflow-hidden">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              title={tag}
              className={`
                max-w-[105px] shrink-0 truncate rounded-md border
                px-2 py-1 text-[10px] font-semibold leading-[13px]
                ${
                  dark
                    ? "border-white/[0.09] bg-white/[0.035] text-white/70"
                    : "border-black/[0.07] bg-[#F7F9F7] text-[#505A52]"
                }
              `}
            >
              #{tag}
            </span>
          ))}

          {tags.length > 3 && (
            <span
              title={`${tags.length - 3} more tags`}
              className={`
                shrink-0 rounded-md border px-2 py-1
                text-[10px] font-bold leading-[13px]
                ${
                  dark
                    ? "border-[#00A87D]/20 bg-[#00A87D]/[0.08] text-[#55DDB1]"
                    : "border-[#BDEAD8] bg-[#E6F7F0] text-[#008F6A]"
                }
              `}
            >
              +{tags.length - 3}
            </span>
          )}
        </div>

        {/* Reward and deadline */}
        <div
          className={`
            mt-3 grid min-h-[100px] shrink-0 grid-cols-2
            overflow-hidden rounded-xl border
            ${innerSurface}
          `}
        >
          <div className="flex min-w-0 flex-col justify-center p-3">
            <div className={`mb-2 flex items-center gap-2 ${muted}`}>
              <FiZap className="shrink-0 text-sm text-[#00A87D]" />
              <span className="text-[11px] font-extrabold uppercase tracking-[0.08em]">
                Reward
              </span>
            </div>

            <p
              title={rewardDisplay}
              className={`
                break-words text-[15px] font-black leading-5
                ${dark ? "text-white" : "text-[#171A17]"}
              `}
            >
              {rewardDisplay}
            </p>

            <p className={`mt-1.5 text-[10px] font-medium ${muted}`}>
              Bounty reward
            </p>
          </div>

          <div
            className={`
              flex min-w-0 flex-col justify-center border-l p-3
              ${dark ? "border-white/[0.10]" : "border-black/[0.08]"}
            `}
          >
            <div className={`mb-2 flex items-center gap-2 ${muted}`}>
              <FiCalendar className="shrink-0 text-sm text-[#00A87D]" />
              <span className="text-[11px] font-extrabold uppercase tracking-[0.08em]">
                Deadline
              </span>
            </div>

            <p
              title={deadline}
              className={`
                break-words text-[14px] font-extrabold leading-5
                ${dark ? "text-white" : "text-[#252C26]"}
              `}
            >
              {deadline}
            </p>

            {timeRemaining?.label ? (
              <p
                className={`
                  mt-1.5 break-words text-[10px] font-bold leading-4
                  ${
                    timeRemaining.urgent
                      ? dark
                        ? "text-amber-300"
                        : "text-amber-700"
                      : dark
                        ? "text-[#55DDB1]"
                        : "text-[#008F6A]"
                  }
                `}
              >
                {timeRemaining.label}
              </p>
            ) : timeRemaining?.past &&
              status !== "completed" &&
              status !== "cancelled" ? (
              <p className={`mt-1.5 text-[10px] font-semibold ${muted}`}>
                Deadline passed
              </p>
            ) : (
              <p className={`mt-1.5 text-[10px] font-medium ${muted}`}>
                Closing date
              </p>
            )}
          </div>
        </div>

        {/* Bounty reference and winner type */}
        <div
          className={`
            mt-2.5 flex min-h-[48px] shrink-0 min-w-0
            items-center justify-between gap-2 rounded-lg
            border px-3 py-2
            ${subtleSurface}
          `}
        >
          <div className="flex min-w-0 items-center gap-2">
            <FiLayers className="shrink-0 text-[#00A87D]" size={15} />

            <div className="min-w-0">
              <p
                className={`text-[10px] font-extrabold uppercase tracking-[0.06em] ${muted}`}
              >
                Bounty reference
              </p>

              <p
                title={String(bountyId || "Not available")}
                className={`mt-1 break-all text-[11px] font-bold ${secondary}`}
              >
                {bountyId
                  ? `#${String(bountyId).slice(-8)}`
                  : "Not available"}
              </p>
            </div>
          </div>

          {winnerType && (
            <div
              title={`Winner type: ${formattedWinnerType}`}
              className={`
                flex min-w-0 max-w-[46%] shrink items-center gap-1.5
                rounded-md border px-2 py-1.5
                ${
                  dark
                    ? "border-[#00A87D]/20 bg-[#00A87D]/[0.08]"
                    : "border-[#BDEAD8] bg-[#E6F7F0]"
                }
              `}
            >
              <FiCheckCircle className="shrink-0 text-[#00A87D]" size={12} />

              <span
                className={`
                  truncate text-[10px] font-bold
                  ${dark ? "text-[#55DDB1]" : "text-[#008F6A]"}
                `}
              >
                {formattedWinnerType}
              </span>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="mt-auto grid shrink-0 grid-cols-2 gap-2 pt-3 pb-1">
          <Link
            to={`/bounty/${bountyId}`}
            onClick={handleViewDetails}
            className={`
              group/details inline-flex h-[40px] min-w-0 items-center
              justify-center gap-1.5 rounded-lg border px-2
              text-[11px] font-extrabold transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-[#00A87D]
              ${
                dark
                  ? "border-white/[0.10] bg-white/[0.025] text-white/85 hover:border-[#00A87D]/40 hover:bg-[#00A87D]/[0.08] hover:text-[#55DDB1]"
                  : "border-black/[0.08] bg-white text-[#343C35] hover:border-[#00A87D]/35 hover:bg-[#F0FAF6] hover:text-[#008F6A]"
              }
            `}
          >
            <span className="truncate">View details</span>
            <FiArrowUpRight
              size={14}
              className="shrink-0 transition-transform group-hover/details:-translate-y-0.5 group-hover/details:translate-x-0.5"
            />
          </Link>

          {isCreator ? (
            <Link
              to={`/bounty/${bountyId}`}
              onClick={handleViewDetails}
              className="
                inline-flex h-[40px] min-w-0 items-center justify-center
                gap-1.5 rounded-lg bg-[#00A87D] px-2 text-[11px]
                font-extrabold text-white transition-all
                hover:bg-[#008F6A]
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-[#00A87D]
              "
            >
              <FiLayers className="shrink-0" size={14} />
              <span className="truncate">Manage</span>
            </Link>
          ) : isEnrolled ? (
            <div
              className={`
                inline-flex h-[40px] min-w-0 items-center justify-center
                gap-1.5 rounded-lg border px-2 text-[11px] font-extrabold
                ${
                  dark
                    ? "border-[#00A87D]/25 bg-[#00A87D]/[0.09] text-[#55DDB1]"
                    : "border-[#BDEAD8] bg-[#E6F7F0] text-[#008F6A]"
                }
              `}
            >
              <FiCheckCircle className="shrink-0" size={14} />
              <span className="truncate">Enrolled</span>
            </div>
          ) : status === "active" ? (
            <button
              type="button"
              onClick={handleEnroll}
              disabled={isEnrolling}
              aria-busy={isEnrolling}
              className="
                inline-flex h-[40px] min-w-0 items-center justify-center
                gap-1.5 rounded-lg bg-[#00A87D] px-2 text-[11px]
                font-extrabold text-white transition-all
                hover:bg-[#008F6A]
                hover:shadow-[0_8px_20px_rgba(0,168,125,0.18)]
                active:scale-[0.98]
                disabled:cursor-not-allowed disabled:opacity-55
                focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-[#00A87D]
              "
            >
              {isEnrolling ? (
                <>
                  <span className="h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  <span className="truncate">Joining...</span>
                </>
              ) : (
                <>
                  <FiPlus className="shrink-0" size={14} />
                  <span className="truncate">Join bounty</span>
                </>
              )}
            </button>
          ) : (
            <div
              className={`
                inline-flex h-[40px] min-w-0 items-center justify-center
                gap-1.5 rounded-lg border px-2 text-[11px] font-extrabold
                ${
                  dark
                    ? "border-white/[0.08] bg-white/[0.035] text-white/55"
                    : "border-black/[0.07] bg-[#F4F6F4] text-slate-500"
                }
              `}
            >
              <StatusIcon className="shrink-0" size={14} />

              <span className="truncate">
                {status === "completed"
                  ? "Completed"
                  : status === "cancelled"
                    ? "Cancelled"
                    : status === "ended"
                      ? "Ended"
                      : "Coming soon"}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default BountyCard;
