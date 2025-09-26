// // src/components/BehanceEmbed.js
// import React from 'react';

// const BehanceEmbed = () => {
//     // Extracted directly from your provided iframe code
//     const src = "https://www.behance.net/embed/project/219180537?ilo0=1";
//     const originalHeight = 316;
//     const originalWidth = 404;

//     // Calculate aspect ratio for responsive embedding
//     // (height / width) * 100%
//     const aspectRatioPercentage = (originalHeight / originalWidth) * 100; // ≈ 78.2% for 316/404

//     return (
//         // This div ensures the iframe is responsive and maintains its aspect ratio
//         // The padding-bottom trick uses Tailwind's arbitrary value support
//         <div
//             className="relative w-full overflow-hidden"
//             style={{ paddingBottom: `${aspectRatioPercentage}%` }}
//         >
//             <iframe
//                 className="absolute top-0 left-0 w-full h-full"
//                 src={src}
//                 title="Behance Project Embed" // Important for accessibility
//                 allow="clipboard-write"
//                 allowFullScreen // React uses allowFullScreen for allowfullscreen
//                 frameBorder="0" // React uses frameBorder for frameborder
//                 loading="lazy" // Use native lazy loading
//                 referrerPolicy="strict-origin-when-cross-origin"
//                 // No need for height/width here as the parent div controls dimensions
//             ></iframe>
//         </div>
//     );
// };

// export default BehanceEmbed;