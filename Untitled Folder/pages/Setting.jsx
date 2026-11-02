// import { Link } from "react-router-dom";

// export default function SettingsPage() {
//   return (
//     <div className="min-h-screen bg-black text-white px-6 py-10">
      
//       {/* BACK */}
//       <Link
//         to="/"
//         className="
//           inline-block
//           mb-8
//           rounded-xl
//           border
//           border-white/10
//           bg-white/5
//           px-4
//           py-2
//           text-pink-400
//           transition
//           hover:bg-pink-500/10
//           hover:border-pink-500/30
//         "
//       >
//         ← Back
//       </Link>

//       {/* HEADER */}
//       <div className="mb-10">
//         <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-pink-400">
//           Account Settings
//         </p>

//         <h1 className="text-4xl font-bold">
//           Settings
//         </h1>

//         <p className="mt-3 text-gray-400">
//           Manage your account preferences, appearance, and wallet settings.
//         </p>
//       </div>

//       {/* PROFILE */}
//       <div
//         className="
//           mb-6
//           rounded-2xl
//           border
//           border-pink-500/20
//           bg-white/5
//           p-6
//           transition
//           hover:border-pink-500/40
//           hover:bg-white/10
//         "
//       >
//         <h2 className="mb-3 text-xl font-semibold text-pink-400">
//           Profile
//         </h2>

//         <p className="text-gray-300">
//           Manage your personal information and account details.
//         </p>

//         <span className="mt-4 inline-block rounded-lg bg-white/5 px-3 py-1 text-xs text-gray-500">
//           Coming Soon
//         </span>
//       </div>

//       {/* APPEARANCE */}
//       <div
//         className="
//           mb-6
//           rounded-2xl
//           border
//           border-pink-500/20
//           bg-white/5
//           p-6
//           transition
//           hover:border-pink-500/40
//           hover:bg-white/10
//         "
//       >
//         <h2 className="mb-3 text-xl font-semibold text-pink-400">
//           Appearance
//         </h2>

//         <p className="mb-4 text-gray-300">
//           Customize your theme and display preferences.
//         </p>

//         <span className="inline-block rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-500">
//           Coming Soon
//         </span>
//       </div>

//       {/* WALLET */}
//       <div
//         className="
//           mb-6
//           rounded-2xl
//           border
//           border-pink-500/20
//           bg-white/5
//           p-6
//           transition
//           hover:border-pink-500/40
//           hover:bg-white/10
//         "
//       >
//         <h2 className="mb-3 text-xl font-semibold text-pink-400">
//           Wallet
//         </h2>

//         <p className="mb-5 text-gray-300">
//           Connect your wallet to access Web3 features and bounties.
//         </p>

//         <Link
//           to="/ConnectConfig"
//           className="
//             inline-block
//             rounded-xl
//             bg-pink-500
//             px-5
//             py-3
//             font-semibold
//             text-white
//             transition
//             hover:bg-pink-400
//             active:scale-95
//           "
//         >
//           Connect Wallet
//         </Link>
//       </div>

//       {/* FOOTER */}
//       <div className="mt-10 text-center text-xs text-gray-600">
//         Happy Bounty Settings
//       </div>
//     </div>
//   );
// }